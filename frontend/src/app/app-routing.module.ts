import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { Role } from './models/user.model';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CarListComponent } from './components/car-list/car-list.component';
import { CarFormComponent } from './components/car-form/car-form.component';
import { OrderListComponent } from './components/order-list/order-list.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';
import { OrderCreateComponent } from './components/order-create/order-create.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },
  
  { 
    path: 'cars', 
    component: CarListComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [Role.CUSTOMER, Role.ADMIN] }
  },
  { 
    path: 'cars/add', 
    component: CarFormComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [Role.CUSTOMER, Role.ADMIN] }
  },
  { 
    path: 'cars/:id/edit', 
    component: CarFormComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [Role.CUSTOMER, Role.ADMIN] }
  },
  
  { 
    path: 'orders', 
    component: OrderListComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'orders/create', 
    component: OrderCreateComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [Role.CUSTOMER] }
  },
  { 
    path: 'orders/:id', 
    component: OrderDetailComponent, 
    canActivate: [AuthGuard] 
  },
  
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
