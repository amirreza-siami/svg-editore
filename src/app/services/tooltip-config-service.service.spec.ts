import { TestBed } from '@angular/core/testing';

import { TooltipConfigServiceService } from './tooltip-config-service.service';

describe('TooltipConfigServiceService', () => {
  let service: TooltipConfigServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TooltipConfigServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
