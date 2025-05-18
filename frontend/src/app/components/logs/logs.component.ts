
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';

interface Log {
  id: string;
  timestamp: string;
  source_ip: string;
  event_type: string;
  details: { [key: string]: string };
}

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {
  logs: Log[] = [];
  displayedLogs: Log[] = [];
  isLoading = true;
  error: string | null = null;
  selectedLog: Log | null = null;
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  searchQuery = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchLogs();
  }

  fetchLogs(): void {
    this.isLoading = true;
    this.apiService.getLogs().subscribe({
      next: (logs: Log[]) => {
        // Sort logs by timestamp (latest first)
        this.logs = logs.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        this.totalPages = Math.ceil(this.logs.length / this.pageSize);
        this.updateDisplayedLogs();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load logs: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  updateDisplayedLogs(): void {
    let filteredLogs = this.logs;
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filteredLogs = this.logs.filter(log =>
        log.id.toLowerCase().includes(query) ||
        log.source_ip.toLowerCase().includes(query) ||
        log.event_type.toLowerCase().includes(query)
      );
    }
    this.totalPages = Math.ceil(filteredLogs.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedLogs = filteredLogs.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedLogs();
    }
  }

  openLogDetails(log: Log): void {
    this.selectedLog = log;
  }

  closeLogDetails(): void {
    this.selectedLog = null;
  }

  searchLogs(): void {
    this.currentPage = 1;
    this.updateDisplayedLogs();
  }

  objectKeys(obj: { [key: string]: string } | null | undefined): string[] {
    return obj ? Object.keys(obj) : [];
  }
}