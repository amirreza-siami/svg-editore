import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {PieChartComponent} from './app/pie-chart/pie-chart.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
