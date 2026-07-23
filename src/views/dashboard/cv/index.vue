<script setup lang="ts">
/**
 * CV Generator — pick one of six on-brand templates and it auto-fills from the
 * existing portfolio content (landing payload + journey graph). Choose the
 * language (EN / FR / AR) and an accent from the theme palette, preview it as a
 * live A4 page, then Print / Save as PDF.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import Icon from '@/components/Icon.vue'
import AppButton from '@/components/ui/AppButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useCvData } from '@/composables/useCvData'
import { cvAccents, cvTemplates } from '@/views/dashboard/cv/templates'
import type { CvLocale } from '@/views/dashboard/cv/types'

const { cv, locale, loading, error, loaded, fetch } = useCvData('en')

const selectedId = ref(cvTemplates[0].id)
const accent = ref(cvAccents[0].value)

const currentTemplate = computed(
  () => cvTemplates.find((t) => t.id === selectedId.value) ?? cvTemplates[0],
)

const languages: { id: CvLocale; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'fr', label: 'Français' },
  { id: 'ar', label: 'العربية' },
]

/* ── A4 preview scaling (fit the 210mm page into the preview column) ─────── */
const A4_W = 794 // 210mm @ 96dpi
const A4_H = 1123 // 297mm @ 96dpi
const viewport = ref<HTMLElement | null>(null)
const scale = ref(1)
const frameW = ref(A4_W)
const frameH = ref(A4_H)
let ro: ResizeObserver | null = null

function updateScale() {
  const vp = viewport.value
  if (!vp) return
  const avail = vp.clientWidth - 16
  const s = Math.min(1, Math.max(0.2, avail / A4_W))
  scale.value = s
  const page = vp.querySelector<HTMLElement>('.cv-page')
  const natH = page?.offsetHeight || A4_H
  frameW.value = Math.round(A4_W * s)
  frameH.value = Math.round(natH * s)
}

onMounted(async () => {
  ro = new ResizeObserver(() => updateScale())
  if (viewport.value) ro.observe(viewport.value)
  try {
    await fetch()
  } catch {
    /* error is reactive */
  }
  void nextTick(updateScale)
})
onBeforeUnmount(() => ro?.disconnect())

// Re-fit whenever the rendered content changes size.
watch([selectedId, locale, cv], () => void nextTick(updateScale))

function refresh() {
  fetch()
    .then(() => nextTick(updateScale))
    .catch(() => {})
}

function printCv() {
  window.print()
}
</script>

<template>
  <section>
    <PageHeader
      title="CV Generator"
      badge="TOOLS"
      description="Auto-fills a résumé from your portfolio content. Pick a template, language and accent, then print or save as PDF."
    >
      <template #actions>
        <AppButton variant="ghost" :loading="loading" @click="refresh">
          <Icon name="download" class="h-4 w-4" /> Refresh data
        </AppButton>
        <AppButton :disabled="!cv" @click="printCv">
          <Icon name="printer" class="h-4 w-4" /> Print / Save PDF
        </AppButton>
      </template>
    </PageHeader>

    <!-- Loading -->
    <div v-if="loading && !loaded" class="grid h-64 place-items-center text-secondary">
      <span class="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="rounded-2xl border border-red-500/40 bg-red-500/5 p-6 text-sm text-red-500"
    >
      Couldn’t load your content: {{ error.message }}.
      <button class="ml-1 underline" @click="refresh">Try again</button>
    </div>

    <!-- Generator -->
    <div v-else class="cv-layout">
      <!-- ── Controls ── -->
      <div class="cv-controls">
        <!-- Templates -->
        <div class="rounded-2xl border border-line bg-card p-4">
          <h2 class="panel-h">Template</h2>
          <div class="grid grid-cols-2 gap-2.5">
            <button
              v-for="tpl in cvTemplates"
              :key="tpl.id"
              type="button"
              class="tpl-card"
              :class="{ 'is-sel': tpl.id === selectedId, 'is-dark': tpl.dark }"
              :style="{ '--sw': accent }"
              @click="selectedId = tpl.id"
            >
              <span class="tpl-mini" aria-hidden="true">
                <span class="tpl-mini-bar" />
                <span class="tpl-mini-line" />
                <span class="tpl-mini-line short" />
              </span>
              <span class="tpl-name">{{ tpl.name }}</span>
              <span class="tpl-tag">{{ tpl.tagline }}</span>
              <Icon v-if="tpl.id === selectedId" name="check" class="tpl-check" />
            </button>
          </div>
        </div>

        <!-- Language -->
        <div class="rounded-2xl border border-line bg-card p-4">
          <h2 class="panel-h"><Icon name="globe" class="inline h-3.5 w-3.5" /> Language</h2>
          <div class="flex gap-2">
            <button
              v-for="lang in languages"
              :key="lang.id"
              type="button"
              class="seg"
              :class="{ 'is-sel': locale === lang.id }"
              @click="locale = lang.id"
            >
              {{ lang.label }}
            </button>
          </div>
        </div>

        <!-- Accent -->
        <div class="rounded-2xl border border-line bg-card p-4">
          <h2 class="panel-h"><Icon name="palette" class="inline h-3.5 w-3.5" /> Accent</h2>
          <div class="flex flex-wrap gap-2.5">
            <button
              v-for="a in cvAccents"
              :key="a.id"
              type="button"
              class="swatch"
              :class="{ 'is-sel': accent === a.value }"
              :style="{ background: a.value }"
              :title="a.label"
              :aria-label="a.label"
              @click="accent = a.value"
            />
          </div>
        </div>

        <p class="px-1 text-xs leading-relaxed text-secondary">
          Content comes straight from Hero, About, Skills, Journey and Projects.
          Update those sections to change the CV.
        </p>
      </div>

      <!-- ── Preview ── -->
      <div class="cv-preview">
        <div ref="viewport" class="cv-viewport bg-grid">
          <div
            v-if="cv"
            class="cv-print-root"
            :style="{ '--cv-accent': accent, width: frameW + 'px', height: frameH + 'px' }"
          >
            <div class="cv-scale" :style="{ transform: `scale(${scale})` }">
              <component :is="currentTemplate.component" :data="cv" class="cv-page" />
            </div>
          </div>
          <p v-else class="p-10 text-center text-sm text-secondary">No content yet.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cv-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  align-items: start;
}
@media (max-width: 900px) {
  .cv-layout { grid-template-columns: 1fr; }
}
.cv-controls { display: grid; gap: 14px; }
.panel-h {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Template cards */
.tpl-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px;
  text-align: start;
  border-radius: 12px;
  border: 1px solid var(--border-default);
  background: var(--bg-surface);
  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}
.tpl-card:hover { transform: translateY(-2px); }
.tpl-card.is-sel {
  border-color: var(--sw, var(--color-brand));
  box-shadow: 0 0 0 1px var(--sw, var(--color-brand)), 0 8px 20px -12px var(--glow-brand);
}
.tpl-mini {
  display: block;
  height: 34px;
  border-radius: 6px;
  padding: 5px;
  margin-bottom: 5px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--sw) 18%, #fff), #fff);
  border: 1px solid var(--border-default);
  position: relative;
  overflow: hidden;
}
.tpl-card.is-dark .tpl-mini {
  background: linear-gradient(135deg, #10162e, #0b1020);
  border-color: #26315c;
}
.tpl-mini-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 30%; background: var(--sw); }
.tpl-mini-line { display: block; height: 3px; width: 55%; margin: 3px 0 0 36%; border-radius: 2px; background: color-mix(in srgb, var(--sw) 55%, #b9bccc); }
.tpl-card.is-dark .tpl-mini-line { background: color-mix(in srgb, var(--sw) 65%, #33406e); }
.tpl-mini-line.short { width: 38%; }
.tpl-name { font-size: 12px; font-weight: 700; color: var(--text-primary); }
.tpl-tag { font-size: 10px; color: var(--text-secondary); }
.tpl-check {
  position: absolute;
  top: 8px;
  inset-inline-end: 8px;
  height: 15px;
  width: 15px;
  color: var(--sw, var(--color-brand));
}

/* Language segments */
.seg {
  flex: 1;
  padding: 7px 4px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  background: var(--bg-surface);
  transition: all 0.15s ease;
}
.seg.is-sel {
  border-color: var(--border-accent);
  background: color-mix(in srgb, var(--color-brand) 15%, transparent);
  color: var(--color-brand);
}

/* Accent swatches */
.swatch {
  height: 26px;
  width: 26px;
  border-radius: 50%;
  border: 2px solid transparent;
  box-shadow: 0 0 0 1px var(--border-default);
  transition: transform 0.15s ease;
}
.swatch:hover { transform: scale(1.12); }
.swatch.is-sel {
  border-color: var(--bg-surface);
  box-shadow: 0 0 0 2px currentColor;
  transform: scale(1.12);
}

/* Preview column */
.cv-preview {
  border-radius: 16px;
  border: 1px solid var(--border-default);
  overflow: hidden;
}
.cv-viewport {
  display: flex;
  justify-content: center;
  min-height: 60vh;
  padding: 24px 8px;
  background-color: color-mix(in srgb, var(--text-primary) 6%, var(--bg-page));
  overflow: auto;
}
</style>

<!-- Unscoped: the A4 page frame + print rules. These target the template's own
     root element (`.cv-page`) and must escape scoping / hide the app chrome. -->
<style>
.cv-print-root {
  position: relative;
}
.cv-scale {
  position: absolute;
  top: 0;
  inset-inline-start: 0;
  transform-origin: top left;
}
.cv-page {
  width: 210mm;
  min-height: 297mm;
  background: #fff;
  color: #16182b;
  overflow: hidden;
  box-shadow: 0 14px 44px -14px rgba(0, 0, 0, 0.5);
  /* Keep template backgrounds / meters / chips when printing. */
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

@media print {
  body * { visibility: hidden !important; }
  .cv-print-root,
  .cv-print-root * { visibility: visible !important; }
  .cv-print-root {
    position: fixed !important;
    inset: 0 !important;
    width: 210mm !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }
  .cv-scale {
    position: static !important;
    transform: none !important;
    width: auto !important;
    height: auto !important;
  }
  .cv-page {
    width: 210mm !important;
    min-height: 297mm !important;
    box-shadow: none !important;
  }
  html, body { background: #fff !important; }
  @page { size: A4; margin: 0; }
}
</style>
