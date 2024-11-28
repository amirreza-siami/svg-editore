import {AfterViewInit, Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {FabricJsComponent} from './fabric-js/fabric-js.component';
import {ChangeDetectorRef} from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FabricJsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit {

  constructor(
    private cdr: ChangeDetectorRef
  ) {
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

}
