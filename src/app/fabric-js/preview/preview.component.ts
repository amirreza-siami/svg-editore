import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as fabric from 'fabric';
import { NgIf } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FabricObject } from 'fabric';
import {ɵFormGroupValue, ɵTypedOrUntyped} from '@angular/forms';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.css'
})
export class PreviewComponent implements OnChanges {

  @Input({ required: true }) canvas!: fabric.Canvas;
  @Input() colorActionSelectedFabricObjs: FabricObject[] = [];
  @Input() colorActionForm!: ɵTypedOrUntyped<any, ɵFormGroupValue<any>, any>;

  svgContent: SafeHtml = '';
  private rawSVG: string = '';
  private originalColors: Map<FabricObject, string> = new Map();
  private intervalId: any;

  constructor(
    private sanitizer: DomSanitizer
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['canvas']) this.export()
    if (changes['colorActionSelectedFabricObjs']) this.startColorAction()
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  export() {
    this.canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    this.canvas.setDimensions({ width: this.canvas.getWidth(), height: this.canvas.getHeight() });
    this.rawSVG = this.canvas.toSVG({
      viewBox: {
        x: 0,
        y: 0,
        width: this.canvas.getWidth(),
        height: this.canvas.getHeight(),
      },
    });
    this.svgContent = this.sanitizer.bypassSecurityTrustHtml(this.rawSVG);
  }

  private startColorAction() {
    if (!this.colorActionSelectedFabricObjs.length) return;

    this.colorActionSelectedFabricObjs.forEach(obj => {
      if (!this.originalColors.has(obj)) {
        this.originalColors.set(obj, obj.fill as string || '');
      }
    });

    this.intervalId = setInterval(() => {
      this.colorActionSelectedFabricObjs.forEach(obj => {
        obj.set('fill', this.colorActionForm.color);
        obj.dirty = true;
      });
      this.canvas.renderAll();
      this.export();

      setTimeout(() => {
        this.colorActionSelectedFabricObjs.forEach(obj => {
          const originalColor = this.originalColors.get(obj) || '';
          obj.set('fill', originalColor);
          obj.dirty = true;
        });
        this.canvas.renderAll();
        this.export();
      }, this.colorActionForm.time * 1000);
    }, this.colorActionForm.time * 1000);
  }

}
