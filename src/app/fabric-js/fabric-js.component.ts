import {AfterViewInit, Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
import * as fabric from 'fabric';
import {FabricObject} from 'fabric';
import {NgForOf, NgIf, NgStyle, TitleCasePipe} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FabricObjectType} from './fabric-DTO';
import {PieChartComponent} from '../pie-chart/pie-chart.component';
import {PreviewComponent} from './preview/preview.component';
import {color} from 'chart.js/helpers';

@Component({
  selector: 'app-fabric-js',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    NgStyle,
    NgForOf,
    TitleCasePipe,
    PieChartComponent,
    PreviewComponent
  ],
  templateUrl: './fabric-js.component.html',
  styleUrl: './fabric-js.component.css'
})
export class FabricJsComponent implements AfterViewInit {

  @ViewChild('myCanvas') canvasRef!: ElementRef;
  @ViewChild('myCanvasContainer') canvasContainerRef!: ElementRef;

  protected readonly FabricObjectType = FabricObjectType;
  fabricObjectTypes = Object.values(FabricObjectType);

  canvas!: fabric.Canvas;
  showLoading: boolean = false;
  showModalAddLabel: boolean = false;
  svgLabelForm: FormGroup = new FormGroup({
    label: new FormControl(),
    color: new FormControl('blue'),
    size: new FormControl(12),
  });
  contextMenuItemElm: MouseEvent | undefined = undefined;
  selectedFabric: FabricObject | undefined = undefined;
  selectedFabricForm: FormGroup = new FormGroup({
    fill: new FormControl(),
    stroke: new FormControl(),
    strokeWidth: new FormControl(),
    filter: new FormControl('none'),
    type: new FormControl('none'),
    width: new FormControl(),
    height: new FormControl(),
    radius: new FormControl(),
    text: new FormControl(),
    fontSize: new FormControl(12),
  });
  showChartModal: boolean = false;
  showPreviewModal: boolean = false;
  colorActionForm: FormGroup = new FormGroup({
    color: new FormControl('blue'),
    time: new FormControl(5),
    add: new FormControl(false),
  });
  colorActionSelectedFabricObjs: FabricObject[] = [];

  constructor(
    private renderer: Renderer2
  ) {
  }

  ngAfterViewInit(): void {
    this.canvas = new fabric.Canvas(this.canvasRef.nativeElement);

    this.canvas.upperCanvasEl.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      this.showContextMenu(event);
    });

    this.renderer.listen('document', 'click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#context-menu')) {
        this.closeContextMenu();
      }
    });

    this.canvas.on('mouse:down', (event) => {
      this.selectedFabric = event.target;
      this.initSelectedFabricForm()
    });

    this.canvas.on('mouse:wheel', (opt: fabric.TEvent<Event>) => {
      const delta = (opt.e as WheelEvent).deltaY;
      let zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta; // کاهش حساسیت زوم
      if (zoom > 3) zoom = 3; // حداکثر زوم
      if (zoom < 0.5) zoom = 0.5; // حداقل زوم

      const point = new fabric.Point((opt.e as MouseEvent).offsetX, (opt.e as MouseEvent).offsetY);
      this.canvas.zoomToPoint(point, zoom);

      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    window.addEventListener('resize', () => this.canvasResize());
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files[0]) {
      this.showLoading = true;
      this.reset()

      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const svgContent = reader.result as string;
        this.loadSvgToCanvas(svgContent);
      };

      reader.readAsText(file);
    }
  }

  loadSvgToCanvas(svgContent: string): void {

    fabric.loadSVGFromString(svgContent, (objects, options) => {
      if (!objects) {
        console.error("No objects found in the SVG file.");
        this.showLoading = false;
        return;
      }

      const fabricObjects: fabric.Object[] = [];
      const defaultFill = 'black';

      const getColor = (element: Element): { fill: string, stroke: string } => {
        const fill = element.getAttribute('fill') || defaultFill;
        const stroke = element.getAttribute('stroke') || 'none';
        return {fill, stroke};
      };

      const processElement = (element: any, parentStyles?: {
        fill: string;
        stroke: string
      }): fabric.Object | fabric.Object[] | null => {
        const {fill, stroke} = parentStyles ? parentStyles : getColor(element);

        if (element instanceof SVGPathElement) {
          return new fabric.Path(element.getAttribute('d')!, {
            fill: fill,
            stroke: stroke,
          });
        } else if (element instanceof SVGRectElement) {
          return new fabric.Rect({
            left: parseFloat(element.getAttribute('x')!) || 0,
            top: parseFloat(element.getAttribute('y')!) || 0,
            width: parseFloat(element.getAttribute('width')!) || 0,
            height: parseFloat(element.getAttribute('height')!) || 0,
            fill: fill,
            stroke: stroke,
          });
        } else if (element instanceof SVGCircleElement) {
          return new fabric.Circle({
            left: (parseFloat(element.getAttribute('cx')!) - parseFloat(element.getAttribute('r')!)) || 0,
            top: (parseFloat(element.getAttribute('cy')!) - parseFloat(element.getAttribute('r')!)) || 0,
            radius: parseFloat(element.getAttribute('r')!) || 0,
            fill: fill,
            stroke: stroke,
          });
        } else if (element instanceof SVGGElement) {
          const groupColor = getColor(element);

          const children = Array.from(element.children);
          const processedChildren = children
            .map((child) => processElement(child, groupColor))
            .filter((child): child is fabric.Object => child !== null);

          return processedChildren;
        } else {
          console.warn("Unsupported SVG element:", element);
          return null;
        }
      };

      if (Array.isArray(objects)) {
        objects.forEach((obj) => {
          const processed = processElement(obj);
          if (Array.isArray(processed)) {
            fabricObjects.push(...processed);
          } else if (processed) {
            fabricObjects.push(processed);
          }
        });
      } else {
        const processed = processElement(objects);
        if (Array.isArray(processed)) {
          fabricObjects.push(...processed);
        } else if (processed) {
          fabricObjects.push(processed);
        }
      }

      if (fabricObjects.length === 0) {
        console.error("No valid fabric objects to add to the canvas.");
        this.showLoading = false;
        return;
      }

      const svgObject = fabric.util.groupSVGElements(fabricObjects, options);

      this.canvas.add(svgObject);
      this.showLoading = false;
    });

    this.canvasResize()
  }

  showContextMenu(event: MouseEvent) {
    const menu = document.getElementById('customMenu');
    if (menu) {
      menu.style.display = 'flex';
      menu.style.left = `${event.clientX}px`;
      menu.style.top = `${event.clientY}px`;
    }
    this.contextMenuItemElm = event;
  }

  closeContextMenu() {
    const menu = document.getElementById('customMenu');
    if (menu) {
      menu.style.display = 'none';
    }
  }

  setLabel() {
    const text = new fabric.Text(this.svgLabelForm.getRawValue().label, {
      left: this.contextMenuItemElm?.offsetX,
      top: this.contextMenuItemElm?.offsetY,
      fontFamily: 'Arial',
      fontSize: this.svgLabelForm.getRawValue().size ? this.svgLabelForm.getRawValue().size : 12,
      fill: this.svgLabelForm.getRawValue().color ? this.svgLabelForm.getRawValue().color : 'blue'
    });

    this.canvas.add(text);
    this.canvas.renderAll();
    this.showModalAddLabel = false;
  }

  private initSelectedFabricForm() {
    if (!this.selectedFabric) return;
    this.selectedFabricForm.reset();
    this.changeColorActionItem()
    const patchData: Record<string, any> = {};

    Object.keys(this.selectedFabric).forEach(key => {
      const value = (this.selectedFabric as any)[key];
      patchData[key] = (value && value !== 'none') ? value : '';
    });

    if (this.selectedFabric.type) patchData['type'] = this.selectedFabric.type;

    this.selectedFabricForm.patchValue(patchData);
  }

  private reset() {
    this.canvas.clear();
    this.selectedFabric = undefined;
    this.contextMenuItemElm = undefined;
    this.selectedFabricForm.reset();
    this.svgLabelForm.reset();
  }

  selectedFabricFormSubmit() {
    if (!this.selectedFabric) return;

    const rawValues = this.selectedFabricForm.getRawValue();
    const keys = Object.keys(rawValues);
    const previousType = this.selectedFabric.type;

    for (let key of keys) {
      if (key === 'type' && rawValues[key] !== previousType) {
        this.changeShape(this.selectedFabric, rawValues[key]);
      } else {
        this.selectedFabric.set(key, rawValues[key]);
      }
    }

    this.canvas.renderAll();
  }

  changeShape(activeObject: FabricObject, newType: FabricObjectType.Circle | FabricObjectType.Rect) {
    const options = activeObject.toObject();
    this.canvas.remove(activeObject);
    let newFabricObject: FabricObject = activeObject;

    if (newType === FabricObjectType.Circle) {
      newFabricObject = new fabric.Circle({
        ...options,
        radius: Math.min(activeObject.width!, activeObject.height!) / 2
      });
    } else if (newType === FabricObjectType.Rect) {
      newFabricObject = new fabric.Rect({
        ...options,
        width: activeObject.width,
        height: activeObject.height
      });
    }

    this.canvas.add(newFabricObject);
    this.canvas.setActiveObject(newFabricObject);
    this.selectedFabric = undefined;
  }

  deleteElm() {
    if (!this.selectedFabric) return
    this.canvas.remove(this.selectedFabric)
    this.selectedFabric = undefined;
  }

  colorActionFormSubmitted() {
    if (this.selectedFabric && this.colorActionForm.get('add')?.value === true) this.colorActionSelectedFabricObjs.push(this.selectedFabric)
  }

  private changeColorActionItem() {
    const findItem = this.colorActionSelectedFabricObjs.findIndex(obj => obj === this.selectedFabric)
    this.colorActionForm.patchValue({add: findItem === -1 ? false : true})
  }

  private canvasResize() {
    if (this.canvas && this.canvasContainerRef && this.canvasContainerRef.nativeElement) {
      this.canvas.setWidth(this.canvasContainerRef.nativeElement.clientWidth)
      this.canvas.setHeight(this.canvasContainerRef.nativeElement.clientHeight)

      this.canvas.renderAll();
    }
  }
}
