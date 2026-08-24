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

  form: OccurrenceCreate = {
    title: '',
    description: '',
    date: '',
    employee_id: 0,
    category_id: undefined,
  };

  constructor(
    private occurrencesService: OccurrencesService,
    private employeesService: EmployeesService,
    private categoriesService: OccurrenceCategoriesService,
    private router: Router,
  ) {}

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
      !this.form.employee_id
    ) {
      this.error = 'Preencha os campos obrigatórios.';
      return;
    }

    this.loading = true;

    const payload: OccurrenceCreate = {
      ...this.form,
      title: this.form.title.trim(),
      description: this.form.description?.trim() || undefined,
      status: 'Created',
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
