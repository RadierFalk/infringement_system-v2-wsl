import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CategoriesService } from '../../../services/categories.service';
import { OccurrenceCategory } from '../../../models/occurrence-category.interface';

@Component({
  selector: 'app-category-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './category-form-modal.component.html',
  styleUrls: ['./category-form-modal.component.scss'],
})
export class CategoryFormModalComponent implements OnChanges {
  @Input() category: OccurrenceCategory | null = null;

  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  form: FormGroup;
  isSaving = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private categoriesService: CategoriesService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnChanges(): void {
    if (this.category) {
      this.form.patchValue({
        name: this.category.name,
        description: this.category.description,
      });
    } else {
      this.form.reset();
    }
  }

  get isEditMode(): boolean {
    return !!this.category;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const request$ = this.isEditMode
      ? this.categoriesService.update(this.category!.id, this.form.value)
      : this.categoriesService.create(this.form.value);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.saved.emit();
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'Não foi possível salvar. Verifique os dados e tente novamente.';
      },
    });
  }
}