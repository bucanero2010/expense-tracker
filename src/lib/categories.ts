import { CategoryConfig } from './types';

export const CATEGORIES: CategoryConfig[] = [
  {
    name: 'Food',
    subcategories: ['Compras', 'Almuerzo', 'Cena', 'Snack', 'Desayuno'],
    color: '#3b82f6', // blue
  },
  {
    name: 'Home',
    subcategories: ['Hipoteca', 'Mantenimiento', 'Seguro', 'IBI', 'Limpieza', 'Otro'],
    color: '#22c55e', // green
  },
  {
    name: 'Sports',
    subcategories: ['Padel', 'Gimnasio', 'Clases Padel', 'Proteina', 'Equipamiento', 'Otro'],
    color: '#f97316', // orange
  },
  {
    name: 'Transportation',
    subcategories: ['Metro', 'Bolt', 'Bicimad', 'Tren', 'Bus', 'Otro'],
    color: '#eab308', // yellow
  },
  {
    name: 'Utilities',
    subcategories: ['Luz', 'Internet'],
    color: '#8b5cf6', // purple
  },
  {
    name: 'Entertainment',
    subcategories: ['Poker', 'Cine', 'Youtube', 'Prime', 'Juegos', 'Piano', 'Otro'],
    color: '#ec4899', // pink
  },
  {
    name: 'Travel',
    subcategories: ['Vuelos', 'Hotel', 'Tren', 'Tour', 'Museos', 'Asientos', 'Otro'],
    color: '#14b8a6', // teal
  },
  {
    name: 'Health/medical',
    subcategories: ['Corte de pelo', 'Farmacia', 'Otro'],
    color: '#ef4444', // red
  },
  {
    name: 'Debt',
    subcategories: ['Hipoteca', 'Otro'],
    color: '#6b7280', // gray
  },
  {
    name: 'Other',
    subcategories: ['Regalo', 'Ropa', 'Renta', 'Otro'],
    color: '#a855f7', // violet
  },
];

export function getCategoryColor(categoryName: string): string {
  return CATEGORIES.find((c) => c.name === categoryName)?.color ?? '#6b7280';
}

export function getSubcategories(categoryName: string): string[] {
  return CATEGORIES.find((c) => c.name === categoryName)?.subcategories ?? [];
}
