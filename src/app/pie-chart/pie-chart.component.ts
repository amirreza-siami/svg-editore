import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BarController, BarElement, CategoryScale, Chart, Legend, LinearScale, Title, Tooltip} from 'chart.js';

Chart.register(LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend, BarController);



@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.css'
})
export class PieChartComponent implements OnInit {

  @ViewChild('chartCanvas', {static: true}) chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  constructor() {
  }

  ngOnInit(): void {
    this.createChart();
  }

  createChart(): void {
    const canvas = this.chartCanvas.nativeElement;

    this.chart = new Chart(canvas, {
      type: 'bar', // نوع نمودار
      data: {
        labels: ['January', 'February', 'March', 'April'], // برچسب‌ها
        datasets: [{
          data: [65, 59, 80, 81],  // داده‌ها
          borderColor: 'rgb(255, 99, 132)',  // رنگ خط
          backgroundColor: 'rgba(255, 99, 132, 0.2)',  // رنگ پس‌زمینه
        }]
      },
      options: {
        scales: {
          y: {
            type: 'linear', // مقیاس خطی
            beginAtZero: true
          }
        },
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      }
    });
  }

}
