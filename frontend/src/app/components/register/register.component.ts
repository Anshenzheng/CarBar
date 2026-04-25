import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest, Role } from '../../models/user.model';

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">CB</div>
          <h2 class="auth-title">注册账号</h2>
          <p class="auth-subtitle">加入 CarBar 维修保养管理系统</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div *ngIf="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>
          
          <div *ngIf="successMessage" class="alert alert-success">
            {{ successMessage }}
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">用户名 *</label>
              <input 
                type="text" 
                formControlName="username" 
                class="form-control"
                placeholder="3-50个字符"
              >
            </div>

            <div class="form-group">
              <label class="form-label">真实姓名 *</label>
              <input 
                type="text" 
                formControlName="realName" 
                class="form-control"
                placeholder="请输入真实姓名"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">密码 *</label>
              <input 
                type="password" 
                formControlName="password" 
                class="form-control"
                placeholder="至少6个字符"
              >
            </div>

            <div class="form-group">
              <label class="form-label">确认密码 *</label>
              <input 
                type="password" 
                formControlName="confirmPassword" 
                class="form-control"
                placeholder="再次输入密码"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">手机号 *</label>
              <input 
                type="tel" 
                formControlName="phone" 
                class="form-control"
                placeholder="请输入手机号"
              >
            </div>

            <div class="form-group">
              <label class="form-label">邮箱</label>
              <input 
                type="email" 
                formControlName="email" 
                class="form-control"
                placeholder="可选"
              >
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">注册身份 *</label>
            <div class="select-wrapper">
              <select formControlName="role" class="form-control">
                <option [value]="Role.CUSTOMER">客户</option>
                <option [value]="Role.TECHNICIAN">技师</option>
              </select>
            </div>
            <div class="form-text">
              客户：可预约维修保养服务<br>
              技师：可接收并处理工单任务
            </div>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary btn-lg btn-block"
            [disabled]="loading"
          >
            <span *ngIf="loading" class="loading"></span>
            <span *ngIf="!loading">注册</span>
          </button>
        </form>

        <div class="auth-footer">
          已有账号？
          <a routerLink="/login">立即登录</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  Role = Role;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      realName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      phone: ['', Validators.required],
      email: [''],
      role: [Role.CUSTOMER, Validators.required]
    });
  }

  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      return;
    }

    if (this.f['password'].value !== this.f['confirmPassword'].value) {
      this.errorMessage = '两次输入的密码不一致';
      return;
    }

    this.loading = true;
    const registerData: RegisterRequest = {
      username: this.f['username'].value,
      password: this.f['password'].value,
      realName: this.f['realName'].value,
      phone: this.f['phone'].value,
      email: this.f['email'].value || undefined,
      role: this.f['role'].value
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = '注册成功！正在跳转到登录页...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage = response.message || '注册失败';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || '注册失败，请稍后重试';
        this.loading = false;
      }
    });
  }
}
