import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  OccurrencesService,
  OccurrenceCreate,
} from '../../../../services/occurrences.service';

import {
  EmployeesService,
  Employee,
} from '../../../../services/employees.service';

import {
  OccurrenceCategoriesService,
  OccurrenceCategory,
} from '../../../../services/occurrence-categories.service';

@Component({
  selector: 'app-occurrence-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './occurrence-add.component.html',
  styleUrls: ['./occurrence-add.component.scss'],
})
export class OccurrenceAddComponent implements OnInit {
  employees: Employee[] = [];
  categories: OccurrenceCategory[] = [];

  loading = false;
  loadingOptions = true;
  error = '';
  success = false;

  form: Omit<OccurrenceCreate, 'category_id' > & {
    category_id: number | null;
  } = {
    title: '',
    description: '',
    date: this.getCurrentDateTime(),
    employee_id: 0,
    category_id: 0,
  };

  constructor(
    private occurrencesService: OccurrencesService,
    private employeesService: EmployeesService,
    private categoriesService: OccurrenceCategoriesService,
    private router: Router,
  ) {}

  getCurrentDateTime(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  ngOnInit(): void {
    this.loadOptions();
  }

  loadOptions(): void {
    this.loadingOptions = true;
    this.error = '';

    this.employeesService.getAll().subscribe({
      next: (response) => {
        this.employees = response.items;
        this.loadCategories();
      },
      error: () => {
        this.error = 'Não foi possível carregar os funcionários.';
        this.loadingOptions = false;
      },
    });
  }

  loadCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadingOptions = false;
      },
      error: () => {
        this.error = 'Não foi possível carregar as categorias.';
        this.loadingOptions = false;
      },
    });
  }

  submit(): void {
    this.error = '';
    this.success = false;

    if (
      !this.form.title.trim() ||
      !this.form.date ||
      !this.form.employee_id ||
      !this.form.category_id === null
    ) {
      this.error = 'Preencha os campos obrigatórios.';
      return;
    }

    this.loading = true;

    const payload: OccurrenceCreate = {
      title: this.form.title.trim(),
      description: this.form.description?.trim() || undefined,
      status: 'Created',
      date: this.form.date,
      employee_id: this.form.employee_id,
      category_id: this.form.category_id!,
    };

    this.occurrencesService.create(payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;

        setTimeout(() => {
          this.router.navigate(['/management/occurrences/list']);
        }, 500);
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.detail ||
          'Não foi possível cadastrar a ocorrência.';
      },
    });
  }
}
