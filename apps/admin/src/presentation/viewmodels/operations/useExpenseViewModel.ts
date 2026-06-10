import { defineStore } from 'pinia'

export interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
  createdBy: string
}

const todayKey = () => new Date().toISOString().split('T')[0]

export const useExpenseStore = defineStore('expense', {
  state: () => ({
    expenses: [
      { id: 'exp_milk', date: todayKey(), category: 'Inventory', description: 'Milk purchase', amount: 28, createdBy: 'Admin' },
      { id: 'exp_internet', date: todayKey(), category: 'Utilities', description: 'Internet', amount: 15, createdBy: 'Admin' },
    ] as Expense[],
  }),
  actions: {
    addExpense(data: Omit<Expense, 'id'>) {
      this.expenses.unshift({ ...data, id: `exp_${Date.now()}` })
    },
    removeExpense(id: string) {
      this.expenses = this.expenses.filter(expense => expense.id !== id)
    },
  },
  getters: {
    todayExpenses: (state) => state.expenses.filter(expense => expense.date === todayKey()),
    todayTotal: (state) => state.expenses
      .filter(expense => expense.date === todayKey())
      .reduce((sum, expense) => sum + expense.amount, 0),
    totalByDate: (state) => (date: string) => state.expenses
      .filter(expense => expense.date === date)
      .reduce((sum, expense) => sum + expense.amount, 0),
  },
  persist: true,
})
