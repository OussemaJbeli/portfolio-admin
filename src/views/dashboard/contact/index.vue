<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

import Icon from '@/components/Icon.vue'
import LangField from '@/components/form/LangField.vue'
import TextField from '@/components/form/TextField.vue'
import AppButton from '@/components/ui/AppButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import type { ContactSectionInput } from '@/api/types'
import { useContactSection } from '@/composables/resources/singletons'
import { provideFormLocale } from '@/composables/useFormLocale'
import { assignKnown, toPayload } from '@/lib/forms'

provideFormLocale('en')

const { data, loading, saving, error, fetch, save } = useContactSection()
const saved = ref(false)

function blank() {
  return {
    section_badge_en: '',
    section_badge_fr: '',
    section_badge_ar: '',
    heading_en: '',
    heading_fr: '',
    heading_ar: '',
    subtext_en: '',
    subtext_fr: '',
    subtext_ar: '',
    email: '',
    phone: '',
    location_en: '',
    location_fr: '',
    location_ar: '',
    availability_en: '',
    availability_fr: '',
    availability_ar: '',
    label_name_en: '',
    label_name_fr: '',
    label_name_ar: '',
    label_email_en: '',
    label_email_fr: '',
    label_email_ar: '',
    label_subject_en: '',
    label_subject_fr: '',
    label_subject_ar: '',
    label_message_en: '',
    label_message_fr: '',
    label_message_ar: '',
    label_send_en: '',
    label_send_fr: '',
    label_send_ar: '',
    cta_banner_heading_en: '',
    cta_banner_heading_fr: '',
    cta_banner_heading_ar: '',
    cta_banner_sub_en: '',
    cta_banner_sub_fr: '',
    cta_banner_sub_ar: '',
    cta_banner_btn_en: '',
    cta_banner_btn_fr: '',
    cta_banner_btn_ar: '',
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
    await save(toPayload(form) as ContactSectionInput)
    saved.value = true
  } catch {
    /* error is reactive */
  }
}
</script>

<template>
  <section>
    <PageHeader title="Contact Info" badge="CONFIGURATION" description="Contact details, form labels and the CTA banner." />

    <div v-if="loading && !data" class="grid h-64 place-items-center text-secondary">
      <span class="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>

    <form v-else class="space-y-6" @submit.prevent="onSubmit">
      <!-- Section -->
      <div class="rounded-2xl border border-line bg-card p-6">
        <h2 class="mb-5 font-display text-sm font-bold uppercase tracking-wider text-secondary">Section</h2>
        <div class="space-y-5">
          <div class="grid gap-5 sm:grid-cols-2">
            <LangField :form="form" base="section_badge" label="Section badge" placeholder="> CONTACT" />
            <LangField :form="form" base="heading" label="Heading" placeholder="Contact Me" />
          </div>
          <LangField :form="form" base="subtext" label="Subtext" type="textarea" :rows="3" />
        </div>
      </div>

      <!-- Contact details -->
      <div class="rounded-2xl border border-line bg-card p-6">
        <h2 class="mb-5 font-display text-sm font-bold uppercase tracking-wider text-secondary">Contact details</h2>
        <div class="space-y-5">
          <div class="grid gap-5 sm:grid-cols-2">
            <TextField v-model="form.email" type="email" label="Email" placeholder="you@example.com" />
            <TextField v-model="form.phone" label="Phone" placeholder="+216 …" />
          </div>
          <div class="grid gap-5 sm:grid-cols-2">
            <LangField :form="form" base="location" label="Location" />
            <LangField :form="form" base="availability" label="Availability" placeholder="Freelance / Full-time" />
          </div>
        </div>
      </div>

      <!-- Form labels -->
      <div class="rounded-2xl border border-line bg-card p-6">
        <h2 class="mb-5 font-display text-sm font-bold uppercase tracking-wider text-secondary">Form labels</h2>
        <div class="grid gap-5 sm:grid-cols-2">
          <LangField :form="form" base="label_name" label="Name field" placeholder="Your Name" />
          <LangField :form="form" base="label_email" label="Email field" placeholder="Your Email" />
          <LangField :form="form" base="label_subject" label="Subject field" placeholder="Subject" />
          <LangField :form="form" base="label_message" label="Message field" placeholder="Your Message" />
          <LangField :form="form" base="label_send" label="Send button" placeholder="Send Message" />
        </div>
      </div>

      <!-- CTA banner -->
      <div class="rounded-2xl border border-line bg-card p-6">
        <h2 class="mb-5 font-display text-sm font-bold uppercase tracking-wider text-secondary">CTA banner</h2>
        <div class="space-y-5">
          <LangField :form="form" base="cta_banner_heading" label="Heading" placeholder="Interested in working together?" />
          <LangField :form="form" base="cta_banner_sub" label="Subtext" type="textarea" :rows="2" />
          <LangField :form="form" base="cta_banner_btn" label="Button label" placeholder="Contact Me →" />
        </div>
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
