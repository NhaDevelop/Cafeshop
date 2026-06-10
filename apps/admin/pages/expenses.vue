<template>
  <div class="ops-page">
    <header class="ops-header">
      <div>
        <h1 class="ops-title">Expenses</h1>
        <p class="text-muted">Track operating costs and daily profit</p>
      </div>
    </header>

    <div class="summary-row">
      <div class="summary-card card">
        <span class="label">Today Revenue</span>
        <strong>{{ currencyStore.format(orderStore.todayRevenue) }}</strong>
      </div>
      <div class="summary-card card warning">
        <span class="label">Today Expenses</span>
        <strong>{{ currencyStore.format(expenseStore.todayTotal) }}</strong>
      </div>
      <div class="summary-card card profit">
        <span class="label">Estimated Profit</span>
        <strong>{{ currencyStore.format(orderStore.todayRevenue - expenseStore.todayTotal) }}</strong>
      </div>
    </div>

    <section class="card form-card">
      <h2>Add Expense</h2>
      <div class="expense-form">
        <input v-model="form.date" type="date" />
        <input v-model="form.category" placeholder="Category" />
        <input v-model="form.description" placeholder="Description" />
        <input v-model.number="form.amount" type="number" min="0" step="0.01" placeholder="Amount" />
        <button class="btn btn-primary" @click="addExpense">Add</button>
      </div>
    </section>

    <section class="card table-card">
      <div class="table-header"><h2>Expense Ledger</h2></div>
      <table class="ops-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in expenseStore.expenses" :key="expense.id">
            <td>{{ expense.date }}</td>
            <td>{{ expense.category }}</td>
            <td>{{ expense.description }}</td>
            <td><strong>{{ currencyStore.format(expense.amount) }}</strong></td>
            <td><button class="mini-btn danger" @click="expenseStore.removeExpense(expense.id)">Delete</button></td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth' })

const expenseStore = useExpenseStore()
const orderStore = useOrderStore()
const currencyStore = useCurrencyStore()
const authStore = useAuthStore()

const today = new Date().toISOString().split('T')[0]
const form = ref({ date: today, category: 'Inventory', description: '', amount: 0 })

const addExpense = () => {
  if (!form.value.description || form.value.amount <= 0) return
  expenseStore.addExpense({
    date: form.value.date,
    category: form.value.category || 'Other',
    description: form.value.description,
    amount: form.value.amount,
    createdBy: authStore.user?.name || 'Admin',
  })
  form.value = { date: today, category: 'Inventory', description: '', amount: 0 }
}
</script>

<style scoped>
.ops-page { padding:28px; display:flex; flex-direction:column; gap:20px; flex:1; overflow-y:auto; }
.ops-header { display:flex; align-items:flex-start; justify-content:space-between; }
.ops-title { font-size:26px; font-weight:800; }
.summary-row { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
.summary-card { display:flex; flex-direction:column; gap:6px; border-radius:8px; }
.summary-card strong { font-size:26px; }
.summary-card.warning strong { color:var(--color-warning); }
.summary-card.profit strong { color:var(--color-success); }
.label { font-size:12px; font-weight:800; color:var(--color-muted); text-transform:uppercase; }
.form-card { display:flex; flex-direction:column; gap:14px; border-radius:8px; }
.form-card h2 { font-size:16px; margin:0; }
.expense-form { display:grid; grid-template-columns:150px 160px 1fr 140px auto; gap:10px; }
.expense-form input { border:1px solid var(--color-border); border-radius:8px; padding:10px 12px; font-family:var(--font); }
.table-card { padding:0; overflow:hidden; border-radius:8px; }
.table-header { padding:16px 20px; border-bottom:1px solid var(--color-border); }
.table-header h2 { font-size:16px; margin:0; }
.ops-table { width:100%; border-collapse:collapse; font-size:13px; }
.ops-table th { text-align:left; padding:10px 16px; color:var(--color-muted); background:var(--color-surface-2); font-size:11px; text-transform:uppercase; }
.ops-table td { padding:12px 16px; border-top:1px solid var(--color-border); }
.mini-btn { padding:5px 8px; border-radius:6px; background:var(--color-surface-2); font-weight:800; }
.mini-btn.danger { color:var(--color-danger); }
</style>
