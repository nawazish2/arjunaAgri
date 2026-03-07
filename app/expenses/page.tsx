'use client';
import AuthGuard from '@/components/AuthGuard';
import { useState, useEffect } from 'react';

interface Expense {
  id: string;
  category: string;
  item: string;
  amount: number;
  acres: number;
  date: string;
  note: string;
}

const CATEGORIES = [
  { label: 'Seeds', icon: '🌱', color: '#22c55e' },
  { label: 'Fertilizer', icon: '🧪', color: '#60a5fa' },
  { label: 'Pesticide', icon: '🔬', color: '#f59e0b' },
  { label: 'Labour', icon: '👷', color: '#a78bfa' },
  { label: 'Irrigation', icon: '💧', color: '#38bdf8' },
  { label: 'Equipment', icon: '🚜', color: '#fb923c' },
  { label: 'Other', icon: '📦', color: '#94a3b8' },
];

const STORAGE_KEY = 'arjuna_expenses';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'Seeds', item: '', amount: '', acres: '1', note: '', date: new Date().toISOString().split('T')[0] });
  const [totalAcres, setTotalAcres] = useState(2);
  const [budget, setBudget] = useState(50000);
  const [filterCat, setFilterCat] = useState('All');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setExpenses(JSON.parse(saved));
    const acres = localStorage.getItem('arjuna_farm_acres');
    if (acres) setTotalAcres(Number(acres));
  }, []);

  const save = (updated: Expense[]) => {
    setExpenses(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addExpense = () => {
    if (!form.item || !form.amount) return;
    const expense: Expense = {
      id: Date.now().toString(),
      category: form.category,
      item: form.item,
      amount: Number(form.amount),
      acres: Number(form.acres),
      date: form.date,
      note: form.note,
    };
    save([expense, ...expenses]);
    setForm({ category: 'Seeds', item: '', amount: '', acres: '1', note: '', date: new Date().toISOString().split('T')[0] });
    setShowForm(false);
  };

  const remove = (id: string) => {
    if (confirm('Delete this expense?')) save(expenses.filter(e => e.id !== id));
  };

  const filtered = filterCat === 'All' ? expenses : expenses.filter(e => e.category === filterCat);
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const budgetLeft = budget - totalSpent;
  const budgetPct = Math.min((totalSpent / budget) * 100, 100);

  const byCategory = CATEGORIES.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.label).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const fmt = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(1)}K` : `₹${n}`;

  return (
    <AuthGuard>
      <div className="min-h-screen relative overflow-hidden">
        <div className="orb w-64 h-64 -top-16 -right-16" style={{ background: '#a78bfa' }} />
        <div className="orb w-56 h-56 bottom-32 -left-12" style={{ background: '#22c55e', animationDelay: '2s' }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 page-enter">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold gradient-text">Input Cost Tracker</h1>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary py-2 px-4 text-sm">
              {showForm ? '✕ Cancel' : '+ Add'}
            </button>
          </div>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Track every rupee spent on your farm</p>

          {/* Budget summary */}
          <div className="glass-card rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Spent</p>
                <p className="text-2xl font-black mt-0.5" style={{ color: budgetLeft < 0 ? '#f87171' : 'var(--text-primary)' }}>
                  {fmt(totalSpent)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Budget Remaining</p>
                <p className="text-lg font-bold mt-0.5" style={{ color: budgetLeft >= 0 ? '#4ade80' : '#f87171' }}>
                  {budgetLeft >= 0 ? fmt(budgetLeft) : `-${fmt(Math.abs(budgetLeft))}`}
                </p>
              </div>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${budgetPct}%`,
                  background: budgetPct > 90 ? 'linear-gradient(90deg,#ef4444,#f87171)' :
                    budgetPct > 70 ? 'linear-gradient(90deg,#f59e0b,#fcd34d)' :
                    'linear-gradient(90deg,#22c55e,#4ade80)',
                }} />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{budgetPct.toFixed(0)}% of budget used</p>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Budget:</span>
                <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))}
                  className="text-xs font-bold w-24 bg-transparent text-right outline-none border-b"
                  style={{ color: '#4ade80', borderColor: 'rgba(34,197,94,0.3)' }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="rounded-xl p-2.5" style={{ background: 'rgba(6,26,13,0.6)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Entries</p>
                <p className="font-bold mt-0.5">{expenses.length}</p>
              </div>
              <div className="rounded-xl p-2.5" style={{ background: 'rgba(6,26,13,0.6)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Per Acre</p>
                <p className="font-bold mt-0.5">{totalAcres > 0 ? fmt(Math.round(totalSpent / totalAcres)) : '—'}</p>
              </div>
              <div className="rounded-xl p-2.5" style={{ background: 'rgba(6,26,13,0.6)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Farm Size</p>
                <div className="flex items-center gap-1">
                  <input type="number" value={totalAcres} min={0.5} max={100} step={0.5}
                    onChange={e => { setTotalAcres(Number(e.target.value)); localStorage.setItem('arjuna_farm_acres', e.target.value); }}
                    className="font-bold w-10 bg-transparent outline-none text-xs"
                    style={{ color: 'var(--text-primary)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>ac</span>
                </div>
              </div>
            </div>
          </div>

          {/* Add form */}
          {showForm && (
            <div className="glass-card rounded-2xl p-5 mb-4 success-flash space-y-3">
              <p className="section-title">Add Expense</p>

              <div>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.label} onClick={() => setForm(f => ({ ...f, category: cat.label }))}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                      style={{
                        background: form.category === cat.label ? `${cat.color}22` : 'rgba(6,26,13,0.6)',
                        color: form.category === cat.label ? cat.color : 'rgba(134,239,172,0.4)',
                        border: `1px solid ${form.category === cat.label ? `${cat.color}55` : 'rgba(34,197,94,0.1)'}`,
                      }}>
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Item/Description *</label>
                  <input placeholder="e.g. DAP fertilizer" value={form.item}
                    onChange={e => setForm(f => ({ ...f, item: e.target.value }))}
                    className="input-field" />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Amount (₹) *</label>
                  <input type="number" placeholder="0" value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="input-field" />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Acres</label>
                  <input type="number" placeholder="1" value={form.acres} min={0.5} step={0.5}
                    onChange={e => setForm(f => ({ ...f, acres: e.target.value }))}
                    className="input-field" />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Date</label>
                  <input type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="input-field" />
                </div>
              </div>

              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Note (optional)</label>
                <input placeholder="e.g. Bought from Ram Agro Centre" value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  className="input-field" />
              </div>

              <button onClick={addExpense} disabled={!form.item || !form.amount}
                className="btn-primary w-full justify-center"
                style={{ opacity: (!form.item || !form.amount) ? 0.5 : 1 }}>
                ✓ Save Expense
              </button>
            </div>
          )}

          {/* Category breakdown */}
          {byCategory.length > 0 && (
            <div className="glass-card rounded-2xl p-5 mb-4">
              <p className="section-title mb-3">Spending by Category</p>
              <div className="space-y-2.5">
                {byCategory.map(cat => (
                  <div key={cat.label} className="flex items-center gap-3">
                    <span>{cat.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: 'var(--text-secondary)' }}>{cat.label}</span>
                        <span style={{ color: 'var(--text-primary)' }}>{fmt(cat.total)}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full" style={{ width: `${(cat.total / totalSpent) * 100}%`, background: cat.color }} />
                      </div>
                    </div>
                    <span className="text-xs w-8 text-right" style={{ color: 'var(--text-muted)' }}>
                      {Math.round((cat.total / totalSpent) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter + list */}
          {expenses.length > 0 && (
            <>
              <div className="flex gap-2 mb-3 flex-wrap">
                {['All', ...CATEGORIES.map(c => c.label)].map(cat => (
                  <button key={cat} onClick={() => setFilterCat(cat)}
                    className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                    style={{
                      background: filterCat === cat ? 'rgba(34,197,94,0.15)' : 'transparent',
                      color: filterCat === cat ? '#4ade80' : 'rgba(134,239,172,0.4)',
                      border: `1px solid ${filterCat === cat ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.08)'}`,
                    }}>{cat}</button>
                ))}
              </div>

              <div className="space-y-2">
                {filtered.map(expense => {
                  const cat = CATEGORIES.find(c => c.label === expense.category)!;
                  return (
                    <div key={expense.id} className="flex items-center gap-3 rounded-xl px-4 py-3 card-hover"
                      style={{ background: 'rgba(6,26,13,0.5)', border: '1px solid rgba(34,197,94,0.08)' }}>
                      <span className="text-lg">{cat?.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{expense.item}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {expense.category} · {expense.acres} ac · {expense.date}
                        </p>
                        {expense.note && <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(134,239,172,0.3)' }}>{expense.note}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>-{fmt(expense.amount)}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>/{expense.acres}ac</p>
                      </div>
                      <button onClick={() => remove(expense.id)} className="ml-1 text-xs opacity-40 hover:opacity-100"
                        style={{ color: '#f87171' }}>✕</button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {expenses.length === 0 && (
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-3xl mb-3">💸</p>
              <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No expenses yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Tap + Add to log your first farming expense</p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
