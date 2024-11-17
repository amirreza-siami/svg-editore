import {Component, ViewChild, ElementRef} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  @ViewChild('canvasElement') canvasRef!: ElementRef;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const svgText = e.target.result;
        this.loadSvgToCanvas(svgText);
      };
      reader.readAsText(file);
    }
  }

  loadSvgToCanvas(svgText: string) {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    // Create a new Image object
    const img = new Image();

    // Convert SVG text to a URL object
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // When the image is loaded, draw it on the canvas
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw the image on canvas
    };

    // Set the image source to the SVG URL
    img.src = svgUrl;
  }

}
