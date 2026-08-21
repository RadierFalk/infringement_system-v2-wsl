import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OccurrencesService } from '../../services/occurrences.service';
import { AuthService } from '../../services/auth.service';
import { Occurrence, StatusEnum } from '../../models/occurrence.interface';

// Representa um card de estatística na tela. Ter isso tipado permite
// montar os cards com *ngFor no template, em vez de repetir 5 blocos
// de HTML quase idênticos só mudando o número/label.
interface StatusCount {
  status: StatusEnum;
  label: string;
  count: number;
  cssClass: string; // usada no SCSS pra colorir cada card por status
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  userInfo = this.authService.getUserInfo();

  isLoading = true;
  errorMessage = '';

  totalOccurrences = 0;
  statusCounts: StatusCount[] = [];
  recentOccurrences: Occurrence[] = [];

  constructor(
    private occurrencesService: OccurrencesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.occurrencesService.getAll({ page: 1, size: 100 }).subscribe({
      next: (response) => {
        this.totalOccurrences = response.total;
        this.statusCounts = this.buildStatusCounts(response.items);
        this.recentOccurrences = this.buildRecentList(response.items);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar os dados do dashboard.';
        this.isLoading = false;
      },
    });
  }

  // Conta quantas ocorrências existem em cada status, a partir da lista
  // que já buscamos. Isso substitui o endpoint de agregação que o
  // backend antigo tinha e o novo ainda não tem.
  private buildStatusCounts(occurrences: Occurrence[]): StatusCount[] {
    const definitions: Array<{ status: StatusEnum; label: string; cssClass: string }> = [
      { status: StatusEnum.CREATED, label: 'Criadas', cssClass: 'status-created' },
      { status: StatusEnum.SENT, label: 'Enviadas', cssClass: 'status-sent' },
      { status: StatusEnum.RESPONSE_RECEIVED, label: 'Resposta recebida', cssClass: 'status-received' },
      { status: StatusEnum.RESPONSE_REJECTED, label: 'Resposta rejeitada', cssClass: 'status-rejected' },
      { status: StatusEnum.RESOLVED, label: 'Resolvidas', cssClass: 'status-resolved' },
    ];

    return definitions.map((def) => ({
      ...def,
      count: occurrences.filter((o) => o.status === def.status).length,
    }));
  }

  // Ordena por data decrescente (mais recente primeiro) e pega as 5 primeiras.
  private buildRecentList(occurrences: Occurrence[]): Occurrence[] {
    return [...occurrences]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  // Usado no template pra calcular a largura da barra de cada status
  // proporcionalmente ao total — evita fazer essa conta dentro do HTML.
  getPercentage(count: number): number {
    if (this.totalOccurrences === 0) return 0;
    return Math.round((count / this.totalOccurrences) * 100);
  }
}