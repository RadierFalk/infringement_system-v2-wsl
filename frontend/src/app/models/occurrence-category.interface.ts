// Os únicos roles que o backend realmente sabe resolver pra um e-mail
// são estes 4 (ver email_service.py: resolve_recipients). Qualquer outro
// texto no campo 'role' é aceito pelo banco (é uma coluna string livre),
// mas na hora de enviar e-mail o backend só loga um warning e ignora a
// regra — silenciosamente. Por isso restringimos as opções aqui a um
// <select>, em vez de um campo de texto livre: evita cadastrar uma regra
// que parece válida mas nunca vai disparar e-mail nenhum.
export enum SendingRuleRole {
  OFFENDER = 'offender',
  MANAGER = 'manager',
  PRESIDENT = 'president',
  CFO = 'cfo',
}

export enum SendingRuleType {
  TO = 'to',
  CC = 'cc',
}

export interface SendingRule {
  id: number;
  category_id: number;
  role: string;
  send_type: string;
}

export interface SendingRulePayload {
  category_id: number;
  role: string;
  send_type: string;
}

export interface OccurrenceCategory {
  id: number;
  name: string;
  description: string;
  sending_rules: SendingRule[];
}

export interface OccurrenceCategoryPayload {
  name: string;
  description: string;
}