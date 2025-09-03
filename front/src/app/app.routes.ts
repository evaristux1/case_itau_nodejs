// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/components/login/login.component').then(
        (m) => m.LoginComponent
      ),
    title: 'Login - Itaú Customer',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import(
        './features/dashboard/components/dashboard/dashboard.component'
      ).then((m) => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard - Itaú Customer',
  },
  {
    path: 'customers',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './features/customers/components/customer-list/customer-list.component'
          ).then((m) => m.CustomerListComponent),
        title: 'Clientes - Itaú Customer',
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            './features/customers/components/customer-form/customer-form.component'
          ).then((m) => m.CustomerFormComponent),
        title: 'Novo Cliente - Itaú Customer',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            './features/customers/components/customer-list/customer-list.component'
          ).then((m) => m.CustomerListComponent),
        title: 'Detalhes do Cliente - Itaú Customer',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
