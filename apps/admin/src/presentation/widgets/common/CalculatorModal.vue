<template>
  <Transition name="modal">
    <div v-if="modelValue" class="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 backdrop-blur-sm" @click.self="$emit('update:modelValue', false)">
      <div class="bg-white rounded-2xl w-72 overflow-hidden shadow-2xl flex flex-col">
        <div class="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 class="font-bold text-slate-700 flex items-center gap-2">
            <CalculatorIcon :size="16" /> Calculator
          </h3>
          <button class="text-slate-400 hover:text-red-500 transition-colors" @click="$emit('update:modelValue', false)">
            <X :size="18" />
          </button>
        </div>
        
        <div class="p-4 bg-slate-900">
          <div class="text-right text-slate-400 text-sm h-5 font-mono">{{ equation }}</div>
          <div class="text-right text-white text-3xl font-bold font-mono tracking-wider overflow-x-auto">{{ display }}</div>
        </div>

        <div class="grid grid-cols-4 gap-[1px] bg-slate-200">
          <button class="col-span-2 calc-btn bg-slate-100 text-red-500 font-bold" @click="clearAll">AC</button>
          <button class="calc-btn bg-slate-100 text-indigo-500" @click="deleteLast"><Delete :size="18" class="mx-auto" /></button>
          <button class="calc-btn bg-indigo-50 text-indigo-600 font-bold text-lg" @click="appendOp('/')">÷</button>
          
          <button class="calc-btn bg-white font-bold text-lg" @click="appendNum('7')">7</button>
          <button class="calc-btn bg-white font-bold text-lg" @click="appendNum('8')">8</button>
          <button class="calc-btn bg-white font-bold text-lg" @click="appendNum('9')">9</button>
          <button class="calc-btn bg-indigo-50 text-indigo-600 font-bold text-lg" @click="appendOp('*')">×</button>
          
          <button class="calc-btn bg-white font-bold text-lg" @click="appendNum('4')">4</button>
          <button class="calc-btn bg-white font-bold text-lg" @click="appendNum('5')">5</button>
          <button class="calc-btn bg-white font-bold text-lg" @click="appendNum('6')">6</button>
          <button class="calc-btn bg-indigo-50 text-indigo-600 font-bold text-lg" @click="appendOp('-')">−</button>
          
          <button class="calc-btn bg-white font-bold text-lg" @click="appendNum('1')">1</button>
          <button class="calc-btn bg-white font-bold text-lg" @click="appendNum('2')">2</button>
          <button class="calc-btn bg-white font-bold text-lg" @click="appendNum('3')">3</button>
          <button class="calc-btn bg-indigo-50 text-indigo-600 font-bold text-lg" @click="appendOp('+')">+</button>
          
          <button class="col-span-2 calc-btn bg-white font-bold text-lg" @click="appendNum('0')">0</button>
          <button class="calc-btn bg-white font-bold text-lg" @click="appendNum('.')">.</button>
          <button class="calc-btn bg-indigo-600 text-white font-bold text-xl hover:bg-indigo-700" @click="calculate">=</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Calculator as CalculatorIcon, X, Delete } from '@lucide/vue'

defineProps<{ modelValue: boolean }>()
defineEmits(['update:modelValue'])

const display = ref('0')
const equation = ref('')
const newNumber = ref(true)

const appendNum = (num: string) => {
  if (newNumber.value) {
    display.value = num === '.' ? '0.' : num
    newNumber.value = false
  } else {
    if (num === '.' && display.value.includes('.')) return
    display.value += num
  }
}

const appendOp = (op: string) => {
  if (!newNumber.value) {
    equation.value += display.value + ' ' + op + ' '
    newNumber.value = true
  } else if (equation.value) {
    equation.value = equation.value.slice(0, -2) + op + ' '
  }
}

const calculate = () => {
  if (!equation.value || newNumber.value) return
  try {
    const fullEq = equation.value + display.value
    // Safe eval for basic math
    const result = new Function('return ' + fullEq)()
    display.value = Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(4)).toString()
    equation.value = ''
    newNumber.value = true
  } catch (e) {
    display.value = 'Error'
    equation.value = ''
    newNumber.value = true
  }
}

const clearAll = () => {
  display.value = '0'
  equation.value = ''
  newNumber.value = true
}

const deleteLast = () => {
  if (newNumber.value) return
  display.value = display.value.length > 1 ? display.value.slice(0, -1) : '0'
  if (display.value === '0') newNumber.value = true
}
</script>

<style scoped>
.calc-btn {
  @apply py-4 text-center transition-colors active:bg-slate-200 outline-none;
}
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active > div, .modal-leave-active > div { transition: transform 0.2s; }
.modal-enter-from > div, .modal-leave-to > div { transform: scale(0.95); }
</style>
