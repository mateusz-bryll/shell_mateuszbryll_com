import { Component } from '@angular/core';
import moment from 'moment';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  currentYear = moment().year();
}
