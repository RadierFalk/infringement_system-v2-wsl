import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';

// Reutilizável para QUALQUER ação destrutiva do sistema (excluir
// departamento, funcionário, categoria, ocorrência...). Quem usa esse
// componente só passa a mensagem e escuta os dois eventos de saída.
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent {
  @Input() title = 'Confirmar ação';
  @Input() message = 'Tem certeza que deseja continuar?';
  @Input() confirmLabel = 'Excluir';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}