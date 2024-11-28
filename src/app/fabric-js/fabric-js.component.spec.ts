import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FabricJsComponent } from './fabric-js.component';

describe('FabricJsComponent', () => {
  let component: FabricJsComponent;
  let fixture: ComponentFixture<FabricJsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FabricJsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FabricJsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
