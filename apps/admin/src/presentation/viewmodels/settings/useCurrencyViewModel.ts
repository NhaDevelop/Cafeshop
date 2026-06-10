import { defineStore } from 'pinia'

export type CurrencyCode = 'USD' | 'KHR'

export const useCurrencyStore = defineStore('currency', {
  state: () => ({
    activeCurrency: 'USD' as CurrencyCode,
    exchangeRate: 4100, // 1 USD = 4100 KHR (editable)
  }),
  actions: {
    setCurrency(code: CurrencyCode) {
      this.activeCurrency = code
    },
    setExchangeRate(rate: number) {
      if (rate > 0) this.exchangeRate = rate
    },
    toggle() {
      this.activeCurrency = this.activeCurrency === 'USD' ? 'KHR' : 'USD'
    }
  },
  getters: {
    symbol: (state) => state.activeCurrency === 'USD' ? '$' : '៛',
    isKHR: (state) => state.activeCurrency === 'KHR',
    format: (state) => (usdAmount: number): string => {
      if (state.activeCurrency === 'KHR') {
        const khr = Math.round(usdAmount * state.exchangeRate)
        return `${khr.toLocaleString('en-US')} ៛`
      }
      return `$${usdAmount.toFixed(2)}`
    }
  },
  persist: true
})
