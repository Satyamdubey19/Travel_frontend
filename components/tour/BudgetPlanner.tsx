'use client'

import { useState } from 'react'

type BudgetPlannerProps = {
  basePrice: number
  groupSize?: number
  onUpdate?: (budget: BudgetBreakdown[]) => void
}

export type BudgetBreakdown = {
  id: string
  name: string
  amount: number
  paidBy: string
  participants: string[]
}

const BUDGET_CATEGORIES = [
  { label: 'Accommodation', key: 'accommodation', percent: 35, color: 'bg-blue-500' },
  { label: 'Transport', key: 'transport', percent: 20, color: 'bg-amber-500' },
  { label: 'Food & Dining', key: 'food', percent: 20, color: 'bg-emerald-500' },
  { label: 'Activities', key: 'activities', percent: 15, color: 'bg-violet-500' },
  { label: 'Miscellaneous', key: 'misc', percent: 10, color: 'bg-slate-400' },
]

export const BudgetPlanner = ({ basePrice }: BudgetPlannerProps) => {
  const [travelers, setTravelers] = useState(2)
  const [budgetStyle, setBudgetStyle] = useState<'budget' | 'comfort' | 'premium'>('comfort')
  const [customExpenses, setCustomExpenses] = useState<{ name: string; amount: number }[]>([])
  const [newExpense, setNewExpense] = useState({ name: '', amount: '' })
  const [showAddExpense, setShowAddExpense] = useState(false)

  const multiplier = budgetStyle === 'budget' ? 0.8 : budgetStyle === 'premium' ? 1.5 : 1
  const adjustedPrice = Math.round(basePrice * multiplier)
  const totalCustom = customExpenses.reduce((s, e) => s + e.amount, 0)
  const totalPerPerson = adjustedPrice + Math.round(totalCustom / travelers)
  const grandTotal = adjustedPrice * travelers + totalCustom

  const addExpense = () => {
    const amt = Number(newExpense.amount)
    if (newExpense.name.trim() && amt > 0) {
      setCustomExpenses([...customExpenses, { name: newExpense.name.trim(), amount: amt }])
      setNewExpense({ name: '', amount: '' })
      setShowAddExpense(false)
    }
  }

  const removeExpense = (idx: number) => {
    setCustomExpenses(customExpenses.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-8">
      {/* Budget Style Selector */}
      <div className="grid grid-cols-3 gap-3">
        {([
          { key: 'budget' as const, label: 'Budget', desc: 'Hostels & local food', icon: '🎒' },
          { key: 'comfort' as const, label: 'Comfort', desc: 'Hotels & restaurants', icon: '🏨' },
          { key: 'premium' as const, label: 'Premium', desc: 'Luxury & fine dining', icon: '✨' },
        ]).map((style) => (
          <button
            key={style.key}
            onClick={() => setBudgetStyle(style.key)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              budgetStyle === style.key
                ? 'border-slate-900 bg-slate-50'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <span className="text-xl">{style.icon}</span>
            <p className={`font-semibold text-sm mt-2 ${budgetStyle === style.key ? 'text-slate-900' : 'text-slate-700'}`}>
              {style.label}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{style.desc}</p>
          </button>
        ))}
      </div>

      {/* Travelers Counter */}
      <div className="flex items-center justify-between bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div>
          <p className="text-sm font-semibold text-slate-900">Number of Travelers</p>
          <p className="text-xs text-slate-500 mt-0.5">Split costs equally among group</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTravelers(Math.max(1, travelers - 1))}
            className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition text-sm font-medium"
          >−</button>
          <span className="text-lg font-semibold text-slate-900 min-w-[2rem] text-center">{travelers}</span>
          <button
            onClick={() => setTravelers(Math.min(12, travelers + 1))}
            className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition text-sm font-medium"
          >+</button>
        </div>
      </div>

      {/* Price Overview Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-500 font-medium uppercase">Per Person</p>
          <p className="text-xl font-semibold text-slate-900 mt-1">₹{totalPerPerson.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-500 font-medium uppercase">Group Total</p>
          <p className="text-xl font-semibold text-slate-900 mt-1">₹{grandTotal.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-500 font-medium uppercase">Daily Avg</p>
          <p className="text-xl font-semibold text-slate-900 mt-1">₹{Math.round(totalPerPerson / 5).toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">per person/day</p>
        </div>
      </div>

      {/* Budget Breakdown - Visual Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h4 className="font-semibold text-slate-900 mb-4 text-sm">Cost Breakdown</h4>
        <div className="flex h-3 rounded-full overflow-hidden mb-6">
          {BUDGET_CATEGORIES.map((cat) => (
            <div key={cat.key} className={`${cat.color} transition-all`} style={{ width: `${cat.percent}%` }} />
          ))}
        </div>
        <div className="space-y-3">
          {BUDGET_CATEGORIES.map((cat) => {
            const amount = Math.round(adjustedPrice * cat.percent / 100)
            return (
              <div key={cat.key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                  <span className="text-sm text-slate-700">{cat.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">{cat.percent}%</span>
                  <span className="text-sm font-medium text-slate-900 min-w-[5rem] text-right">₹{amount.toLocaleString()}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Custom Expenses */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-900 text-sm">Additional Expenses</h4>
          <button
            onClick={() => setShowAddExpense(!showAddExpense)}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 transition px-3 py-1.5 border border-slate-200 rounded-lg hover:border-slate-300"
          >+ Add Expense</button>
        </div>
        {showAddExpense && (
          <div className="flex gap-2 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <input
              type="text"
              placeholder="e.g., Souvenirs"
              value={newExpense.name}
              onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
            />
            <input
              type="number"
              placeholder="₹ Amount"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              className="w-28 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
            />
            <button onClick={addExpense} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition">Add</button>
          </div>
        )}
        {customExpenses.length > 0 ? (
          <div className="space-y-2">
            {customExpenses.map((expense, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">{expense.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-900">₹{expense.amount.toLocaleString()}</span>
                  <button onClick={() => removeExpense(idx)} className="text-slate-400 hover:text-red-500 transition text-sm">×</button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">Split among {travelers} traveler{travelers > 1 ? 's' : ''}</span>
              <span className="text-xs font-medium text-slate-700">₹{Math.round(totalCustom / travelers).toLocaleString()} each</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">No additional expenses yet. Add shopping, tips, or other costs.</p>
        )}
      </div>

      {/* Settlement Summary */}
      <div className="bg-slate-900 text-white rounded-lg p-6">
        <h4 className="font-semibold text-sm mb-4">Payment Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-300">Tour package × {travelers}</span>
            <span>₹{(adjustedPrice * travelers).toLocaleString()}</span>
          </div>
          {totalCustom > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-300">Additional expenses</span>
              <span>₹{totalCustom.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-300">Taxes & fees (5%)</span>
            <span>₹{Math.round(grandTotal * 0.05).toLocaleString()}</span>
          </div>
          <div className="border-t border-slate-700 pt-2 mt-2 flex justify-between text-base font-semibold">
            <span>Grand Total</span>
            <span>₹{Math.round(grandTotal * 1.05).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-emerald-400 text-xs pt-1">
            <span>Per person share</span>
            <span>₹{Math.round((grandTotal * 1.05) / travelers).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="border border-slate-200 rounded-lg p-4 bg-amber-50/50">
        <p className="text-xs font-semibold text-slate-700 mb-2">💡 Budget Tips</p>
        <ul className="text-xs text-slate-600 space-y-1.5">
          <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>Book 30+ days in advance for 10-15% lower prices</li>
          <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>Groups of 4+ get better per-person rates on hotels</li>
          <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>Carry cash for local markets — cards may not work everywhere</li>
          <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>Set aside ₹500-1000/day for unplanned expenses</li>
        </ul>
      </div>
    </div>
  )
}
