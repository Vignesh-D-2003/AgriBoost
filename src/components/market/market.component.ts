import { Component, ElementRef, inject, signal, viewChild, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { Type } from '@google/genai';
import * as d3 from 'd3';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full overflow-y-auto p-4 md:p-6 space-y-6">
      
      <!-- Header -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 class="text-2xl font-bold text-slate-800 mb-2">Market Intelligence</h2>
        <p class="text-slate-500 mb-4">Analyze crop prices and get AI-driven market forecasts.</p>
        
        <div class="flex gap-2 flex-col md:flex-row">
          <input type="text" [(ngModel)]="cropName" placeholder="Enter Crop Name (e.g., Wheat, Rice, Tomato)"
                 class="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
          <button (click)="fetchMarketData()" 
                  [disabled]="loading() || !cropName"
                  class="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md">
            @if (loading()) {
              <i class="fas fa-spinner fa-spin"></i> Analyzing...
            } @else {
              Analyze
            }
          </button>
        </div>
      </div>

      <!-- Real-time Updates (Grounding) -->
      @if (marketUpdates()) {
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
          <h3 class="font-bold text-lg text-slate-800 mb-3 border-b pb-2 flex items-center gap-2">
            <i class="fas fa-newspaper text-blue-600"></i> Latest Market News & Trends
          </h3>
          <p class="text-slate-700 leading-relaxed whitespace-pre-line">{{ marketUpdates()?.text }}</p>
          
          @if (marketUpdates()?.links?.length) {
            <div class="mt-4 flex flex-wrap gap-2">
              @for (link of marketUpdates()?.links; track $index) {
                @if (link.web?.uri) {
                  <a [href]="link.web.uri" target="_blank" class="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1 border border-blue-100">
                    <i class="fas fa-external-link-alt"></i> {{ link.web.title || 'Source' }}
                  </a>
                }
              }
            </div>
          }
        </div>
      }

      <!-- Chart Section -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
        <h3 class="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
          <i class="fas fa-chart-line text-purple-600"></i> Price Trend Forecast (AI Prediction)
        </h3>
        
        @if (!hasData() && !loading()) {
          <div class="h-64 flex flex-col items-center justify-center text-slate-400">
            <i class="fas fa-chart-area text-5xl mb-3 opacity-50"></i>
            <p>Enter a crop name to view price trends.</p>
          </div>
        }

        <div #chartContainer class="w-full h-[350px]"></div>
      </div>

    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class MarketComponent implements OnDestroy {
  private gemini = inject(GeminiService);
  chartContainer = viewChild<ElementRef>('chartContainer');

  cropName = '';
  loading = signal(false);
  hasData = signal(false);
  
  marketUpdates = signal<{text: string, links: any[]} | null>(null);
  
  private resizeObserver: ResizeObserver | null = null;
  private currentChartData: any = null;

  constructor() {
    // Redraw chart when container resizes
    effect(() => {
      const el = this.chartContainer()?.nativeElement;
      if (el && !this.resizeObserver) {
        this.resizeObserver = new ResizeObserver(() => {
          if (this.currentChartData) {
            this.renderChart(this.currentChartData);
          }
        });
        this.resizeObserver.observe(el);
      }
    });
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  // Schema for chart data
  private chartSchema = {
    type: Type.OBJECT,
    properties: {
      crop: { type: Type.STRING },
      currency: { type: Type.STRING },
      history: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: "Format YYYY-MM-DD" },
            price: { type: Type.NUMBER }
          }
        }
      },
      forecast: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: "Format YYYY-MM-DD" },
            price: { type: Type.NUMBER }
          }
        }
      }
    }
  };

  async fetchMarketData() {
    if (!this.cropName.trim()) return;
    this.loading.set(true);
    this.hasData.set(false);
    this.marketUpdates.set(null);
    this.currentChartData = null;

    // 1. Get Text Updates (Grounding)
    const updatePrompt = `What are the current market prices and trends for ${this.cropName} in India? Include major market yard prices if available.`;
    const updates = await this.gemini.getMarketUpdates(updatePrompt);
    this.marketUpdates.set(updates);

    // 2. Get Chart Data (Simulated/Predicted by AI)
    const chartPrompt = `Generate a realistic price trend dataset for ${this.cropName} for the last 6 months and a forecast for the next 2 months. Use realistic values in INR per Quintal. Return JSON.`;
    const data = await this.gemini.generateJson(chartPrompt, this.chartSchema);
    
    if (data && (data.history || data.forecast)) {
      this.hasData.set(true);
      this.currentChartData = data;
      // Wait for view to update so container exists
      setTimeout(() => this.renderChart(data), 100);
    }
    
    this.loading.set(false);
  }

  renderChart(data: any) {
    const container = this.chartContainer()?.nativeElement;
    if (!container) return;

    d3.select(container).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    if (width <= 0 || height <= 0) return;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Combine history and forecast
    const parseDate = d3.timeParse("%Y-%m-%d");
    
    const historyData = (data.history || []).map((d: any) => ({
      date: parseDate(d.date),
      price: d.price,
      type: 'history'
    }));
    
    const forecastData = (data.forecast || []).map((d: any) => ({
      date: parseDate(d.date),
      price: d.price,
      type: 'forecast'
    }));

    const allData = [...historyData, ...forecastData].sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime());

    // Scales
    const x = d3.scaleTime()
      .domain(d3.extent(allData, d => d.date as Date) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(allData, d => d.price as number) * 1.1])
      .range([height, 0]);

    // Axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(Math.max(width / 80, 2))); // Responsive ticks

    svg.append('g')
      .call(d3.axisLeft(y));

    // Lines
    const line = d3.line<any>()
      .x(d => x(d.date))
      .y(d => y(d.price))
      .curve(d3.curveMonotoneX);

    // Render History Line
    svg.append('path')
      .datum(historyData)
      .attr('fill', 'none')
      .attr('stroke', '#2563eb') // blue-600
      .attr('stroke-width', 3)
      .attr('d', line);

    // Render Forecast Line (Dashed)
    svg.append('path')
      .datum(forecastData)
      .attr('fill', 'none')
      .attr('stroke', '#9333ea') // purple-600
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '6,6')
      .attr('d', line);
      
    // Dots
    svg.selectAll('.dot')
      .data(allData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.price))
      .attr('r', 5)
      .attr('fill', 'white')
      .attr('stroke', d => d.type === 'history' ? '#2563eb' : '#9333ea')
      .attr('stroke-width', 2);
      
    // Tooltip area (simple overlay)
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#64748b")
      .text("History (Blue) vs Forecast (Purple)");
  }
}