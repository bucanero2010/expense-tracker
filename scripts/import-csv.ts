/**
 * Import script: reads the existing CSV and inserts into Supabase.
 *
 * Usage:
 *   npx tsx scripts/import-csv.ts
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { parse } from 'path';

// Load env from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Subcategory mapping: maps the free-text "Comment" to a standardized subcategory
const SUBCATEGORY_MAP: Record<string, Record<string, string>> = {
  Food: {
    Compras: 'Compras',
    Almuerzo: 'Almuerzo',
    Cena: 'Cena',
    Snack: 'Snack',
    Desayuno: 'Desayuno',
    Vino: 'Snack',
    Alyssa: 'Compras', // shared expense
  },
  Home: {
    Hipoteca: 'Hipoteca',
    Mantenimiento: 'Mantenimiento',
    Seguro: 'Seguro',
    IBI: 'IBI',
    Limpieza: 'Limpieza',
    Extension: 'Otro',
    Balde: 'Otro',
    Termo: 'Otro',
  },
  Sports: {
    Padel: 'Padel',
    Gimnasio: 'Gimnasio',
    'Clases Padel': 'Clases Padel',
    Proteina: 'Proteina',
    Compresor: 'Equipamiento',
    Pala: 'Equipamiento',
    Pelotas: 'Equipamiento',
    Pozo: 'Padel',
    Otros: 'Otro',
    Compras: 'Equipamiento',
  },
  Transportation: {
    Metro: 'Metro',
    Bolt: 'Bolt',
    Bicimad: 'Bicimad',
    Tren: 'Tren',
    Bus: 'Bus',
    'Cable car': 'Otro',
    Voltio: 'Otro',
  },
  Utilities: {
    Luz: 'Luz',
    Internet: 'Internet',
  },
  Entertainment: {
    Poker: 'Poker',
    Cine: 'Cine',
    Youtube: 'Youtube',
    Prime: 'Prime',
    Fifa: 'Juegos',
    Juegos: 'Juegos',
    Juego: 'Juegos',
    Piano: 'Piano',
    Bolos: 'Otro',
    Cargador: 'Otro',
    'Google One': 'Otro',
    'Banana boat': 'Otro',
    'Huaca Pucllana': 'Otro',
    Museo: 'Otro',
    Museos: 'Otro',
    Tour: 'Otro',
    Zoo: 'Otro',
  },
  Travel: {
    Vuelos: 'Vuelos',
    Hotel: 'Hotel',
    Tren: 'Tren',
    Tour: 'Tour',
    Museos: 'Museos',
    Asientos: 'Asientos',
    'City tax': 'Hotel',
    Entradas: 'Otro',
    'Carry on': 'Vuelos',
  },
  'Health/medical': {
    Tijeras: 'Otro',
    'Corte de pelo': 'Corte de pelo',
    C: 'Farmacia',
    Sorochipil: 'Farmacia',
  },
  Debt: {
    Hipoteca: 'Hipoteca',
  },
  Other: {
    Regalo: 'Regalo',
    Ropa: 'Ropa',
    'Ba\u00f1o': 'Otro',
    Case: 'Otro',
    Vela: 'Otro',
    Pilas: 'Otro',
    Renta: 'Renta',
  },
};

function mapSubcategory(category: string, comment: string): string {
  const catMap = SUBCATEGORY_MAP[category];
  if (!catMap) return 'Otro';
  return catMap[comment] ?? 'Otro';
}

function parseDate(dateStr: string): string {
  // Input format: M/D/YY → output: YYYY-MM-DD
  const parts = dateStr.split('/');
  if (parts.length !== 3) return '';
  const month = parts[0].padStart(2, '0');
  const day = parts[1].padStart(2, '0');
  let year = parts[2];
  if (year.length === 2) {
    year = parseInt(year) >= 50 ? `19${year}` : `20${year}`;
  }
  return `${year}-${month}-${day}`;
}

async function main() {
  const csvPath = process.argv[2] || '../Monthly Budget.csv';
  const content = readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').slice(1); // skip header

  const records: Array<{
    date: string;
    category: string;
    subcategory: string;
    amount: number;
    note: string | null;
  }> = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    // Parse CSV (simple — no quoted fields with commas in this data)
    const parts = line.split(',');
    if (parts.length < 5) continue;

    const timestamp = parts[0];
    const dateStr = parts[1];
    const category = parts[2];
    const value = parts[3];
    const comment = parts.slice(4).join(',').trim(); // in case comment has commas

    if (!dateStr || !category || !value) continue;

    const date = parseDate(dateStr);
    if (!date) continue;

    const amount = parseFloat(value);
    if (isNaN(amount)) continue;

    const subcategory = mapSubcategory(category, comment);

    records.push({
      date,
      category,
      subcategory,
      amount,
      note: comment !== subcategory ? comment : null,
    });
  }

  console.log(`Parsed ${records.length} records from CSV`);

  // Insert in batches of 100
  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from('expenses').insert(batch);
    if (error) {
      console.error(`Error inserting batch at index ${i}:`, error.message);
    } else {
      inserted += batch.length;
    }
  }

  console.log(`Successfully inserted ${inserted} records`);
}

main().catch(console.error);
