import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentsService } from '../../../services/departments.service';
import { Department, DepartmentWithCount } from '../../../models/department.interface';
import { DepartmentFormModalComponent } from './department-form-modal.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, DepartmentFormModalComponent, ConfirmDialogComponent],
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
})
export class DepartmentsComponent implements OnInit {
  departments: DepartmentWithCount[] = [];
  isLoading = true;
  errorMessage = '';

  // Controla se o modal de formulário está aberto, e em qual modo.
  // null = modal fechado. Department = editando. {} vazio não é usado
  // aqui — usamos um segundo flag pra criação, ver showFormModal abaixo.
  showFormModal = false;
  departmentBeingEdited: Department | null = null;

  // Controla o modal de confirmação de exclusão separadamente do de formulário —
  // são fluxos independentes, então flags independentes evitam um controlar o outro sem querer.
  departmentPendingDelete: DepartmentWithCount | null = null;
  deleteErrorMessage = '';

  constructor(private departmentsService: DepartmentsService) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.departmentsService.getAll().subscribe({
      next: (data) => {
        this.departments = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar os departamentos.';
        this.isLoading = false;
      },
    });
  }

  openCreateModal(): void {
    this.departmentBeingEdited = null; // null = modo criação
    this.showFormModal = true;
  }

  openEditModal(department: DepartmentWithCount): void {
    this.departmentBeingEdited = department;
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.departmentBeingEdited = null;
  }

  onDepartmentSaved(): void {
    this.closeFormModal();
    this.loadDepartments(); // recarrega a lista pra refletir a mudança
  }

  requestDelete(department: DepartmentWithCount): void {
    this.departmentPendingDelete = department;
    this.deleteErrorMessage = '';
  }

  cancelDelete(): void {
    this.departmentPendingDelete = null;
  }

  confirmDelete(): void {
    if (!this.departmentPendingDelete) return;

    const id = this.departmentPendingDelete.id;

    this.departmentsService.delete(id).subscribe({
      next: () => {
        this.departmentPendingDelete = null;
        this.loadDepartments();
      },
      error: (err) => {
        // 409 = existem funcionários vinculados a esse departamento
        // (regra de integridade do backend, ver department_routes.py)
        this.deleteErrorMessage =
          err.status === 409
            ? 'Não é possível excluir: há funcionários vinculados a este departamento.'
            : 'Não foi possível excluir. Tente novamente.';
      },
    });
  }
}