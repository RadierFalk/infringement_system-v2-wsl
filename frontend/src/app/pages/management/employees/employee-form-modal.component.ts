import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { EmployeesService } from '../../../services/employees.service';
import { Employee, UserType } from '../../../models/employee.interface';
import { Department } from '../../../models/department.interface';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-employee-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './employee-form-modal.component.html',
  styleUrls: ['./employee-form-modal.component.scss'],
})
export class EmployeeFormModalComponent implements OnChanges {
  @Input() employee: Employee | null = null;

  // Lista de departamentos vem do componente pai (EmployeesComponent),
  // que já precisa buscá-la de qualquer forma pra exibir o nome do
  // departamento na tabela — evita buscar a mesma lista duas vezes.
  @Input() departments: Department[] = [];

  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  form: FormGroup;
  isSaving = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private employeesService: EmployeesService, private authService: AuthService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      email: [''],
      global_id: [''],
      company: [''],
      role: [''],
      department_id: [null, Validators.required],
      password: [''], // required é adicionado/removido dinamicamente em ngOnChanges
      user_type: ['normal' as UserType, Validators.required],
    });
  }

  // Só quem já é super_admin pode PROMOVER outra pessoa a super_admin —
  // controla se a opção aparece no <select> do template.
  get canAssignSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  ngOnChanges(): void {
    const passwordControl = this.form.get('password')!;

    if (this.employee) {
      // Modo edição: preenche o form e TORNA a senha opcional
      // (deixar em branco = manter a senha atual, regra do backend).
      this.form.patchValue({
        name: this.employee.name,
        username: this.employee.username,
        email: this.employee.email ?? '',
        global_id: this.employee.global_id ?? '',
        company: this.employee.company ?? '',
        role: this.employee.role ?? '',
        department_id: this.employee.department_id,
        password: '',
        user_type: this.employee.user_type,
      });
      passwordControl.clearValidators();
    } else {
      // Modo criação: form limpo e senha OBRIGATÓRIA.
      this.form.reset({ is_admin: false });
      passwordControl.setValidators(Validators.required);
    }

    // Necessário depois de mudar os validators manualmente — sem isso,
    // o Angular não reavalia se o campo passa a ser válido/inválido.
    passwordControl.updateValueAndValidity();
  }

  get isEditMode(): boolean {
    return !!this.employee;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const formValue = this.form.value;

    // Se a senha ficou em branco na edição, não mandamos o campo pro
    // backend — assim ele não sobrescreve a senha atual com string vazia.
    const payload = { ...formValue };
    if (this.isEditMode && !payload.password) {
      delete payload.password;
    }

    const request$ = this.isEditMode
      ? this.employeesService.update(this.employee!.id, payload)
      : this.employeesService.create(payload);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.saved.emit();
      },
      error: (err) => {
        this.isSaving = false;
        // 409 = username ou email já cadastrado (ver employee_routes.py)
        this.errorMessage =
          err.status === 409
            ? 'Username ou e-mail já cadastrado.'
            : 'Não foi possível salvar. Verifique os dados e tente novamente.';
      },
    });
  }
}