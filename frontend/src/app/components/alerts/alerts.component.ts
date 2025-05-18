import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
interface Alert {
  id: string;
  rule_id: string;
  severity: string;
  details: { [key: string]: string };
  timestamp: string;
}
@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnInit {
  alerts: Alert[] = [];
  displayedAlerts: Alert[] = [];
  isLoading = true;
  error: string | null = null;
  selectedAlert: Alert | null = null;
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  searchQuery = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchAlerts();
  }

  fetchAlerts(): void {
    this.isLoading = true;
    this.apiService.getAlerts().subscribe({
      next: (alerts: Alert[]) => {
        this.alerts = alerts
          .filter((alert): alert is Alert => alert.severity != "null" )
          .sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        this.totalPages = Math.ceil(this.alerts.length / this.pageSize);
        this.updateDisplayedAlerts();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load alerts: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  updateDisplayedAlerts(): void {
    let filteredAlerts = this.alerts;
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filteredAlerts = this.alerts.filter(alert =>
        alert.id.toLowerCase().includes(query) ||
        alert.rule_id.toLowerCase().includes(query) ||
        alert.severity.toLowerCase().includes(query)
      );
    }
    this.totalPages = Math.ceil(filteredAlerts.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedAlerts = filteredAlerts.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedAlerts();
    }
  }

  openAlertDetails(alert: Alert): void {
    this.selectedAlert = alert;
  }

  closeAlertDetails(): void {
    this.selectedAlert = null;
  }

  searchAlerts(): void {
    this.currentPage = 1;
    this.updateDisplayedAlerts();
  }

  objectKeys(obj: { [key: string]: string } | null | undefined): string[] {
    return obj ? Object.keys(obj) : [];
  }
}