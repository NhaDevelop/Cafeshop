<template>
  <div class="app-shell">
    <header class="app-header">
      <NuxtLink to="/menu" class="header-logo">
        <span class="logo-icon"><Coffee :size="26" class="text-primary" /></span>
        <span class="logo-name">Brew & Co.</span>
      </NuxtLink>
      <NuxtLink to="/cart" class="cart-btn">
        <ShoppingCart :size="20" class="text-muted" />
        <span v-if="cart.count > 0" class="cart-count">{{ cart.count }}</span>
      </NuxtLink>
    </header>
    <main class="app-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { Coffee, ShoppingCart } from '@lucide/vue'
const cart = useCartStore()
</script>

<style scoped>
.app-shell { min-height:100vh; display:flex; flex-direction:column; }
.app-header {
  position:sticky; top:0; z-index:100;
  background:rgba(244,247,254,0.9); backdrop-filter:blur(12px);
  border-bottom:1px solid var(--color-border);
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 20px;
}
.header-logo { display:flex; align-items:center; gap:10px; }
.logo-icon { display:flex; align-items:center; }
.logo-name { font-size:18px; font-weight:800; color:var(--color-primary); letter-spacing:-.02em; }
.text-primary { color:var(--color-primary); }
.text-muted { color:var(--color-muted); }

.cart-btn {
  position:relative; font-size:22px; background:var(--color-surface);
  border:1.5px solid var(--color-border); border-radius:50%;
  width:44px; height:44px; display:flex; align-items:center; justify-content:center;
  transition:all var(--transition);
}
.cart-btn:hover { border-color:var(--color-primary); box-shadow:var(--glow); }
.cart-count {
  position:absolute; top:-4px; right:-4px;
  background:var(--color-primary); color:#fff;
  font-size:11px; font-weight:700; width:18px; height:18px;
  border-radius:50%; display:flex; align-items:center; justify-content:center;
  animation:bounce .4s ease;
}
.app-main { flex:1; max-width:480px; margin:0 auto; width:100%; padding:0 16px 100px; }
</style>
