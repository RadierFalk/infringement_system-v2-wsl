import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  Occurrence,
  StatusEnum,
} from '../../../../models/occurrence.interface';

import {
  OccurrenceFilters,
  OccurrencesService,
} from '../../../../services/occurrences.service';

import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-occurrences-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmDialogComponent],
  templateUrl: './occurrences-list.component.html',
  styleUrls: ['./occurrences-list.component.scss'],
})
export class OccurrencesListComponent implements OnInit {
  occurrences: Occurrence[] = [];

  loading = false;
  error = '';

  occurrencePendingDelete: Occurrence | null = null;
  deleteErrorMessage = '';

  page = 1;
  size = 10;
  total = 0;

  constructor(private occurrencesService: OccurrencesService) {}

  ngOnInit(): void {
    this.loadOccurrences();
  }

  loadOccurrences(): void {
    this.loading = true;
    this.error = '';

    const filters: OccurrenceFilters = {
      page: this.page,
      size: this.size,
    };

    this.occurrencesService.getAll(filters).subscribe({
      next: (response) => {
        this.occurrences = response.items;
        this.total = response.total;
        this.loading = false;
      },
      error: () => {
        this.error = 'Não foi possível carregar as ocorrências.';
        this.loading = false;
      },
    });
  }

  getStatusLabel(status: StatusEnum): string {
    return status;
  }

  nextPage(): void {
    if (this.page * this.size < this.total) {
      this.page++;
      this.loadOccurrences();
    }
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadOccurrences();
    }
  }

  requestDelete(occurrence: Occurrence): void {
    this.occurrencePendingDelete = occurrence;
    this.deleteErrorMessage = '';
  }

  cancelDelete(): void {
    this.occurrencePendingDelete = null;
  }

  confirmDelete(): void {
    if (!this.occurrencePendingDelete?.id) {
      return;
    }

    const occurrenceId = this.occurrencePendingDelete?.id;

    this.occurrencesService.delete(occurrenceId).subscribe({
      next: () => {
        this.occurrencePendingDelete = null;
        this.loadOccurrences();
      },
      error: () => {
        this.deleteErrorMessage =
          "Não foi possível excluir a ocorrência.";
        this.occurrencePendingDelete = null;
      },
    });
  }
}
