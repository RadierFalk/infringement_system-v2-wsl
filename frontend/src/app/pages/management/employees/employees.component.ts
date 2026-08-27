import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { EmployeesService } from '../../../services/employees.service';
import { DepartmentsService } from '../../../services/departments.service';
import { Employee } from '../../../models/employee.interface';
import { Department } from '../../../models/department.interface';
import { EmployeeFormModalComponent } from './employee-form-modal.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EmployeeFormModalComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss'],
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  departments: Department[] = [];
  isLoading = true;
  errorMessage = '';
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  total = 0;
  showFormModal = false;
  employeeBeingEdited: Employee | null = null;
  employeePendingDelete: Employee | null = null;
  deleteErrorMessage = '';

  // Subject que recebe cada tecla digitada na busca.
  // Usamos debounceTime para evitar uma requisição a cada tecla.
  private searchSubject = new Subject<string>();

  constructor(
    private employeesService: EmployeesService,
    private departmentsService: DepartmentsService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadEmployees();

    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadEmployees();
      });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  private loadDepartments(): void {
    // Usado para popular o select do formulário e mostrar
    // o nome do departamento na tabela.
    this.departmentsService.getAll().subscribe({
      next: (data) => (this.departments = data),
    });
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.employeesService
      .getAll({
        filter: this.searchTerm || undefined,
        page: this.currentPage,
        size: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          this.employees = response.items;
          this.total = response.total;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Não foi possível carregar os funcionários.';
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
    this.loadEmployees();
  }

  openCreateModal(): void {
    this.employeeBeingEdited = null;
    this.showFormModal = true;
  }

  openEditModal(employee: Employee): void {
    this.employeeBeingEdited = employee;
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.employeeBeingEdited = null;
  }

  onEmployeeSaved(): void {
    this.closeFormModal();
    this.loadEmployees();
  }

  requestDelete(employee: Employee): void {
    this.employeePendingDelete = employee;
    this.deleteErrorMessage = '';
  }

  cancelDelete(): void {
    this.employeePendingDelete = null;
  }

  confirmDelete(): void {
    if (!this.employeePendingDelete) return;

    this.employeesService.delete(this.employeePendingDelete.id).subscribe({
      next: () => {
        this.employeePendingDelete = null;
        this.loadEmployees();
      },
      error: () => {
        this.deleteErrorMessage = 'Não foi possível excluir. Tente novamente.';
      },
    });
  }

  userTypeLabel(userType: string): string {
    const labels: Record<string, string> = {
      super_admin: 'Super Administrador',
      admin: 'Administrador',
      normal: 'Funcionário',
    };

    return labels[userType] ?? userType;
  }
}