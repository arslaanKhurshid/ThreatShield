import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, NgModel } from '@angular/forms';
import { ApiService } from './services/api.service';
import { RouterOutlet } from '@angular/router';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-root',
  imports: [CommonModule, HttpClientModule,FormsModule,RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Threat Detection System';
  activeTab: string = 'logs';
  logs: any[] = [];
  rules: any[] = [];
  alerts: any[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  selectedRuleId: string = '';

  filteredAlerts: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadLogs();
    this.loadRules();
    this.loadAlerts();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }

  toggleTheme() {
    document.body.classList.toggle('dark-theme');
  }

  loadLogs() {
    this.apiService.getLogs().subscribe({
      next: (logs) => {
        this.logs = logs;
        this.logs = logs
        .slice() // clone the array to avoid mutating it
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },
      error: (err) => {
        this.errorMessage = 'Failed to load logs: ' + err.message;
      }
    });
  }


  loadRules() {
    this.apiService.getRules().subscribe({
      next: (rules) => {
        this.rules = rules;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load rules: ' + err.message;
      }
    });
  }

  generateRule() {
    this.apiService.generateRule().subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.loadRules();
      },
      error: (err) => {
        this.errorMessage = 'Failed to generate rule: ' + err.message;
      }
    });
  }

  loadAlerts() {
    this.apiService.getAlerts().subscribe({
      next: (alerts) => {
        this.alerts = alerts;
        this.filterAlertsByRule();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load alerts: ' + err.message;
      }
    });
  }
  filterAlertsByRule() {
    this.filteredAlerts = this.selectedRuleId
      ? this.alerts.filter(alert => alert.rule_id === this.selectedRuleId)
      : this.alerts;
  }

  detectThreats(ruleId: string) {
    if (!ruleId) return;
    this.apiService.detectThreats(ruleId).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.loadAlerts();
      },
      error: (err) => {
        this.errorMessage = 'Failed to detect threats: ' + err.message;
      }
    });
  }
}