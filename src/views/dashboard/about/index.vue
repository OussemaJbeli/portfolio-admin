<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

import Icon from '@/components/Icon.vue'
import ImageUpload from '@/components/form/ImageUpload.vue'
import LangField from '@/components/form/LangField.vue'
import TextField from '@/components/form/TextField.vue'
import AppButton from '@/components/ui/AppButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import type { AboutInput } from '@/api/types'
import { useAbout } from '@/composables/resources/singletons'
import { provideFormLocale } from '@/composables/useFormLocale'
import { assignKnown, toPayload } from '@/lib/forms'

provideFormLocale('en')

const { data, loading, saving, error, fetch, save } = useAbout()
const saved = ref(false)

function blank() {
  return {
    photo_url: null as string | null,
    display_name: '',
    email: '',
    cta_url: '',
    section_badge_en: '',
    section_badge_fr: '',
    section_badge_ar: '',
    heading_en: '',
    heading_fr: '',
    heading_ar: '',
    bio_en: '',
    bio_fr: '',
    bio_ar: '',
    location_en: '',
    location_fr: '',
    location_ar: '',
    availability_en: '',
    availability_fr: '',
    availability_ar: '',
    cta_label_en: '',
    cta_label_fr: '',
    cta_label_ar: '',
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
    await save(toPayload(form) as AboutInput)
    saved.value = true
  } catch {
    /* error is reactive */
  }
}
</script>

<template>
  <section>
    <PageHeader title="About" badge="HOME PAGE" description="Edit the About section content and info card." />

    <div v-if="loading && !data" class="grid h-64 place-items-center text-secondary">
      <span class="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>

    <form v-else class="space-y-6" @submit.prevent="onSubmit">
      <!-- Section heading -->
      <div class="rounded-2xl border border-line bg-card p-6">
        <h2 class="mb-5 font-display text-sm font-bold uppercase tracking-wider text-secondary">
          Section
        </h2>
        <div class="space-y-5">
          <div class="grid gap-5 sm:grid-cols-2">
            <LangField :form="form" base="section_badge" label="Section badge" placeholder="> ABOUT ME" />
            <LangField :form="form" base="heading" label="Heading" placeholder="About Me" />
          </div>
          <LangField :form="form" base="bio" label="Bio" type="textarea" :rows="6" />
          <ImageUpload v-model="form.photo_url" folder="about" label="Photo" />
        </div>
      </div>

      <!-- Info card -->
      <div class="rounded-2xl border border-line bg-card p-6">
        <h2 class="mb-5 font-display text-sm font-bold uppercase tracking-wider text-secondary">
          Info card
        </h2>
        <div class="space-y-5">
          <div class="grid gap-5 sm:grid-cols-2">
            <TextField v-model="form.display_name" label="Display name" />
            <TextField v-model="form.email" type="email" label="Email" placeholder="you@example.com" />
          </div>
          <div class="grid gap-5 sm:grid-cols-2">
            <LangField :form="form" base="location" label="Location" />
            <LangField :form="form" base="availability" label="Availability" placeholder="Freelance / Full-time" />
          </div>
          <div class="grid gap-5 sm:grid-cols-2">
            <LangField :form="form" base="cta_label" label="CTA label" placeholder="Let's Talk" />
            <TextField v-model="form.cta_url" type="url" label="CTA URL" placeholder="#contact" />
          </div>
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
