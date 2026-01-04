import { Component, output } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      <!-- Hero Section -->
      <div class="bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-xl">
        <h1 class="text-3xl md:text-5xl font-bold mb-4">Welcome to AgriBoost</h1>
        <p class="text-green-100 text-lg md:text-xl max-w-2xl">
          Your all-in-one AI agriculture assistant. Make data-driven decisions with real-time market insights, crop advisory, and disease identification.
        </p>
        <button (click)="onNavigate('chat')" 
                class="mt-6 bg-white text-green-700 font-semibold px-6 py-3 rounded-full hover:bg-green-50 transition-colors shadow-md flex items-center gap-2">
          <i class="fas fa-comments"></i> Start AI Chat Assistant
        </button>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <!-- Market -->
        <div (click)="onNavigate('market')" 
             class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group">
          <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i class="fas fa-chart-line text-xl"></i>
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">Market & Prices</h3>
          <p class="text-slate-500 text-sm">Real-time crop price predictions and market trend updates.</p>
        </div>

        <!-- Disease ID -->
        <div (click)="onNavigate('disease')"
             class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group">
          <div class="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i class="fas fa-bug text-xl"></i>
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">Disease Detection</h3>
          <p class="text-slate-500 text-sm">Identify plant diseases instantly using AI vision analysis.</p>
        </div>

        <!-- Advisory -->
        <div (click)="onNavigate('advisory')"
             class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group">
          <div class="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i class="fas fa-seedling text-xl"></i>
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">Smart Advisory</h3>
          <p class="text-slate-500 text-sm">Weather tips, fertilizer recs, and crop suggestions.</p>
        </div>

        <!-- Schemes -->
        <div (click)="onNavigate('schemes')"
             class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group">
          <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i class="fas fa-landmark text-xl"></i>
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">Schemes & Subsidy</h3>
          <p class="text-slate-500 text-sm">Find government support and financial schemes.</p>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DashboardComponent {
  navigate = output<string>();

  onNavigate(route: string) {
    this.navigate.emit(route);
  }
}