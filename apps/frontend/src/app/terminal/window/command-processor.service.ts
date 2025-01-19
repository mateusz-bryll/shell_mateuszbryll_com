import {Injectable} from '@angular/core';
import {
  FileOperationResult,
  FileSystemService,
  FsEntryExtendedAttributes,
  OutputStringFormat,
  PathOperationResult
} from '../file-system';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {User} from '../file-system/model/user.model';
import {RequestedAccess} from '../file-system/model/permissions.model';
import {MarkdownService} from 'ngx-markdown';
import {SpecialFiles} from '../file-system/services/file-system-api.service';

export interface ExecutedCommand {
  result: SafeHtml;
  newDirectoryAttributes: FsEntryExtendedAttributes
}

enum CommandResult {
  Success = 0,
  Failure = 1,
  AccessDenied = 2,
}

interface Command {
  state: CommandResult;
  outputText: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommandProcessorService {

  constructor(private readonly _fs: FileSystemService, private readonly _sanitizer: DomSanitizer, private readonly _markdown: MarkdownService) { }

  private _user = new User('web', 'web');

  processPrompt(prompt: string): ExecutedCommand {
    let parsedPrompt = this._parsePromptToCommand(prompt);
    if (parsedPrompt.length === 0) {
      return {
        result: '',
        newDirectoryAttributes: this._fs.getCurrentDirectoryAttributes()
      };
    }

    let [command, ...args] = parsedPrompt;
    if (!this._availableCommands.hasOwnProperty(command)) {
      return {
        result: this._sanitize(this._errors.commandNotFound('zsh', command, undefined)),
        newDirectoryAttributes: this._fs.getCurrentDirectoryAttributes()
      }
    }

    let commandFn = this._availableCommands[command];
    let result = commandFn(args);

    switch (+result.state) {
      case CommandResult.Success:
        return {
          result: this._sanitize(result.outputText),
          newDirectoryAttributes: this._fs.getCurrentDirectoryAttributes()
        }
      case CommandResult.Failure:
        return {
          result: this._sanitize(this._errors.commandError(command, prompt, result.outputText)),
          newDirectoryAttributes: this._fs.getCurrentDirectoryAttributes()
        }
      case CommandResult.AccessDenied:
        return {
          result: this._sanitize(this._errors.accessDenied(command, prompt, result.outputText)),
          newDirectoryAttributes: this._fs.getCurrentDirectoryAttributes()
        }
      default:
        return {
          result: '',
          newDirectoryAttributes: this._fs.getCurrentDirectoryAttributes()
        };
    }
  }

  private _sanitize(text: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(text);
  }

  private _errors = {
    accessDenied: (tool: string, command: string, message: string | undefined): string => {
      return `<b> Access denied /bin/${tool}: ${command}</b>` + (!!message ? `\n  ╰─ Details: ${message}` : ``);
    },
    commandNotFound: (tool: string, command: string, message: string | undefined): string => {
      return `<b> Command not found /bin/${tool}: ${command}</b>` + (!!message ? `\n  ╰─ Details: ${message}` : ``);
    },
    commandError: (tool: string, command: string, message: string | undefined): string => {
      return `<b> Command execution failed /bin/${tool}: ${command}</b>` + (!!message ? `\n  ╰─ Details: ${message}` : ``);
    }
  };

  private _availableCommands = {
    'ls': this._ls.bind(this),
    'cd': this._cd.bind(this),
    'whoami': this._whoami.bind(this),
    'groups': this._groups.bind(this),
    'pwd': this._pwd.bind(this),
    'echo': this._echo.bind(this),
    'cat': this._cat.bind(this),
    'sudo': this._sudo.bind(this),
    'man': this._man.bind(this),
    'help': this._help.bind(this),
  } as { [K: string]: (args: Array<string>) => Command };

  private _ls(args: Array<string>): Command {
    if (args.length > 1) {
      return {
        state: CommandResult.Failure,
        outputText: `not supported format of options: ${args.join(' ')}, use -l, -a or -al instead`
      };
    }

    let showHiddenFiles = false;
    let outputFormat = OutputStringFormat.Short;

    if (args.length === 1) {
      let [ parameters ] = args;

      if ( parameters !== '-a' && parameters !== '-l' && parameters !== '-al' && parameters !== '-la') {
        return {
          state: CommandResult.Failure,
          outputText: `not supported options: ${args.join(' ')}, use -l, -a or -al instead`
        };
      }

      showHiddenFiles = parameters.indexOf('a') !== -1;
      outputFormat = parameters.indexOf('l') !== -1 ? OutputStringFormat.List : OutputStringFormat.Short;
    }

    let result = this._fs.getCurrentDirectoryContent(outputFormat, showHiddenFiles);
    return {
      state: CommandResult.Success,
      outputText: result,
    };
  }

  private _cd(args: Array<string>): Command {
    if (args.length > 1) {
      return {
        state: CommandResult.Failure,
        outputText: `multiple parameters not supported`,
      };
    }

    let result = this._fs.changeDirectory(args[0], this._user, RequestedAccess.Read);
    switch (+result.pathOperationResult) {
      case PathOperationResult.Success:
        return {
          state: CommandResult.Success,
          outputText: ''
        };
      case PathOperationResult.NotFound:
        return {
          state: CommandResult.Failure,
          outputText: `directory ${args[0]} not found`
        };
      case PathOperationResult.NotSupported:
        return {
          state: CommandResult.Failure,
          outputText: `directory ${args[0]} not supported`
        };
      case PathOperationResult.Denied:
        return {
          state: CommandResult.AccessDenied,
          outputText: result.accessVerificationResult!.toString()
        };
    }

    return {
      state: CommandResult.Failure,
      outputText: `operation not supported`,
    };
  }

  private _whoami(_args: Array<string>): Command {
    return { state: CommandResult.Success, outputText: this._user.userName };
  }

  private _groups(args: Array<string>): Command {
    if (args.length > 0 && args[0] !== this._user.userName) {
      return {
        state: CommandResult.AccessDenied,
        outputText: `no access to user account: ${args[0]}`
      }
    }

    return {
      state: CommandResult.Success,
      outputText: `${this._user.groupName} everyone com.apple.access_ssh`
    };
  }

  private _pwd(_args: Array<string>): Command {
    return {
      state: CommandResult.Success,
      outputText: this._fs.currentPath
    };
  }

  private _echo(args: Array<string>): Command {
    return {
      state: CommandResult.Success,
      outputText: args.join(' '),
    };
  }

  private _cat(args: Array<string>): Command {
    if (args.length === 0) {
      return {
        state: CommandResult.Failure,
        outputText: `file not specified`,
      };
    }

    if (args.length === 1 && args[0].indexOf('/') !== -1) {
      return {
        state: CommandResult.Failure,
        outputText: `path to file not supported`,
      };
    }

    if (args.length >= 2 && args[1] !== '--render') {
      let [_file, ...parameters] = args;
      return {
        state: CommandResult.Failure,
        outputText: `unsupported parameter(s): ${parameters.join(' ')}`,
      };
    }

    let renderer = (text: string) => text;
    if (args.length === 2 && args[1] === '--render') {
      renderer = (text: string) => (this._markdown.parse(text) as string)
        .replace('<a href=', '<a target="_blank" rel="nofollow" href=');
    }

    let result = this._fs.getFileContent(args[0], this._user, RequestedAccess.Read);
    switch (+result.fileOperationResult) {
      case FileOperationResult.Success:
        return {
          state: CommandResult.Success,
          outputText: renderer(result.content!)
        };
      case FileOperationResult.NotFound:
        return {
          state: CommandResult.Failure,
          outputText: `file ${args[0]} not found`
        };
      case FileOperationResult.Denied:
        return {
          state: CommandResult.AccessDenied,
          outputText: result.accessVerificationResult!.toString()
        };
    }

    return {
      state: CommandResult.Failure,
      outputText: `operation not supported`,
    };
  }

  private _sudo(_args: Array<string>) : Command {
    return {
      state: CommandResult.AccessDenied,
      outputText: `</b>With great power comes great responsibility!\n\t<i>so let admins take that burden off your shoulders...</i>`
    };
  }

  private _man(args: Array<string>): Command {
    if (args.length === 0) {
      return {
        state: CommandResult.Failure,
        outputText: `command not specified`,
      };
    }

    if (args.length !== 1) {
      return {
        state: CommandResult.Failure,
        outputText: `only one command can be specified`,
      };
    }

    let command = args[0];
    let specialFile = `${args[0]}.md` as SpecialFiles;
    let commandNotSupported = !this._availableCommands.hasOwnProperty(command);
    let noHelpFileForCommand = !Object.values(SpecialFiles).includes(specialFile);
    if (commandNotSupported || noHelpFileForCommand) {
      return {
        state: CommandResult.Failure,
        outputText: `command ${command} not found in help resource files`,
      };
    }

    let helpFileContent = this._fs.getSpecialFileContent(specialFile);

    return {
      state: CommandResult.Success,
      outputText: helpFileContent
    };
  }

  private _help(args: Array<string>): Command {
    if (args.length !== 0) {
      return {
        state: CommandResult.Failure,
        outputText: `unsupported parameter(s): ${args.join(' ')}`,
      };
    }

    return {
      state: CommandResult.Success,
      outputText: `This terminal supports only a restricted list of commands: cat, cd, echo, groups, ls, pwd, whoami\nTo see more info about the specific command type: man command`
    }
  }

  private _parsePromptToCommand(prompt: string): string[] {
    let trimmed = prompt.replace(/^\s\s+$/g, ' ');
    return trimmed.split(' ').filter(x => x);
  }
}
