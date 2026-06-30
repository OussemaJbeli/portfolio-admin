<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

import Icon from '@/components/Icon.vue'
import ImageUpload from '@/components/form/ImageUpload.vue'
import LangField from '@/components/form/LangField.vue'
import LangLinesField from '@/components/form/LangLinesField.vue'
import TextField from '@/components/form/TextField.vue'
import AppButton from '@/components/ui/AppButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import type { HeroInput } from '@/api/types'
import { useHero } from '@/composables/resources/singletons'
import { provideFormLocale } from '@/composables/useFormLocale'
import { assignKnown, toPayload } from '@/lib/forms'

provideFormLocale('en')

const { data, loading, saving, error, fetch, save } = useHero()
const saved = ref(false)

function blank() {
  return {
    full_name: '',
    code_badge: '</>',
    photo_url: null as string | null,
    badge_en: '',
    badge_fr: '',
    badge_ar: '',
    greeting_en: '',
    greeting_fr: '',
    greeting_ar: '',
    tagline_en: '',
    tagline_fr: '',
    tagline_ar: '',
    typewriter_en: [] as string[],
    typewriter_fr: [] as string[],
    typewriter_ar: [] as string[],
    cta_primary_label_en: '',
    cta_primary_label_fr: '',
    cta_primary_label_ar: '',
    cta_primary_url: '',
    cta_secondary_label_en: '',
    cta_secondary_label_fr: '',
    cta_secondary_label_ar: '',
    cta_secondary_url: '',
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
    await save(toPayload(form) as HeroInput)
    saved.value = true
  } catch {
    /* error is reactive */
  }
}
</script>

<template>
  <section>
    <PageHeader title="Hero" badge="HOME PAGE" description="Edit the landing hero — badge, name, typewriter and CTAs." />

    <div v-if="loading && !data" class="grid h-64 place-items-center text-secondary">
      <span class="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>

    <form v-else class="space-y-6" @submit.prevent="onSubmit">
      <!-- Identity -->
      <div class="rounded-2xl border border-line bg-card p-6">
        <h2 class="mb-5 font-display text-sm font-bold uppercase tracking-wider text-secondary">
          Identity
        </h2>
        <div class="space-y-5">
          <ImageUpload v-model="form.photo_url" folder="hero" label="Photo" />
          <div class="grid gap-5 sm:grid-cols-2">
            <TextField v-model="form.full_name" label="Full name" required placeholder="Oussema Jbeli" />
            <TextField v-model="form.code_badge" label="Code badge" placeholder="</>" hint="Floating accent badge." />
          </div>
        </div>
      </div>

      <!-- Headline -->
      <div class="rounded-2xl border border-line bg-card p-6">
        <h2 class="mb-5 font-display text-sm font-bold uppercase tracking-wider text-secondary">
          Headline
        </h2>
        <div class="space-y-5">
          <div class="grid gap-5 sm:grid-cols-2">
            <LangField :form="form" base="badge" label="Badge" placeholder="> FULL-STACK DEVELOPER" />
            <LangField :form="form" base="greeting" label="Greeting" placeholder="Hello, I'm" />
          </div>
          <LangLinesField
            :form="form"
            base="typewriter"
            label="Typewriter phrases"
            hint="One animated phrase per line."
          />
          <LangField :form="form" base="tagline" label="Tagline" type="textarea" :rows="3" />
        </div>
      </div>

      <!-- CTAs -->
      <div class="rounded-2xl border border-line bg-card p-6">
        <h2 class="mb-5 font-display text-sm font-bold uppercase tracking-wider text-secondary">
          Call to action
        </h2>
        <div class="grid gap-5 sm:grid-cols-2">
          <LangField :form="form" base="cta_primary_label" label="Primary label" />
          <TextField v-model="form.cta_primary_url" type="url" label="Primary URL" placeholder="/cv.pdf" />
          <LangField :form="form" base="cta_secondary_label" label="Secondary label" />
          <TextField v-model="form.cta_secondary_url" type="url" label="Secondary URL" placeholder="#projects" />
        </div>
      </div>

      <!-- Save bar -->
      <div
        class="sticky bottom-4 flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface/90 px-5 py-3 backdrop-blur"
      >
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
