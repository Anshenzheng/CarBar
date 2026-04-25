import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">CB</div>
          <h2 class="auth-title">CarBar</h2>
          <p class="auth-subtitle">汽车维修保养管理系统</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div *ngIf="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>

          <div class="form-group">
            <label class="form-label">用户名</label>
            <input 
              type="text" 
              formControlName="username" 
              class="form-control"
              placeholder="请输入用户名"
              [class.error]="submitted && f['username'].errors"
            >
          </div>

          <div class="form-group">
            <label class="form-label">密码</label>
            <input 
              type="password" 
              formControlName="password" 
              class="form-control"
              placeholder="请输入密码"
              [class.error]="submitted && f['password'].errors"
            >
          </div>

          <button 
            type="submit" 
            class="btn btn-primary btn-lg btn-block"
            [disabled]="loading"
          >
            <span *ngIf="loading" class="loading"></span>
            <span *ngIf="!loading">登录</span>
          </button>
        </form>

        <div class="auth-footer">
          还没有账号？
          <a routerLink="/register">立即注册</a>
        </div>

        <div class="divider"><span>测试账号</span></div>

        <div style="font-size: 12px; color: var(--color-text-muted);">
          <p>管理员: admin / admin123</p>
          <p>技师: tech001 / tech123</p>
          <p>客户: cust001 / cust123</p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  returnUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const credentials: LoginRequest = {
      username: this.f['username'].value,
      password: this.f['password'].value
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate([this.returnUrl]);
        } else {
          this.errorMessage = response.message || '登录失败';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || '登录失败，请检查用户名和密码';
        this.loading = false;
      }
    });
  }
}
