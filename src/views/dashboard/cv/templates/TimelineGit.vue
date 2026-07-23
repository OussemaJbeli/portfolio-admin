<script setup lang="ts">
/** Timeline — a light résumé whose experience & education run down a single
 *  vertical "git graph" spine with accent nodes; header + skills sit on top. */
import type { CvTemplateProps } from '@/views/dashboard/cv/types'

defineProps<CvTemplateProps>()
</script>

<template>
  <div class="tpl-timeline" :dir="data.rtl ? 'rtl' : 'ltr'">
    <!-- Header -->
    <header class="head">
      <div class="head-main">
        <h1 class="name">{{ data.name }}</h1>
        <p class="role">{{ data.role }}</p>
      </div>
      <img v-if="data.photoUrl" :src="data.photoUrl" :alt="data.name" class="avatar" />
    </header>
    <ul class="contact">
      <li v-if="data.contact.email">{{ data.contact.email }}</li>
      <li v-if="data.contact.phone">{{ data.contact.phone }}</li>
      <li v-if="data.contact.location">{{ data.contact.location }}</li>
      <li v-for="lnk in data.links" :key="lnk.url">{{ lnk.label }}</li>
    </ul>

    <p v-if="data.summary" class="summary">{{ data.summary }}</p>

    <!-- Skills row -->
    <section v-if="data.skills.length" class="skills">
      <div v-for="s in data.skills" :key="s.name" class="skill">
        <div class="skill-top"><span>{{ s.name }}</span><span class="pct">{{ s.percentage }}%</span></div>
        <div class="meter"><span :style="{ width: s.percentage + '%' }" /></div>
      </div>
    </section>

    <!-- Timeline -->
    <template v-for="grp in [
      { label: data.labels.experience, items: data.experience },
      { label: data.labels.education, items: data.education },
    ]" :key="grp.label">
      <section v-if="grp.items.length" class="tl-section">
        <h2 class="sec-h">{{ grp.label }}</h2>
        <div class="spine">
          <div v-for="(e, i) in grp.items" :key="i" class="node">
            <span class="dot" :class="{ live: e.current }" />
            <div class="node-body">
              <div class="node-head">
                <h3>{{ e.title }}</h3>
                <span class="dates">{{ e.start }}<template v-if="e.start"> – </template>{{ e.current ? data.labels.present : e.end }}</span>
              </div>
              <p v-if="e.org || e.location || e.employmentType" class="org">{{ e.org }}<template v-if="e.location"> · {{ e.location }}</template><template v-if="e.employmentType"> · {{ e.employmentType }}</template></p>
              <ul v-if="e.bullets.length" class="bullets"><li v-for="(b, bi) in e.bullets" :key="bi">{{ b }}</li></ul>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- Projects + Tech -->
    <section v-if="data.projects.length" class="tl-section">
      <h2 class="sec-h">{{ data.labels.projects }}</h2>
      <div class="proj-grid">
        <div v-for="(p, i) in data.projects" :key="i" class="proj">
          <h3>{{ p.title }}</h3>
          <p v-if="p.description" class="proj-desc">{{ p.description }}</p>
          <p v-if="p.tech.length" class="proj-tech">{{ p.tech.join(' · ') }}</p>
        </div>
      </div>
    </section>

    <section v-if="data.techGroups.length" class="tl-section">
      <h2 class="sec-h">{{ data.labels.technologies }}</h2>
      <div v-for="g in data.techGroups" :key="g.name" class="tgroup">
        <span v-if="g.name" class="tgroup-name">{{ g.name }}</span>
        <ul class="chips"><li v-for="t in g.items" :key="t">{{ t }}</li></ul>
      </div>
    </section>

    <div class="two-col-sections">
      <section v-if="data.languages.length" class="tl-section">
        <h2 class="sec-h">{{ data.labels.languages }}</h2>
        <ul class="langs">
          <li v-for="l in data.languages" :key="l.name"><span>{{ l.name }}</span><span class="lvl">{{ l.level }}</span></li>
        </ul>
      </section>
      <section v-if="data.interests.length" class="tl-section">
        <h2 class="sec-h">{{ data.labels.interests }}</h2>
        <ul class="chips"><li v-for="i in data.interests" :key="i">{{ i }}</li></ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.tpl-timeline {
  padding: 18mm 14mm;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
  color: #2a2d3f;
  font-size: 10.5px;
  line-height: 1.5;
}
.head { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.name { font-size: 27px; font-weight: 800; letter-spacing: -0.02em; color: #16182b; }
.role { color: var(--cv-accent); font-weight: 600; font-size: 12px; margin-top: 2px; }
.avatar { width: 66px; height: 66px; border-radius: 50%; object-fit: cover; border: 2px solid color-mix(in srgb, var(--cv-accent) 55%, transparent); }
.contact { list-style: none; display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 8px; color: #5a5e73; font-size: 9.5px; }
.contact li { position: relative; }
.contact li:not(:last-child)::after { content: '·'; position: absolute; inset-inline-end: -9px; color: #c4c7d4; }
.summary { margin-top: 12px; color: #4a4e63; padding-inline-start: 12px; border-inline-start: 3px solid color-mix(in srgb, var(--cv-accent) 45%, transparent); }
.skills { margin-top: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 22px; }
.skill-top { display: flex; justify-content: space-between; font-size: 9.5px; margin-bottom: 3px; }
.pct { color: var(--cv-accent); font-weight: 700; }
.meter { height: 5px; border-radius: 9999px; background: #ececf3; overflow: hidden; }
.meter span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, color-mix(in srgb, var(--cv-accent) 70%, #ff8c1a), var(--cv-accent)); }
.tl-section { margin-top: 18px; }
.sec-h {
  font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em;
  color: var(--cv-accent); margin-bottom: 10px;
}
.spine { position: relative; padding-inline-start: 20px; }
.spine::before { content: ''; position: absolute; inset-inline-start: 5px; top: 4px; bottom: 4px; width: 2px; background: color-mix(in srgb, var(--cv-accent) 30%, #e2e2ea); }
.node { position: relative; padding-bottom: 12px; }
.dot {
  position: absolute; inset-inline-start: -20px; top: 3px;
  width: 12px; height: 12px; border-radius: 50%;
  background: #fff; border: 3px solid var(--cv-accent);
}
.dot.live { box-shadow: 0 0 0 3px color-mix(in srgb, var(--cv-accent) 22%, transparent); }
.node-head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.node-head h3 { font-size: 11.5px; font-weight: 700; color: #16182b; }
.dates { font-size: 9px; color: #8a8fa3; white-space: nowrap; }
.org { font-size: 10px; font-weight: 600; color: var(--cv-accent); }
.bullets { margin: 4px 0 0; padding-inline-start: 15px; display: grid; gap: 2px; }
.bullets li { color: #4a4e63; }
.proj-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.proj { border: 1px solid #e7e7ee; border-radius: 8px; padding: 9px 11px; border-inline-start: 3px solid var(--cv-accent); }
.proj h3 { font-size: 11px; font-weight: 700; color: #16182b; }
.proj-desc { color: #4a4e63; margin-top: 2px; }
.proj-tech { font-size: 9px; color: var(--cv-accent); font-weight: 600; margin-top: 3px; }
.chips { list-style: none; display: flex; flex-wrap: wrap; gap: 6px; }
.chips li {
  font-size: 9.5px; padding: 3px 10px; border-radius: 9999px;
  background: color-mix(in srgb, var(--cv-accent) 10%, #fff);
  border: 1px solid color-mix(in srgb, var(--cv-accent) 30%, transparent);
  color: color-mix(in srgb, var(--cv-accent) 75%, #000);
}
.tgroup { margin-bottom: 8px; }
.tgroup-name { display: block; font-size: 9.5px; font-weight: 700; color: #16182b; margin-bottom: 4px; }
.two-col-sections { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; }
.langs { list-style: none; display: grid; gap: 5px; }
.langs li { display: flex; justify-content: space-between; align-items: center; font-size: 10px; }
.lvl { font-size: 8.5px; font-weight: 700; color: var(--cv-accent); }
</style>
