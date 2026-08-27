import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyByCategoryStats } from '../../../models/occurrence-stats.interface';

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const SERIES_SLOTS = 8;

interface ChartSeries {
  key: string;
  name: string;
  colorVar: string;
  isOther: boolean;
}

interface ChartBar {
  x: number;
  y: number;
  width: number;
  height: number;
  colorVar: string;
  value: number;
  seriesName: string;
  monthLabel: string;
}

interface ChartGroup {
  monthLabel: string;
  x: number;
}

interface Gridline {
  y: number;
  label: string;
}

@Component({
  selector: 'app-occurrences-bar-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './occurrences-bar-chart.component.html',
  styleUrls: ['./occurrences-bar-chart.component.scss'],
})
export class OccurrencesBarChartComponent implements OnChanges {
  @Input() stats: MonthlyByCategoryStats | null = null;

  readonly viewBoxWidth = 960;
  readonly viewBoxHeight = 340;
  private readonly plotLeft = 44;
  private readonly plotRight = 16;
  private readonly plotTop = 16;
  private readonly plotBottom = 36;

  series: ChartSeries[] = [];
  groups: ChartGroup[] = [];
  bars: ChartBar[] = [];
  gridlines: Gridline[] = [];
  hasData = false;

  get plotLeftPx(): number {
    return this.plotLeft;
  }

  get plotRightPx(): number {
    return this.viewBoxWidth - this.plotRight;
  }

  get baselineY(): number {
    return this.viewBoxHeight - this.plotBottom;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('stats' in changes) {
      this.build();
    }
  }

  barPath(bar: ChartBar): string {
    if (bar.height <= 0) return '';
    const r = Math.min(4, bar.width / 2, bar.height);
    const { x, y, width: w, height: h } = bar;

    return `M${x},${y + h}
            L${x},${y + r}
            Q${x},${y} ${x + r},${y}
            L${x + w - r},${y}
            Q${x + w},${y} ${x + w},${y + r}
            L${x + w},${y + h}
            Z`;
  }

  private build(): void {
    this.series = [];
    this.groups = [];
    this.bars = [];
    this.gridlines = [];
    this.hasData = false;

    if (!this.stats || this.stats.categories.length === 0) {
      return;
    }

    const grandTotal = this.stats.data.reduce(
      (sum, row) => sum + row.counts.reduce((a, b) => a + b, 0),
      0,
    );
    if (grandTotal === 0) {
      return;
    }
    this.hasData = true;

    const categories = this.stats.categories;
    const direct = categories.slice(0, SERIES_SLOTS);
    const overflow = categories.slice(SERIES_SLOTS);

    this.series = direct.map((c, i) => ({
      key: String(c.id),
      name: c.name,
      colorVar: `--series-${i + 1}`,
      isOther: false,
    }));

    if (overflow.length > 0) {
      this.series.push({ key: 'other', name: 'Outras', colorVar: '--series-other', isOther: true });
    }

    const seriesIndexByCategoryIndex = categories.map((_, i) => (i < SERIES_SLOTS ? i : direct.length));

    const seriesCountsByMonth: number[][] = this.stats.data.map((row) => {
      const perSeries = new Array(this.series.length).fill(0);
      row.counts.forEach((value, categoryIndex) => {
        perSeries[seriesIndexByCategoryIndex[categoryIndex]] += value;
      });
      return perSeries;
    });

    const maxValue = Math.max(...seriesCountsByMonth.flat(), 1);
    const niceMax = this.niceMax(maxValue);
    const stepCount = 4;
    const step = niceMax / stepCount;

    const plotWidth = this.viewBoxWidth - this.plotLeft - this.plotRight;
    const plotHeight = this.viewBoxHeight - this.plotTop - this.plotBottom;

    for (let i = 0; i <= stepCount; i++) {
      const value = step * i;
      const y = this.plotTop + plotHeight - (value / niceMax) * plotHeight;
      this.gridlines.push({ y, label: Math.round(value).toLocaleString('pt-BR') });
    }

    const groupWidth = plotWidth / 12;
    const usableGroupWidth = groupWidth * 0.82;
    const barGap = 2;
    const rawBarWidth = (usableGroupWidth - barGap * (this.series.length - 1)) / this.series.length;
    const barWidth = Math.max(2, Math.min(24, rawBarWidth));
    const totalBarsWidth = barWidth * this.series.length + barGap * (this.series.length - 1);

    MONTH_LABELS.forEach((label, monthIndex) => {
      const groupStartX = this.plotLeft + groupWidth * monthIndex;
      const groupX = groupStartX + (groupWidth - totalBarsWidth) / 2;

      this.groups.push({ monthLabel: label, x: groupStartX + groupWidth / 2 });

      const counts = seriesCountsByMonth[monthIndex] ?? [];
      this.series.forEach((s, seriesIndex) => {
        const value = counts[seriesIndex] ?? 0;
        const barHeight = (value / niceMax) * plotHeight;
        this.bars.push({
          x: groupX + seriesIndex * (barWidth + barGap),
          y: this.plotTop + plotHeight - barHeight,
          width: barWidth,
          height: barHeight,
          colorVar: s.colorVar,
          value,
          seriesName: s.name,
          monthLabel: label,
        });
      });
    });
  }

  private niceMax(value: number): number {
    const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
    const normalized = value / magnitude;

    let niceNormalized: number;
    if (normalized <= 1) niceNormalized = 1;
    else if (normalized <= 2) niceNormalized = 2;
    else if (normalized <= 5) niceNormalized = 5;
    else niceNormalized = 10;

    return niceNormalized * magnitude;
  }
}