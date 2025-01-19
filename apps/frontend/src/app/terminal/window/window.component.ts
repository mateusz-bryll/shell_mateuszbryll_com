import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommandComponent } from '../command/command.component';
import { CommandProcessorService } from './command-processor.service';
import { NgFor } from '@angular/common';
import moment, { Moment } from 'moment';
import {FileSystemService, FsEntryExtendedAttributes} from '../file-system';
import {SafeHtml} from '@angular/platform-browser';

interface ExecutedCommand {
  path: string;
  gitBranchName?: string | undefined;
  gitHasUncommitedChanges?: boolean | undefined;
  showSshMetadata?: boolean | undefined;
  position?: string | undefined;
  positionStartDate?: string | undefined;
  promptStartTime : Moment;
  command : string;
  commandResult: SafeHtml;
}

@Component({
  selector: 'app-window',
  imports: [
    CommandComponent,
    NgFor
  ],
  templateUrl: './window.component.html',
  styleUrl: './window.component.scss'
})
export class WindowComponent {
  @ViewChild('buffer') buffer: ElementRef | undefined;

  path: string;
  promptStartTime: Moment;
  executedCommands: Array<ExecutedCommand> = [];
  currentExtendedAttributes: FsEntryExtendedAttributes;

  constructor(private readonly _processor: CommandProcessorService, private readonly _fs: FileSystemService) {
    this.currentExtendedAttributes = this._fs.getCurrentDirectoryAttributes();
    this.path = this._fs.currentPath;
    this.promptStartTime = moment();
  }

  get location() {
    return this._fs.currentPath;
  }

  onPrompt(prompt: string) {
    var executedCommand = this._processor.processPrompt(prompt);
    let commandInfo = {
      path: this.path,
      promptStartTime: this.promptStartTime,
      command: prompt,
      commandResult: executedCommand.result,
      ...this.currentExtendedAttributes
    };

    this.executedCommands.push(commandInfo);
    this.path = this._fs.currentPath;
    this.promptStartTime = moment();
    this.currentExtendedAttributes = executedCommand.newDirectoryAttributes;

    setTimeout(() => {
      this.buffer!.nativeElement.scrollTop = this.buffer!.nativeElement.scrollHeight;
    }, 10)
  }
}
