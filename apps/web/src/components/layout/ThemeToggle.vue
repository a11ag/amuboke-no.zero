<script setup lang="ts">
// 右上角主题切换：经典站 → ZZZ 主题。
// 几何中心就是圆形扩散圆心，具体切换逻辑见 composables/useThemeSwitch.ts。
import { ref } from 'vue'
import { prefetchZzz, switchToZzz } from '@/composables/useThemeSwitch'

const button = ref<HTMLButtonElement | null>(null)

function onClick(): void {
  if (button.value) switchToZzz(button.value)
}

function onIntent(): void {
  prefetchZzz()
}
</script>

<template>
  <button
    ref="button"
    type="button"
    class="theme-toggle"
    aria-label="切换到 ZZZ 主题"
    title="切换到 ZZZ 主题"
    @click="onClick"
    @pointerenter="onIntent"
    @pointerdown="onIntent"
    @touchstart.passive="onIntent"
    @focus="onIntent"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7">
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 3.6a8.4 8.4 0 0 1 0 16.8z" fill="currentColor" stroke="none" />
    </svg>
    <span class="theme-toggle__label">ZZZ</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  position: absolute;
  top: 50%;
  right: var(--theme-spacing-md);
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 10px;
  transform: translateY(-50%);
  border: 1px solid var(--theme-border);
  border-radius: var(--theme-radius-md);
  background: var(--theme-scrim);
  color: var(--theme-on-surface);
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  letter-spacing: 0.08em;
  line-height: 1;
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease,
    transform 160ms ease;
}
.theme-toggle:hover {
  color: var(--theme-primary);
  border-color: color-mix(in srgb, var(--theme-primary) 55%, transparent);
  background: color-mix(in srgb, var(--theme-primary) 10%, transparent);
  transform: translateY(-50%) scale(1.03);
}
.theme-toggle:focus-visible {
  outline: 2px solid var(--theme-primary);
  outline-offset: 2px;
}
.theme-toggle[data-switching] {
  pointer-events: none;
  animation: theme-toggle-pulse 520ms ease-in-out infinite alternate;
}
@keyframes theme-toggle-pulse {
  to {
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--theme-primary) 24%, transparent);
  }
}
.theme-toggle svg {
  display: block;
  width: 14px;
  height: 14px;
  flex: none;
}
.theme-toggle__label {
  line-height: 1;
}
@media (max-width: 640px) {
  .theme-toggle {
    right: var(--theme-spacing-sm);
    height: 28px;
    padding: 0 8px;
    gap: 4px;
  }
}
</style>
