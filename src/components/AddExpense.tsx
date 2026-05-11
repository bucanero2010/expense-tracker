'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { CATEGORIES, getSubcategories } from '@/lib/categories';
import { format } from 'date-fns';
import { Check, Calendar } from 'lucide-react';

interface AddExpenseProps {
  onSuccess: () => void;
}

export function AddExpense({ onSuccess }: AddExpenseProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);

  const subcategories = category ? getSubcategories(category) : [];

  const handleSubmit = async () => {
    if (!amount || !category || !subcategory) return;

    setSaving(true);
    const { error } = await supabase.from('expenses').insert({
      date,
      category,
      subcategory,
      amount: parseFloat(amount),
      note: note || null,
    });

    setSaving(false);

    if (!error) {
      // Reset form
      setAmount('');
      setCategory('');
      setSubcategory('');
      setNote('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      onSuccess();
    }
  };

  const handleCategorySelect = (cat: string) => {
    setCategory(cat);
    setSubcategory('');
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-6">Add Expense</h1>

      {/* Amount input - big and prominent */}
      <div className="mb-6">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-[var(--muted)]">
            €
          </span>
          <input
            ref={amountRef}
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-[var(--card)] border border-[var(--card-border)] rounded-xl pl-10 pr-4 py-4 text-3xl font-semibold text-center focus:outline-none focus:border-[var(--accent)] transition-colors"
            autoFocus
          />
        </div>
      </div>

      {/* Date selector */}
      <div className="mb-4">
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="flex items-center gap-2 px-3 py-2 bg-[var(--card)] border border-[var(--card-border)] rounded-lg text-sm"
        >
          <Calendar size={16} />
          <span>{date === format(new Date(), 'yyyy-MM-dd') ? 'Today' : date}</span>
        </button>
        {showDatePicker && (
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setShowDatePicker(false);
            }}
            className="mt-2 w-full bg-[var(--card)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none"
          />
        )}
      </div>

      {/* Category grid */}
      <div className="mb-4">
        <label className="text-sm text-[var(--muted)] mb-2 block">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategorySelect(cat.name)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                category === cat.name
                  ? 'ring-2 ring-[var(--accent)] bg-[var(--accent)]/10 text-white'
                  : 'bg-[var(--card)] border border-[var(--card-border)] text-[var(--foreground)]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory chips */}
      {subcategories.length > 0 && (
        <div className="mb-4">
          <label className="text-sm text-[var(--muted)] mb-2 block">Subcategory</label>
          <div className="flex flex-wrap gap-2">
            {subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setSubcategory(sub)}
                className={`px-3 py-2 rounded-full text-sm transition-all ${
                  subcategory === sub
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--card)] border border-[var(--card-border)] text-[var(--foreground)]'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Optional note */}
      <div className="mb-6">
        <label className="text-sm text-[var(--muted)] mb-2 block">Note (optional)</label>
        <input
          type="text"
          placeholder="Quick note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-[var(--card)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!amount || !category || !subcategory || saving}
        className="w-full bg-[var(--accent)] text-white font-semibold py-3.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        <Check size={20} />
        {saving ? 'Saving...' : 'Save Expense'}
      </button>
    </div>
  );
}
