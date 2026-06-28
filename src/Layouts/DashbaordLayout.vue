<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'

import AppHeader from '@/components/Header.vue'
import AppSidebar from '@/components/SidBar.vue'

const sidebarOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-page text-primary">
    <!-- Mobile backdrop -->
    <transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-30 bg-black/60 lg:hidden"
        aria-hidden="true"
        @click="sidebarOpen = false"
      />
    </transition>

    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Content column -->
    <div class="lg:pl-64">
      <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <RouterView v-slot="{ Component }">
          <transition
            mode="out-in"
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-2"
            leave-active-class="transition duration-150 ease-in"
            leave-to-class="opacity-0"
          >
            <component :is="Component" />
          </transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>
