import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { SafeHtml } from '@angular/platform-browser';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Moment } from 'moment';

@Component({
  selector: 'app-command',
  templateUrl: './command.component.html',
  imports: [
    NgIf,
    ReactiveFormsModule,
    NgClass,
    CommonModule
  ],
  styleUrl: './command.component.scss'
})
export class CommandComponent {

  @Input() path: string | undefined;
  @Input() gitBranch: string | undefined;
  @Input() gitHasUncommitedChanges: boolean | undefined;
  @Input() showSshMetadata: boolean | undefined;
  @Input() position: string | undefined;
  @Input() positionStartDate: string | undefined;
  @Input() showPrompt: boolean | undefined;
  @Input() promptStartTime : Moment | undefined;
  @Input() command : string | undefined;
  @Input() commandResult: SafeHtml | undefined;

  @Output() onPrompt: EventEmitter<string> = new EventEmitter<string>();

  promptForm: FormGroup;

  constructor(fb: FormBuilder) {
    this.promptForm = fb.group({
      prompt: [''],
    })
  }

  onPromptBlur(_event: FocusEvent, prompt: HTMLInputElement) {
    setTimeout(() => {
      prompt.selectionStart = prompt.value.length;
      prompt.focus();
    }, 500);
  }

  onExecuteCommand() {
    let command = this.promptForm.get<string>('prompt')?.value;

    this.onPrompt.emit(command);

    this.promptForm.setValue({prompt: ''});
  }

}
