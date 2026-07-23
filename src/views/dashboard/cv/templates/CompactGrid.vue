<script setup lang="ts">
/** Compact — a dense, card-based résumé. A tidy header row over a grid of
 *  bordered cards, so a lot of content fits cleanly on a single page. */
import type { CvTemplateProps } from '@/views/dashboard/cv/types'

defineProps<CvTemplateProps>()
</script>

<template>
  <div class="tpl-grid" :dir="data.rtl ? 'rtl' : 'ltr'">
    <!-- Header -->
    <header class="head">
      <span class="tab" aria-hidden="true" />
      <img v-if="data.photoUrl" :src="data.photoUrl" :alt="data.name" class="avatar" />
      <div class="head-text">
        <h1 class="name">{{ data.name }}</h1>
        <p class="role">{{ data.role }}</p>
      </div>
      <ul class="contact">
        <li v-if="data.contact.email">{{ data.contact.email }}</li>
        <li v-if="data.contact.phone">{{ data.contact.phone }}</li>
        <li v-if="data.contact.location">{{ data.contact.location }}</li>
        <li v-for="lnk in data.links" :key="lnk.url">{{ lnk.label }}</li>
      </ul>
    </header>

    <div class="grid">
      <!-- Profile (wide) -->
      <article v-if="data.summary" class="card span-2">
        <h2 class="card-h">{{ data.labels.profile }}</h2>
        <p class="summary">{{ data.summary }}</p>
      </article>

      <!-- Stats -->
      <article v-if="data.stats.length" class="card stats-card">
        <h2 class="card-h">{{ data.labels.stats }}</h2>
        <div class="stats">
          <div v-for="(s, i) in data.stats" :key="i" class="stat">
            <span class="stat-v">{{ s.value }}</span>
            <span class="stat-l">{{ s.label }}</span>
          </div>
        </div>
      </article>

      <!-- Experience (wide) -->
      <article v-if="data.experience.length" class="card span-2">
        <h2 class="card-h">{{ data.labels.experience }}</h2>
        <div v-for="(e, i) in data.experience" :key="i" class="entry">
          <div class="entry-head">
            <h3>{{ e.title }}<span v-if="e.org" class="org"> · {{ e.org }}</span><template v-if="e.location"> · {{ e.location }}</template></h3>
            <span class="dates">{{ e.start }}<template v-if="e.start"> – </template>{{ e.current ? data.labels.present : e.end }}<template v-if="e.employmentType"> · {{ e.employmentType }}</template></span>
          </div>
          <ul v-if="e.bullets.length" class="bullets"><li v-for="(b, bi) in e.bullets" :key="bi">{{ b }}</li></ul>
        </div>
      </article>

      <!-- Skills -->
      <article v-if="data.skills.length" class="card">
        <h2 class="card-h">{{ data.labels.skills }}</h2>
        <div v-for="s in data.skills" :key="s.name" class="skill">
          <div class="skill-top"><span>{{ s.name }}</span><span>{{ s.percentage }}%</span></div>
          <div class="meter"><span :style="{ width: s.percentage + '%' }" /></div>
        </div>
      </article>

      <!-- Education -->
      <article v-if="data.education.length" class="card">
        <h2 class="card-h">{{ data.labels.education }}</h2>
        <div v-for="(e, i) in data.education" :key="i" class="edu">
          <h3>{{ e.title }}</h3>
          <p v-if="e.org" class="edu-org">{{ e.org }}</p>
          <p class="edu-date">{{ e.start }}<template v-if="e.start"> – </template>{{ e.current ? data.labels.present : e.end }}</p>
        </div>
      </article>

      <!-- Projects (wide) -->
      <article v-if="data.projects.length" class="card span-2">
        <h2 class="card-h">{{ data.labels.projects }}</h2>
        <div class="proj-grid">
          <div v-for="(p, i) in data.projects" :key="i" class="proj">
            <h3>{{ p.title }}</h3>
            <p v-if="p.description" class="proj-desc">{{ p.description }}</p>
            <p v-if="p.tech.length" class="proj-tech">{{ p.tech.join(' · ') }}</p>
          </div>
        </div>
      </article>

      <!-- Tech -->
      <article v-if="data.techGroups.length" class="card span-2">
        <h2 class="card-h">{{ data.labels.technologies }}</h2>
        <div class="tgroup-grid">
          <div v-for="g in data.techGroups" :key="g.name" class="tgroup">
            <p v-if="g.name" class="tgroup-name">{{ g.name }}</p>
            <ul class="chips"><li v-for="t in g.items" :key="t">{{ t }}</li></ul>
          </div>
        </div>
      </article>

      <!-- Languages -->
      <article v-if="data.languages.length" class="card">
        <h2 class="card-h">{{ data.labels.languages }}</h2>
        <ul class="langs">
          <li v-for="l in data.languages" :key="l.name"><span>{{ l.name }}</span><span class="lvl">{{ l.level }}</span></li>
        </ul>
      </article>

      <!-- Interests -->
      <article v-if="data.interests.length" class="card">
        <h2 class="card-h">{{ data.labels.interests }}</h2>
        <ul class="chips"><li v-for="i in data.interests" :key="i">{{ i }}</li></ul>
      </article>
    </div>
  </div>
</template>

<style scoped>
.tpl-grid {
  padding: 14mm;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
  color: #2b2e40;
  font-size: 10px;
  line-height: 1.45;
}
.head {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 0 12px 14px;
  margin-bottom: 12px;
  border-bottom: 2px solid color-mix(in srgb, var(--cv-accent) 30%, #e6e6ee);
}
.tab { position: absolute; inset-inline-start: 0; top: 2px; bottom: 14px; width: 5px; border-radius: 9999px; background: var(--cv-accent); }
.avatar { width: 58px; height: 58px; border-radius: 12px; object-fit: cover; border: 2px solid color-mix(in srgb, var(--cv-accent) 45%, transparent); }
.name { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #16182b; }
.role { color: var(--cv-accent); font-weight: 600; font-size: 11px; }
.head-text { margin-inline-end: auto; }
.contact { list-style: none; text-align: end; display: grid; gap: 2px; color: #5a5e73; font-size: 9px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.card {
  border: 1px solid #e7e7ee;
  border-radius: 10px;
  padding: 11px 13px;
  background: #fff;
  break-inside: avoid;
}
.span-2 { grid-column: span 2; }
.card-h {
  font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--cv-accent); margin-bottom: 8px;
  display: flex; align-items: center; gap: 7px;
}
.card-h::after { content: ''; flex: 1; height: 1px; background: color-mix(in srgb, var(--cv-accent) 22%, #ececf2); }
.summary { color: #4c5065; }
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
.stat { text-align: center; background: color-mix(in srgb, var(--cv-accent) 8%, #fff); border-radius: 7px; padding: 6px 4px; }
.stat-v { display: block; font-size: 15px; font-weight: 800; color: var(--cv-accent); }
.stat-l { font-size: 7.5px; text-transform: uppercase; letter-spacing: 0.05em; color: #6a6e82; }
.entry { margin-bottom: 8px; }
.entry-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.entry-head h3 { font-size: 11px; font-weight: 700; color: #1a1c2b; }
.org { color: var(--cv-accent); font-weight: 500; }
.dates { font-size: 8.5px; color: #8a8fa3; white-space: nowrap; }
.bullets { margin: 3px 0 0; padding-inline-start: 14px; display: grid; gap: 1px; }
.bullets li { color: #4c5065; }
.skill { margin-bottom: 6px; }
.skill-top { display: flex; justify-content: space-between; font-size: 9px; margin-bottom: 2px; }
.meter { height: 4px; border-radius: 9999px; background: #e6e6ee; overflow: hidden; }
.meter span { display: block; height: 100%; border-radius: inherit; background: var(--cv-accent); }
.edu { margin-bottom: 7px; }
.edu h3 { font-size: 10.5px; font-weight: 700; color: #1a1c2b; }
.edu-org { color: var(--cv-accent); font-weight: 600; font-size: 9px; }
.edu-date { font-size: 8.5px; color: #8a8fa3; }
.proj-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.proj h3 { font-size: 10.5px; font-weight: 700; color: #16182b; }
.proj-desc { color: #4c5065; margin-top: 1px; }
.proj-tech { font-size: 8.5px; color: var(--cv-accent); font-weight: 600; margin-top: 2px; }
.chips { list-style: none; display: flex; flex-wrap: wrap; gap: 4px; }
.chips li {
  font-size: 8.5px; padding: 2px 7px; border-radius: 9999px;
  background: color-mix(in srgb, var(--cv-accent) 9%, #fff);
  border: 1px solid color-mix(in srgb, var(--cv-accent) 28%, transparent);
  color: color-mix(in srgb, var(--cv-accent) 76%, #000);
}
.tgroup-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 14px; }
.tgroup-name { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--cv-accent); margin-bottom: 3px; }
.langs { list-style: none; display: grid; gap: 3px; }
.langs li { display: flex; justify-content: space-between; align-items: center; font-size: 9px; }
.lvl { font-size: 8px; font-weight: 700; color: var(--cv-accent); }
</style>
