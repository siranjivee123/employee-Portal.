import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddEmployeeComponent } from './add-employee/add-employee';
import { EmployeeListComponent } from './employee-list/employee-list';

import { ProjectsComponent } from './projects/projects';
import { AddProjectComponent } from './add-projects/add-projects';
import { TaskListComponent } from './tasks/task-list/task-list.component';
import { AddTaskComponent } from './tasks/add-task/add-task.component';
import { AddLeaveComponent } from './leave-management/add-leave/add-leave.component';
import { LeaveListComponent } from './leave-management/leave-list/leave-list.component';
import { authGuard } from './guards/auth.guard';
import { ForgotPasswordComponent } from './forgot-password/forgot-password';
export const routes: Routes = [

  // Redirect
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Login
  { path: 'login', component: LoginComponent },

  { path: 'forgot-password', component: ForgotPasswordComponent },
  // Dashboard 
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['admin', 'manager', 'employee'] }
  },

  // EMPLOYEES
  {
    path: 'employees',
    component: EmployeeListComponent,
    canActivate: [authGuard],
    data: { roles: ['admin', 'manager', 'employee'] }
  },

  {
    path: 'add-employee',
    component: AddEmployeeComponent,
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },

  // PROJECTS 
  {
    path: 'projects',
    component: ProjectsComponent,
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },

  {
    path: 'add-project',
    component: AddProjectComponent,
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },

  // TASKS
  {
    path: 'tasks',
    component: TaskListComponent,
    canActivate: [authGuard],
    data: { roles: ['admin', 'manager'] }
  },

  {
    path: 'add-task',
    component: AddTaskComponent,
    canActivate: [authGuard],
    data: { roles: ['admin', 'manager'] }
  },
  {

// LEAVES
  path: 'leave',
  component: LeaveListComponent,
  canActivate: [authGuard],
  data: { roles: ['admin', 'manager', 'employee'] }
},
{
  path: 'leave/add',
  loadComponent: () =>
    import('./leave-management/add-leave/add-leave.component')
      .then(m => m.AddLeaveComponent),
  canActivate: [authGuard],
  data: { roles: ['admin', 'manager', 'employee'] }
},
  // fallback
  { path: '**', redirectTo: 'login' }
];

