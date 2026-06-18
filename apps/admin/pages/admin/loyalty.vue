<template>
  <div class="ops-page">
    <header class="ops-header">
      <div>
        <h1 class="ops-title">Loyalty</h1>
        <p class="text-muted">Customer points, visits, and lifetime spend</p>
      </div>
      <div class="value-card">
        <span class="label">Members</span>
        <strong>{{ loyaltyStore.customers.length }}</strong>
      </div>
    </header>

    <section class="card form-card">
      <h2>Register Customer</h2>
      <div class="register-form">
        <input v-model="name" placeholder="Customer name" />
        <input v-model="phone" placeholder="Phone number" />
        <button class="btn btn-primary" @click="register">Save Customer</button>
      </div>
    </section>

    <section class="card table-card">
      <div class="table-header"><h2>Customers</h2></div>
      <table class="ops-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Points</th>
            <th>Visits</th>
            <th>Total Spent</th>
            <th>Adjust</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in loyaltyStore.customers" :key="customer.id">
            <td><strong>{{ customer.name }}</strong></td>
            <td>{{ customer.phone }}</td>
            <td>{{ customer.points }}</td>
            <td>{{ customer.visits }}</td>
            <td>{{ currencyStore.format(customer.totalSpent) }}</td>
            <td>
              <button class="mini-btn" @click="loyaltyStore.adjustPoints(customer.id, 5)">+5</button>
              <button class="mini-btn" @click="loyaltyStore.adjustPoints(customer.id, -5)">-5</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth' })

const loyaltyStore = useLoyaltyStore()
const currencyStore = useCurrencyStore()
const name = ref('')
const phone = ref('')

const register = () => {
  if (!phone.value.trim()) return
  loyaltyStore.registerCustomer(name.value.trim() || 'Cafe Customer', phone.value.trim())
  name.value = ''
  phone.value = ''
}
</script>

<style scoped>
.ops-page { padding:28px; display:flex; flex-direction:column; gap:20px; flex:1; overflow-y:auto; }
.ops-header { display:flex; align-items:flex-start; justify-content:space-between; }
.ops-title { font-size:26px; font-weight:800; }
.value-card { min-width:150px; padding:14px 16px; border:1px solid var(--color-border); border-radius:8px; background:var(--color-surface); display:flex; flex-direction:column; gap:4px; }
.value-card strong { font-size:26px; color:var(--color-primary); }
.label { font-size:12px; font-weight:800; color:var(--color-muted); text-transform:uppercase; }
.form-card { display:flex; flex-direction:column; gap:14px; border-radius:8px; }
.form-card h2 { font-size:16px; margin:0; }
.register-form { display:grid; grid-template-columns:1fr 1fr auto; gap:10px; }
.register-form input { border:1px solid var(--color-border); border-radius:8px; padding:10px 12px; font-family:var(--font); }
.table-card { padding:0; overflow:hidden; border-radius:8px; }
.table-header { padding:16px 20px; border-bottom:1px solid var(--color-border); }
.table-header h2 { font-size:16px; margin:0; }
.ops-table { width:100%; border-collapse:collapse; font-size:13px; }
.ops-table th { text-align:left; padding:10px 16px; color:var(--color-muted); background:var(--color-surface-2); font-size:11px; text-transform:uppercase; }
.ops-table td { padding:12px 16px; border-top:1px solid var(--color-border); }
.mini-btn { padding:5px 8px; border-radius:6px; background:var(--color-surface-2); color:var(--color-text); font-weight:800; margin-right:6px; }
.mini-btn:hover { background:var(--color-border); }
</style>
