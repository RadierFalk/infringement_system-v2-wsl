export interface StatsCategory {
    id: number | null;
    name: string;
}

export interface MonthlyStatsRow {
    month: number; // 1-12
    counts: number[]; // mesma ordem/posição de MonthlyByCategoryStats.categories
}

export interface MonthlyByCategoryStats {
    year: number;
    categories: StatsCategory[];
    data: MonthlyStatsRow[];
}

export interface AvailableYearsResponse {
    years: number[];
}