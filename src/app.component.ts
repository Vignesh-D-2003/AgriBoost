import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { MarketComponent } from './components/market/market.component';
import { DiseaseComponent } from './components/disease/disease.component';
import { AdvisoryComponent } from './components/advisory/advisory.component';

type Route = 'home' | 'chat' | 'market' | 'disease' | 'advisory' | 'schemes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DashboardComponent, ChatbotComponent, MarketComponent, DiseaseComponent, AdvisoryComponent],
  template: `
    <div class="flex h-screen bg-slate-50 font-sans">
      
      <!-- Desktop Sidebar -->
      <aside class="hidden md:flex w-64 bg-green-900 text-white flex-col shadow-2xl z-20">
        <div class="p-6 flex items-center gap-3 border-b border-green-800 bg-green-950/30">
          <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white shadow-lg">
             <i class="fas fa-leaf text-lg"></i>
          </div>
          <span class="text-xl font-bold tracking-wide">AgriBoost</span>
        </div>
        
        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
          <button (click)="navigate('home')" [class]="getNavClass('home')" class="w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 group">
            <i class="fas fa-home w-6 text-center group-hover:scale-110 transition-transform"></i> Dashboard
          </button>
          <button (click)="navigate('chat')" [class]="getNavClass('chat')" class="w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 group">
            <i class="fas fa-comments w-6 text-center group-hover:scale-110 transition-transform"></i> AI Assistant
          </button>
          <button (click)="navigate('market')" [class]="getNavClass('market')" class="w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 group">
            <i class="fas fa-chart-line w-6 text-center group-hover:scale-110 transition-transform"></i> Market & Prices
          </button>
          <button (click)="navigate('disease')" [class]="getNavClass('disease')" class="w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 group">
            <i class="fas fa-bug w-6 text-center group-hover:scale-110 transition-transform"></i> Crop Doctor
          </button>
          <button (click)="navigate('advisory')" [class]="getNavClass('advisory')" class="w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 group">
            <i class="fas fa-book-open w-6 text-center group-hover:scale-110 transition-transform"></i> Advisor Tools
          </button>
        </nav>

        <div class="p-4 border-t border-green-800 text-xs text-green-300 text-center bg-green-950/30">
          Made for Farmers ❤️<br>AgriBoost AI v1.0
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col h-full overflow-hidden relative">
        <!-- Mobile Header -->
        <div class="md:hidden h-16 bg-green-900 text-white flex items-center px-4 shadow-md shrink-0 justify-between z-20">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white">
              <i class="fas fa-leaf"></i>
            </div>
            <span class="font-bold text-lg">AgriBoost</span>
          </div>
          <button (click)="mobileMenuOpen.set(!mobileMenuOpen())" class="text-green-100 hover:text-white p-2">
            <i class="fas fa-bars text-xl"></i>
          </button>
        </div>

        <!-- Mobile Menu Overlay -->
        @if (mobileMenuOpen()) {
          <div class="absolute inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm" (click)="mobileMenuOpen.set(false)"></div>
          <div class="absolute top-16 left-0 right-0 bg-green-800 text-white z-40 p-2 shadow-xl md:hidden animate-slide-down rounded-b-2xl border-t border-green-700">
            <div class="space-y-1">
              <button (click)="navigate('home')" class="block w-full text-left p-4 hover:bg-green-700 rounded-xl transition-colors font-medium"><i class="fas fa-home mr-3 w-5 text-center"></i> Dashboard</button>
              <button (click)="navigate('chat')" class="block w-full text-left p-4 hover:bg-green-700 rounded-xl transition-colors font-medium"><i class="fas fa-comments mr-3 w-5 text-center"></i> AI Assistant</button>
              <button (click)="navigate('market')" class="block w-full text-left p-4 hover:bg-green-700 rounded-xl transition-colors font-medium"><i class="fas fa-chart-line mr-3 w-5 text-center"></i> Market & Prices</button>
              <button (click)="navigate('disease')" class="block w-full text-left p-4 hover:bg-green-700 rounded-xl transition-colors font-medium"><i class="fas fa-bug mr-3 w-5 text-center"></i> Crop Doctor</button>
              <button (click)="navigate('advisory')" class="block w-full text-left p-4 hover:bg-green-700 rounded-xl transition-colors font-medium"><i class="fas fa-book-open mr-3 w-5 text-center"></i> Advisor Tools</button>
            </div>
          </div>
        }

        <!-- Views -->
        <div class="flex-1 overflow-hidden relative bg-slate-50">
          @switch (route()) {
            @case('home') { <app-dashboard (navigate)="navigate($event)" /> }
            @case('chat') { <app-chatbot /> }
            @case('market') { <app-market /> }
            @case('disease') { <app-disease /> }
            @case('advisory') { <app-advisory [startTab]="'weather'" /> }
            @case('schemes') { <app-advisory [startTab]="'schemes'" /> }
          }
        </div>
      </main>
    </div>
  `,
  styles: [`
    .animate-slide-down { animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AppComponent {
  route = signal<any>('home');
  mobileMenuOpen = signal(false);

  getNavClass(target: string) {
    // Check if current route matches target OR if we are in schemes and target is advisory (highlight advisor nav)
    const isActive = this.route() === target || (target === 'advisory' && this.route() === 'schemes');
    
    return isActive 
      ? 'bg-green-500 text-white shadow-lg font-bold transform scale-[1.02]' 
      : 'text-green-100 hover:bg-green-800 hover:text-white';
  }

  navigate(target: any) {
    this.route.set(target);
    this.mobileMenuOpen.set(false);
  }
}