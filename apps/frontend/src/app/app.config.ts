import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';

import {provideMarkdown} from 'ngx-markdown';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideMarkdown()
  ]
};
