import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

// Componente "moldura": só cuida do fundo escurecido, do card e do
// botão de fechar. O CONTEÚDO de dentro (formulário, mensagem de
// confirmação, etc) é decidido por quem usa o modal, via content
// projection (<ng-content>) — assim este componente não precisa saber
// nada sobre departamento, funcionário, categoria...
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  // Disparado quando o usuário clica no X ou no fundo escurecido.
  // Quem usa <app-modal> decide o que fazer (ex: esconder um *ngIf).
  @Output() closeRequested = new EventEmitter<void>();

  onBackdropClick(): void {
    this.closeRequested.emit();
  }

  // Impede que o clique DENTRO do card "borbulhe" até o backdrop e
  // feche o modal sem querer (ex: clicar dentro do formulário).
  onCardClick(event: MouseEvent): void {
    event.stopPropagation();
  }
}