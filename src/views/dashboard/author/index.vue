<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

import Icon from '@/components/Icon.vue'
import ImageUpload from '@/components/form/ImageUpload.vue'
import LangField from '@/components/form/LangField.vue'
import TextField from '@/components/form/TextField.vue'
import AppButton from '@/components/ui/AppButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import type { AuthorInput } from '@/api/types'
import { useAuthor } from '@/composables/resources/singletons'
import { provideFormLocale } from '@/composables/useFormLocale'
import { assignKnown, toPayload } from '@/lib/forms'

provideFormLocale('en')

const { data, loading, saving, error, fetch, save } = useAuthor()
const saved = ref(false)

function blank() {
  return {
    full_name: '',
    photo_url: null as string | null,
    profile_url: '',
    role_en: '',
    role_fr: '',
    role_ar: '',
    bio_en: '',
    bio_fr: '',
    bio_ar: '',
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
    await save(toPayload(form) as AuthorInput)
    saved.value = true
  } catch {
    /* error is reactive */
  }
}
</script>

<template>
  <section>
    <PageHeader title="Author" badge="BLOG" description="The “About the Author” card shown on blog detail pages." />

    <div v-if="loading && !data" class="grid h-64 place-items-center text-secondary">
      <span class="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>

    <form v-else class="space-y-6" @submit.prevent="onSubmit">
      <div class="rounded-2xl border border-line bg-card p-6">
        <h2 class="mb-5 font-display text-sm font-bold uppercase tracking-wider text-secondary">Profile</h2>
        <div class="space-y-5">
          <ImageUpload v-model="form.photo_url" folder="author" label="Photo" />
          <div class="grid gap-5 sm:grid-cols-2">
            <TextField v-model="form.full_name" label="Full name" required placeholder="Oussema Jbeli" />
            <TextField v-model="form.profile_url" type="url" label="Profile URL" placeholder="https://…" hint="“View Profile →” link." />
          </div>
          <LangField :form="form" base="role" label="Role" placeholder="Full-Stack Developer" />
          <LangField :form="form" base="bio" label="Bio" type="textarea" :rows="5" />
        </div>
      </div>

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
