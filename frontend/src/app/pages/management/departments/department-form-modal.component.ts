import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { DepartmentsService } from '../../../services/departments.service';
import { Department } from '../../../models/department.interface';

@Component({
  selector: 'app-department-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './department-form-modal.component.html',
  styleUrls: ['./department-form-modal.component.scss'],
})
export class DepartmentFormModalComponent implements OnChanges {
  // Se vier um Department, o modal abre em modo EDIÇÃO (form pré-preenchido).
  // Se vier null/undefined, abre em modo CRIAÇÃO (form vazio).
  @Input() department: Department | null = null;

  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  form: FormGroup;
  isSaving = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private departmentsService: DepartmentsService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      manager_email: [''],
      director_name: [''],
    });
  }

  // ngOnChanges roda toda vez que o @Input() department muda —
  // é aqui que preenchemos o form quando o modal abre em modo edição.
  ngOnChanges(): void {
    if (this.department) {
      this.form.patchValue({
        name: this.department.name,
        manager_email: this.department.manager_email ?? '',
        director_name: this.department.director_name ?? '',
      });
    } else {
      this.form.reset();
    }
  }

  get isEditMode(): boolean {
    return !!this.department;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const payload = this.form.value;

    // Mesmo formulário serve pra criar e editar — só muda qual
    // método do service é chamado, dependendo do modo.
    const request$ = this.isEditMode
      ? this.departmentsService.update(this.department!.id, payload)
      : this.departmentsService.create(payload);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.saved.emit();
      },
      error: (err) => {
        this.isSaving = false;
        // 409 = nome de departamento duplicado (ver department_routes.py)
        this.errorMessage =
          err.status === 409
            ? 'Já existe um departamento com esse nome.'
            : 'Não foi possível salvar. Tente novamente.';
      },
    });
  }
}