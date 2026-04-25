import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Role } from './models/user.model';

@Component({
  selector: 'app-root',
  template: `
    <ng-container *ngIf="!showAuthPage">
      <header class="header">
        <div class="header-content">
          <a routerLink="/" class="logo">
            <div class="logo-icon">CB</div>
            <div>
              <div class="logo-text">CarBar</div>
              <div class="logo-subtitle">汽车维修保养管理系统</div>
            </div>
          </a>
          
          <nav class="nav" *ngIf="authService.isAuthenticated()">
            <ng-container *ngIf="authService.isCustomer()">
              <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">仪表盘</a>
              <a routerLink="/cars" routerLinkActive="active" class="nav-link">我的车辆</a>
              <a routerLink="/orders" routerLinkActive="active" class="nav-link">我的工单</a>
              <a routerLink="/orders/create" routerLinkActive="active" class="nav-link">预约服务</a>
            </ng-container>
            
            <ng-container *ngIf="authService.isTechnician()">
              <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">仪表盘</a>
              <a routerLink="/orders" routerLinkActive="active" class="nav-link">我的任务</a>
            </ng-container>
            
            <ng-container *ngIf="authService.isAdmin()">
              <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">仪表盘</a>
              <a routerLink="/orders" routerLinkActive="active" class="nav-link">工单管理</a>
              <a routerLink="/technicians" routerLinkActive="active" class="nav-link">技师管理</a>
            </ng-container>
          </nav>

          <div class="user-info" *ngIf="authService.isAuthenticated(); else loginLink">
            <div class="user-avatar">{{ authService.getCurrentUser()?.realName?.charAt(0) }}</div>
            <div class="user-details">
              <div class="user-name">{{ authService.getCurrentUser()?.realName }}</div>
              <div class="user-role">
                <span [class]="'role-badge role-' + authService.getRole()?.toLowerCase()">
                  {{ getRoleLabel() }}
                </span>
              </div>
            </div>
            <button class="logout-btn" (click)="logout()">退出</button>
          </div>
          
          <ng-template #loginLink>
            <a routerLink="/login" class="btn btn-primary">登录</a>
          </ng-template>
        </div>
      </header>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </ng-container>
    
    <ng-container *ngIf="showAuthPage">
      <router-outlet></router-outlet>
    </ng-container>
  `
})
export class AppComponent {
  title = 'CarBar';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  get showAuthPage(): boolean {
    const url = this.router.url;
    return url === '/login' || url === '/register';
  }

  getRoleLabel(): string {
    const role = this.authService.getRole();
    switch (role) {
      case Role.CUSTOMER: return '客户';
      case Role.TECHNICIAN: return '技师';
      case Role.ADMIN: return '管理员';
      default: return '';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
