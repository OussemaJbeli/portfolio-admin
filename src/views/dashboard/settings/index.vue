<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

import Icon from '@/components/Icon.vue'
import ImageUpload from '@/components/form/ImageUpload.vue'
import LangField from '@/components/form/LangField.vue'
import SelectField from '@/components/form/SelectField.vue'
import TextField from '@/components/form/TextField.vue'
import AppButton from '@/components/ui/AppButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import type { SiteSettingInput } from '@/api/types'
import { useSiteSettings } from '@/composables/resources/singletons'
import { provideFormLocale } from '@/composables/useFormLocale'
import { assignKnown, toPayload } from '@/lib/forms'

provideFormLocale('en')

const { data, loading, saving, error, fetch, save } = useSiteSettings()
const saved = ref(false)

const themeOptions = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
]
const langOptions = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'العربية' },
]

function blank() {
  return {
    logo_text: '',
    favicon_url: null as string | null,
    cv_url: '',
    theme_default: 'dark',
    lang_default: 'en',
    meta_title_en: '',
    meta_title_fr: '',
    meta_title_ar: '',
    meta_description_en: '',
    meta_description_fr: '',
    meta_description_ar: '',
    footer_copy_en: '',
    footer_copy_fr: '',
    footer_copy_ar: '',
  }
}
const form = reactive(blank())

onMounted(async () => {
  await fetch()
  if (data.value) assignKnown(form, data.value)
})

async function onSubmit() {
  saved.value = false
  try {
    await save(toPayload(form) as SiteSettingInput)
    saved.value = true
  } catch {
    /* error is reactive */
  }
}
</script>

<template>
  <section>
    <PageHeader title="Site Settings" badge="CONFIGURATION" description="Branding, defaults, SEO meta and footer copy." />

    <div v-if="loading && !data" class="grid h-64 place-items-center text-secondary">
      <span class="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>

    <form v-else class="space-y-6" @submit.prevent="onSubmit">
      <!-- Branding -->
      <div class="rounded-2xl border border-line bg-card p-6">
        <h2 class="mb-5 font-display text-sm font-bold uppercase tracking-wider text-secondary">Branding</h2>
        <div class="space-y-5">
          <ImageUpload v-model="form.favicon_url" folder="site" label="Favicon" hint="PNG / SVG · square" />
          <div class="grid gap-5 sm:grid-cols-2">
            <TextField v-model="form.logo_text" label="Logo text" placeholder="OJ." hint="Top-left brand mark (max 10 chars)." />
            <TextField v-model="form.cv_url" type="url" label="CV URL" placeholder="https://…/cv.pdf" hint="“Download CV” target." />
          </div>
        </div>
      </div>

      <!-- Defaults -->
      <div class="rounded-2xl border border-line bg-card p-6">
        <h2 class="mb-5 font-display text-sm font-bold uppercase tracking-wider text-secondary">Defaults</h2>
        <div class="grid gap-5 sm:grid-cols-2">
          <SelectField v-model="form.theme_default" label="Default theme" :options="themeOptions" />
          <SelectField v-model="form.lang_default" label="Default language" :options="langOptions" />
        </div>
      </div>

      <!-- SEO -->
      <div class="rounded-2xl border border-line bg-card p-6">
        <h2 class="mb-5 font-display text-sm font-bold uppercase tracking-wider text-secondary">SEO meta</h2>
        <div class="space-y-5">
          <LangField :form="form" base="meta_title" label="Meta title" />
          <LangField :form="form" base="meta_description" label="Meta description" type="textarea" :rows="3" />
        </div>
      </div>

      <!-- Footer -->
      <div class="rounded-2xl border border-line bg-card p-6">
        <h2 class="mb-5 font-display text-sm font-bold uppercase tracking-wider text-secondary">Footer</h2>
        <LangField :form="form" base="footer_copy" label="Footer copy" placeholder="© 2025 All rights reserved." />
      </div>

      <!-- Save bar -->
      <div class="sticky bottom-4 flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface/90 px-5 py-3 backdrop-blur">
        <p v-if="error && !error.isValidation" class="text-sm text-red-500">{{ error.message }}</p>
        <p v-else-if="saved" class="inline-flex items-center gap-1.5 text-sm text-brand">
          <Icon name="check" class="h-4 w-4" /> Saved
        </p>
        <span v-else class="text-sm text-secondary">Changes are saved to all languages.</span>
        <AppButton type="submit" :loading="saving">Save changes</AppButton>
      </div>
    </form>
  </section>
</template>
