import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriesService } from '../../../services/categories.service';
import {
  OccurrenceCategory,
  SendingRuleRole,
  SendingRuleType,
} from '../../../models/occurrence-category.interface';
import { CategoryFormModalComponent } from './category-form-modal.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CategoryFormModalComponent, ConfirmDialogComponent],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  categories: OccurrenceCategory[] = [];
  isLoading = true;
  errorMessage = '';

  // Opções fixas do <select> de role — ver comentário na interface
  // sobre por que não é um campo de texto livre.
  roleOptions = [
    { value: SendingRuleRole.OFFENDER, label: 'Funcionário (ofensor)' },
    { value: SendingRuleRole.MANAGER, label: 'Gestor do departamento' },
    { value: SendingRuleRole.PRESIDENT, label: 'Presidência' },
    { value: SendingRuleRole.CFO, label: 'CFO' },
  ];

  typeOptions = [
    { value: SendingRuleType.TO, label: 'Para (To)' },
    { value: SendingRuleType.CC, label: 'Cópia (CC)' },
  ];

  showFormModal = false;
  categoryBeingEdited: OccurrenceCategory | null = null;

  categoryPendingDelete: OccurrenceCategory | null = null;
  deleteErrorMessage = '';

  // Controla qual categoria está com as regras de envio expandidas.
  // null = nenhuma expandida.
  expandedCategoryId: number | null = null;
  ruleForm: FormGroup;
  ruleErrorMessage = '';
  rulePendingDelete: { categoryId: number; ruleId: number } | null = null;

  constructor(
    private categoriesService: CategoriesService,
    private fb: FormBuilder
  ) {
    this.ruleForm = this.fb.group({
      role: ['', Validators.required],
      send_type: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.categoriesService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar as categorias.';
        this.isLoading = false;
      },
    });
  }

  openCreateModal(): void {
    this.categoryBeingEdited = null;
    this.showFormModal = true;
  }

  openEditModal(category: OccurrenceCategory): void {
    this.categoryBeingEdited = category;
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.categoryBeingEdited = null;
  }

  onCategorySaved(): void {
    this.closeFormModal();
    this.loadCategories();
  }

  requestDelete(category: OccurrenceCategory): void {
    this.categoryPendingDelete = category;
    this.deleteErrorMessage = '';
  }

  cancelDelete(): void {
    this.categoryPendingDelete = null;
  }

  confirmDelete(): void {
    if (!this.categoryPendingDelete) return;

    this.categoriesService.delete(this.categoryPendingDelete.id).subscribe({
      next: () => {
        this.categoryPendingDelete = null;
        this.loadCategories();
      },
      error: () => {
        this.deleteErrorMessage = 'Não foi possível excluir. Tente novamente.';
      },
    });
  }

  toggleExpand(categoryId: number): void {
    this.expandedCategoryId = this.expandedCategoryId === categoryId ? null : categoryId;
    this.ruleForm.reset();
    this.ruleErrorMessage = '';
  }

  addSendingRule(category: OccurrenceCategory): void {
    if (this.ruleForm.invalid) {
      this.ruleForm.markAllAsTouched();
      return;
    }

    this.ruleErrorMessage = '';

    this.categoriesService.addSendingRule(category.id, {
      category_id: category.id,
      ...this.ruleForm.value,
    }).subscribe({
      next: () => {
        this.ruleForm.reset();
        this.loadCategories(); // recarrega pra atualizar a lista de regras da categoria
      },
      error: () => {
        this.ruleErrorMessage = 'Não foi possível adicionar a regra.';
      },
    });
  }

  requestDeleteRule(categoryId: number, ruleId: number): void {
    this.rulePendingDelete = { categoryId, ruleId };
  }

  cancelDeleteRule(): void {
    this.rulePendingDelete = null;
  }

  confirmDeleteRule(): void {
    if (!this.rulePendingDelete) return;

    const { categoryId, ruleId } = this.rulePendingDelete;

    this.categoriesService.deleteSendingRule(categoryId, ruleId).subscribe({
      next: () => {
        this.rulePendingDelete = null;
        this.loadCategories();
      },
      error: () => {
        this.rulePendingDelete = null;
        this.ruleErrorMessage = 'Não foi possível excluir a regra.';
      },
    });
  }

  // Usado no template pra traduzir o valor bruto ('offender') no
  // label amigável ('Funcionário (ofensor)') sem repetir esse mapeamento em vários lugares.
  getRoleLabel(role: string): string {
    return this.roleOptions.find((r) => r.value === role)?.label ?? role;
  }

  getTypeLabel(type: string): string {
    return this.typeOptions.find((t) => t.value === type)?.label ?? type;
  }
}