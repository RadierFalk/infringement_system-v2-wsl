import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { OccurrencesService } from '../../../services/occurrences.service';
import { Employee } from '../../../models/employee.interface';
import { OccurrenceCategory } from '../../../models/occurrence-category.interface';

// Diferente de Departments/Employees/Categories, este modal só cobre
// CRIAÇÃO — o backend não tem PUT /occurrences/{id} (ver occurrence_routes.py,
// só existem GET, POST, DELETE e o POST de notificação). Editar uma
// ocorrência já criada não é uma operação suportada pelo backend atual.
@Component({
  selector: 'app-occurrence-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './occurrence-form-modal.component.html',
  styleUrls: ['./occurrence-form-modal.component.scss'],
})
export class OccurrenceFormModalComponent {
  @Input() employees: Employee[] = [];
  @Input() categories: OccurrenceCategory[] = [];

  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  form: FormGroup;
  isSaving = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private occurrencesService: OccurrencesService) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      // O <input type="date"> do HTML trabalha com string 'YYYY-MM-DD'.
      // Default pro dia de hoje, pra não obrigar o usuário a preencher
      // toda vez que a maioria dos registros é "hoje".
      date: [this.todayAsInputValue(), Validators.required],
      employee_id: [null, Validators.required],
      category_id: [null],
    });
  }

  private todayAsInputValue(): string {
    return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const formValue = this.form.value;

    // O input HTML devolve só a data ('2026-08-24'); o backend espera
    // um datetime ISO completo. new Date(...).toISOString() completa
    // com horário 00:00:00 UTC.
    const payload = {
      ...formValue,
      date: new Date(formValue.date).toISOString(),
      category_id: formValue.category_id || undefined,
    };

    this.occurrencesService.create(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.saved.emit();
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'It was not possible to register the occurrence. Please try again.';
      },
    });
  }
}
