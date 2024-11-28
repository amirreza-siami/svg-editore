import { Injectable } from '@angular/core';
import { TooltipConfig } from 'ngx-bootstrap/tooltip';

@Injectable({
  providedIn: 'root'
})
export class TooltipConfigServiceService {

  constructor() { }

  getTooltipConfig(): TooltipConfig {
    const config = new TooltipConfig();
    config.container = 'body';
    return config;
  }

}
