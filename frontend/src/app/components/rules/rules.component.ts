import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';

interface Rule {
  id: string;
  name: string;
  query: string;
  exclusion_list: string[];
  enabled: boolean;
}

@Component({
  selector: 'app-rules',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit {
  rules: Rule[] = [];
  displayedRules: Rule[] = [];
  isLoading = true;
  error: string | null = null;
  selectedRule: Rule | null = null;
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  searchQuery = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchRules();
  }

  fetchRules(): void {
    this.isLoading = true;
    this.apiService.getRules().subscribe({
      next: (rules: Rule[]) => {
        // Filter out null or undefined rules and sort by id (latest first)
        this.rules = rules
          .filter((rule): rule is Rule => rule != null)
          .sort((a, b) => b.id.localeCompare(a.id));
        this.totalPages = Math.ceil(this.rules.length / this.pageSize);
        this.updateDisplayedRules();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load rules: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  updateDisplayedRules(): void {
    let filteredRules = this.rules;
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filteredRules = this.rules.filter(rule =>
        rule.id.toLowerCase().includes(query) ||
        rule.name.toLowerCase().includes(query) ||
        rule.query.toLowerCase().includes(query)
      );
    }
    this.totalPages = Math.ceil(filteredRules.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedRules = filteredRules.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedRules();
    }
  }

  openRuleDetails(rule: Rule): void {
    this.selectedRule = rule;
  }

  closeRuleDetails(): void {
    this.selectedRule = null;
  }

  searchRules(): void {
    this.currentPage = 1;
    this.updateDisplayedRules();
  }

  getExclusionListCount(exclusionList: string[] | null | undefined): number {
    return exclusionList ? exclusionList.length : 0;
  }
}