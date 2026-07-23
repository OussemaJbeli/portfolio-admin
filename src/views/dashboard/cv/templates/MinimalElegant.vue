<script setup lang="ts">
/** Minimal — an elegant, centered single-column résumé: generous whitespace,
 *  hairline accent rules, small-caps section labels. */
import type { CvTemplateProps } from '@/views/dashboard/cv/types'

defineProps<CvTemplateProps>()
</script>

<template>
  <div class="tpl-min" :dir="data.rtl ? 'rtl' : 'ltr'">
    <!-- Masthead -->
    <header class="masthead">
      <h1 class="name">{{ data.name }}</h1>
      <p class="role">{{ data.role }}</p>
      <div class="rule"><span /></div>
      <ul class="contact">
        <li v-if="data.contact.email">{{ data.contact.email }}</li>
        <li v-if="data.contact.phone">{{ data.contact.phone }}</li>
        <li v-if="data.contact.location">{{ data.contact.location }}</li>
        <li v-for="lnk in data.links" :key="lnk.url">{{ lnk.label }}</li>
      </ul>
    </header>

    <p v-if="data.summary" class="summary">{{ data.summary }}</p>

    <section v-if="data.experience.length" class="sec">
      <h2 class="sec-h">{{ data.labels.experience }}</h2>
      <div v-for="(e, i) in data.experience" :key="i" class="entry">
        <div class="entry-head">
          <h3>{{ e.title }}<span v-if="e.org" class="org"> — {{ e.org }}</span><template v-if="e.location">, {{ e.location }}</template></h3>
          <span class="dates">{{ e.start }}<template v-if="e.start"> – </template>{{ e.current ? data.labels.present : e.end }}<template v-if="e.employmentType"> · {{ e.employmentType }}</template></span>
        </div>
        <ul v-if="e.bullets.length" class="bullets"><li v-for="(b, bi) in e.bullets" :key="bi">{{ b }}</li></ul>
      </div>
    </section>

    <section v-if="data.education.length" class="sec">
      <h2 class="sec-h">{{ data.labels.education }}</h2>
      <div v-for="(e, i) in data.education" :key="i" class="entry">
        <div class="entry-head">
          <h3>{{ e.title }}<span v-if="e.org" class="org"> — {{ e.org }}</span><template v-if="e.location">, {{ e.location }}</template></h3>
          <span class="dates">{{ e.start }}<template v-if="e.start"> – </template>{{ e.current ? data.labels.present : e.end }}<template v-if="e.employmentType"> · {{ e.employmentType }}</template></span>
        </div>
      </div>
    </section>

    <section v-if="data.projects.length" class="sec">
      <h2 class="sec-h">{{ data.labels.projects }}</h2>
      <div v-for="(p, i) in data.projects" :key="i" class="entry">
        <h3>{{ p.title }}</h3>
        <p v-if="p.description" class="proj-desc">{{ p.description }}</p>
        <p v-if="p.tech.length" class="proj-tech">{{ p.tech.join(' · ') }}</p>
      </div>
    </section>

    <div class="two-col">
      <section v-if="data.skills.length" class="sec">
        <h2 class="sec-h">{{ data.labels.skills }}</h2>
        <ul class="skill-list">
          <li v-for="s in data.skills" :key="s.name">
            <span>{{ s.name }}</span>
            <span class="dots" aria-hidden="true"><i v-for="n in 5" :key="n" :class="{ on: s.percentage >= n * 20 - 10 }" /></span>
          </li>
        </ul>
      </section>
      <section v-if="data.techGroups.length" class="sec">
        <h2 class="sec-h">{{ data.labels.technologies }}</h2>
        <p v-for="g in data.techGroups" :key="g.name" class="tech"><b v-if="g.name">{{ g.name }}: </b>{{ g.items.join(' · ') }}</p>
      </section>
    </div>

    <div v-if="data.languages.length || data.interests.length" class="two-col">
      <section v-if="data.languages.length" class="sec">
        <h2 class="sec-h">{{ data.labels.languages }}</h2>
        <ul class="skill-list">
          <li v-for="l in data.languages" :key="l.name"><span>{{ l.name }}</span><span class="lang-lvl">{{ l.level }}</span></li>
        </ul>
      </section>
      <section v-if="data.interests.length" class="sec">
        <h2 class="sec-h">{{ data.labels.interests }}</h2>
        <p class="tech">{{ data.interests.join(' · ') }}</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.tpl-min {
  padding: 22mm 20mm;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
  color: #33364a;
  font-size: 10.5px;
  line-height: 1.55;
}
.masthead { text-align: center; }
.name { font-size: 30px; font-weight: 300; letter-spacing: 0.16em; text-transform: uppercase; color: #1a1c2b; }
.role { margin-top: 5px; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: var(--cv-accent); }
.rule { display: flex; justify-content: center; margin: 12px 0; }
.rule span { width: 46px; height: 2px; background: var(--cv-accent); }
.contact { list-style: none; display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 16px; color: #63667a; font-size: 9.5px; }
.contact li { position: relative; }
.contact li:not(:last-child)::after { content: '•'; position: absolute; inset-inline-end: -10px; color: #ccced8; }
.summary { text-align: center; max-width: 68ch; margin: 16px auto 0; color: #55596e; font-style: italic; }
.sec { margin-top: 20px; }
.sec-h {
  font-size: 10px; font-weight: 700; letter-spacing: 0.26em; text-transform: uppercase;
  color: #1a1c2b; text-align: center; margin-bottom: 12px; position: relative;
}
.sec-h::before, .sec-h::after {
  content: ''; position: absolute; top: 50%; width: 24%; height: 1px;
  background: color-mix(in srgb, var(--cv-accent) 40%, #e0e0e8);
}
.sec-h::before { inset-inline-start: 0; }
.sec-h::after { inset-inline-end: 0; }
.entry { margin-bottom: 11px; }
.entry-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.entry-head h3 { font-size: 11.5px; font-weight: 600; color: #1a1c2b; }
.org { color: var(--cv-accent); font-weight: 500; }
.dates { font-size: 9px; color: #9195a6; white-space: nowrap; letter-spacing: 0.04em; }
.bullets { margin: 4px 0 0; padding-inline-start: 16px; display: grid; gap: 2px; }
.bullets li { color: #55596e; }
.proj-desc { color: #55596e; margin-top: 1px; }
.proj-tech { font-size: 9px; color: var(--cv-accent); margin-top: 2px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; }
.skill-list { list-style: none; display: grid; gap: 5px; }
.skill-list li { display: flex; justify-content: space-between; align-items: center; }
.dots { display: inline-flex; gap: 3px; }
.dots i { width: 6px; height: 6px; border-radius: 50%; border: 1px solid var(--cv-accent); }
.dots i.on { background: var(--cv-accent); }
.tech { color: #55596e; }
.tech b { color: #1a1c2b; }
.lang-lvl { color: var(--cv-accent); font-weight: 600; font-size: 9px; letter-spacing: 0.04em; }
</style>
