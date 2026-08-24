import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { OccurrencesService } from '../../services/occurrences.service';
import { CategoriesService } from '../../services/categories.service';
import { Occurrence, StatusEnum } from '../../models/occurrence.interface';
import { OccurrenceCategory } from '../../models/occurrence-category.interface';

// Tela SOMENTE LEITURA, acessível a qualquer usuário autenticado
// (não exige adminGuard). O recorte por departamento é feito
// inteiramente pelo backend: um funcionário comum simplesmente nunca
// recebe ocorrências de outro departamento na resposta da API — este
// componente nem precisa saber qual é o departamento do usuário logado.
@Component({
  selector: 'app-occurrences-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './occurrences-search.component.html',
  styleUrls: ['./occurrences-search.component.scss'],
})
export class OccurrencesSearchComponent implements OnInit {
  occurrences: Occurrence[] = [];
  categories: OccurrenceCategory[] = [];

  isLoading = true;
  errorMessage = '';

  searchTerm = '';
  selectedStatus = '';
  selectedCategoryId: number | null = null;
  currentPage = 1;
  pageSize = 10;
  total = 0;

  statusOptions = Object.values(StatusEnum);

  private searchSubject = new Subject<string>();

  constructor(
    private occurrencesService: OccurrencesService,
    private categoriesService: CategoriesService
  ) {}

  ngOnInit(): void {
    this.loadCategoriesForFilter();
    this.loadOccurrences();

    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.currentPage = 1;
      this.loadOccurrences();
    });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadOccurrences();
  }

  private loadCategoriesForFilter(): void {
    this.categoriesService.getAll().subscribe({
      next: (data) => (this.categories = data),
    });
  }

  loadOccurrences(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Repare que NÃO passamos department_id aqui — de propósito.
    // O backend decide isso sozinho a partir de quem está autenticado
    // (ver occurrence_routes.py: effective_department_id). Se o frontend
    // tentasse mandar um department_id diferente, o backend já ignora
    // esse valor para usuários não-admin de qualquer forma.
    this.occurrencesService
      .getAll({
        filter: this.searchTerm || undefined,
        status: this.selectedStatus || undefined,
        category_id: this.selectedCategoryId || undefined,
        page: this.currentPage,
        size: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          this.occurrences = response.items;
          this.total = response.total;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Não foi possível carregar as ocorrências.';
          this.isLoading = false;
        },
      });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadOccurrences();
  }
}