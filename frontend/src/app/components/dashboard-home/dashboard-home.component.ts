import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';

interface Log {
  id: string;
  timestamp: string;
  source_ip: string;
  event_type: string;
  details: { [key: string]: string };
}

interface Rule {
  id: string;
  name: string;
  query: string;
  exclusion_list: string[];
  enabled: boolean;
}

interface Alert {
  id: string;
  rule_id: string;
  severity: string;
  details: { [key: string]: string };
  timestamp: string;
}


@Component({
  selector: 'app-dashboard-home',
  imports: [
    CommonModule,
    MatIconModule,
  
  ],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss',
})

export class DashboardHomeComponent implements OnInit {
  stats = { totalLogs: 0, criticalAlerts: 0, highAlerts: 0, mediumAlerts: 0 };
  logs: Log[] = [];
  alerts: Alert[] = [];
  recentActivities: { content: string; timestamp: string }[] = [];
  isLoading = true;
  error: string | null = null;
  selectedLog: Log | null = null;
  selectedAlert: Alert | null = null;
  displayedLogs: Log[] = [];
  displayedAlerts: Alert[] = [];
  chartHeights = { critical: 0, high: 0, medium: 0 }; // Heights in percentage

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.isLoading = true;
    Promise.all([
      this.apiService.getLogs().toPromise(),
      this.apiService.getAlerts().toPromise(),
      this.apiService.getRules().toPromise()
    ]).then(([logs, alerts, rules]) => {
      // Filter nulls and sort
      this.logs = (logs ?? [])
        .filter((log): log is Log => log != null)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      this.alerts = (alerts ?? [])
        .filter((alert): alert is Alert => alert.severity != "null")
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const validRules = (rules ?? [])
        .filter((rule): rule is Rule => rule != null)
        .sort((a, b) => b.id.localeCompare(a.id));

      // Compute stats
      this.stats.totalLogs = this.logs.length;
      this.stats.criticalAlerts = this.alerts.filter(a => a.severity.toLowerCase() === 'critical').length;
      this.stats.highAlerts = this.alerts.filter(a => a.severity.toLowerCase() === 'high').length;
      this.stats.mediumAlerts = this.alerts.filter(a => a.severity.toLowerCase() === 'medium').length;

      // Compute chart heights (normalize to max 100%)
      const maxAlerts = Math.max(this.stats.criticalAlerts, this.stats.highAlerts, this.stats.mediumAlerts, 1);
      this.chartHeights.critical = (this.stats.criticalAlerts / maxAlerts) * 100;
      this.chartHeights.high = (this.stats.highAlerts / maxAlerts) * 100;
      this.chartHeights.medium = (this.stats.mediumAlerts / maxAlerts) * 100;

      // Recent activities (up to 5: prioritize alerts, then rules)
      this.recentActivities = [
        ...this.alerts.slice(0, 3).map(a => ({
          content: `Alert triggered: ${a.severity} severity (Rule: ${a.rule_id})`,
          timestamp: a.timestamp
        })),
        ...validRules.slice(0, 2).map(r => ({
          content: `Rule created: ${r.name} (${r.enabled ? 'Enabled' : 'Disabled'})`,
          timestamp: new Date().toISOString() // Rules lack timestamp
        }))
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

      // Limit to top 5 logs and alerts
      this.displayedLogs = this.logs.slice(0, 5);
      this.displayedAlerts = this.alerts.slice(0, 5);

      this.isLoading = false;
    }).catch(err => {
      this.error = 'Failed to load dashboard data: ' + err.message;
      this.isLoading = false;
    });
  }

  openLogDetails(log: Log): void {
    this.selectedLog = log;
  }

  closeLogDetails(): void {
    this.selectedLog = null;
  }

  openAlertDetails(alert: Alert): void {
    this.selectedAlert = alert;
  }

  closeAlertDetails(): void {
    this.selectedAlert = null;
  }

  objectKeys(obj: { [key: string]: string } | null | undefined): string[] {
    return obj ? Object.keys(obj) : [];
  }

  getSeverityClass(severity: string): string {
    return severity.toLowerCase();
  }
}