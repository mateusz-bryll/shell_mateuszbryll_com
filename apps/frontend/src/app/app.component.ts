import {Component} from '@angular/core';
import {WindowComponent} from './terminal/window/window.component';
import {AboutComponent} from './about/about.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    WindowComponent,
    AboutComponent
  ],
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
