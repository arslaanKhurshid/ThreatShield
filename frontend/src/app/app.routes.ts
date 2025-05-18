import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
import { LogsComponent } from './components/logs/logs.component';
import { AlertsComponent } from './components/alerts/alerts.component';
import { RulesComponent } from './components/rules/rules.component';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
//   { path: 'dashboard', component: DashboardComponent },

  { 
    path: 'dashboard', 
    component: DashboardComponent,
    children: [
      { path: '', component: DashboardHomeComponent },
      { path: 'logs', component: LogsComponent },
      { path: 'alerts', component: AlertsComponent },
      { path: 'rules', component: RulesComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
