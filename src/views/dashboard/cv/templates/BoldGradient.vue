<script setup lang="ts">
/** Bold — a full-bleed accent gradient header carrying the name, role and
 *  contact, over a two-column body (main story + slim aside). */
import type { CvTemplateProps } from '@/views/dashboard/cv/types'

defineProps<CvTemplateProps>()
</script>

<template>
  <div class="tpl-bold" :dir="data.rtl ? 'rtl' : 'ltr'">
    <!-- Gradient header band -->
    <header class="band">
      <div class="band-fx" aria-hidden="true" />
      <img v-if="data.photoUrl" :src="data.photoUrl" :alt="data.name" class="avatar" />
      <div class="band-text">
        <h1 class="name">{{ data.name }}</h1>
        <p class="role">{{ data.role }}</p>
        <ul class="contact">
          <li v-if="data.contact.email">{{ data.contact.email }}</li>
          <li v-if="data.contact.phone">{{ data.contact.phone }}</li>
          <li v-if="data.contact.location">{{ data.contact.location }}</li>
          <li v-for="lnk in data.links" :key="lnk.url">{{ lnk.label }}</li>
        </ul>
      </div>
    </header>

    <div class="body">
      <!-- Main -->
      <main class="main">
        <section v-if="data.summary" class="sec">
          <h2 class="sec-h">{{ data.labels.summary }}</h2>
          <p class="summary">{{ data.summary }}</p>
        </section>

        <section v-if="data.experience.length" class="sec">
          <h2 class="sec-h">{{ data.labels.experience }}</h2>
          <div v-for="(e, i) in data.experience" :key="i" class="entry">
            <div class="entry-head">
              <h3>{{ e.title }}</h3>
              <span class="dates">{{ e.start }}<template v-if="e.start"> – </template>{{ e.current ? data.labels.present : e.end }}</span>
            </div>
            <p v-if="e.org || e.location || e.employmentType" class="org">{{ e.org }}<template v-if="e.location"> · {{ e.location }}</template><template v-if="e.employmentType"> · {{ e.employmentType }}</template></p>
            <ul v-if="e.bullets.length" class="bullets"><li v-for="(b, bi) in e.bullets" :key="bi">{{ b }}</li></ul>
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
      </main>

      <!-- Aside -->
      <aside class="aside">
        <section v-if="data.stats.length" class="stats">
          <div v-for="(s, i) in data.stats" :key="i" class="stat">
            <span class="stat-v">{{ s.value }}</span>
            <span class="stat-l">{{ s.label }}</span>
          </div>
        </section>

        <section v-if="data.skills.length" class="sec">
          <h2 class="aside-h">{{ data.labels.skills }}</h2>
          <div v-for="s in data.skills" :key="s.name" class="skill">
            <div class="skill-top"><span>{{ s.name }}</span><span>{{ s.percentage }}%</span></div>
            <div class="meter"><span :style="{ width: s.percentage + '%' }" /></div>
          </div>
        </section>

        <section v-if="data.education.length" class="sec">
          <h2 class="aside-h">{{ data.labels.education }}</h2>
          <div v-for="(e, i) in data.education" :key="i" class="edu">
            <h3>{{ e.title }}</h3>
            <p v-if="e.org" class="edu-org">{{ e.org }}</p>
            <p class="edu-date">{{ e.start }}<template v-if="e.start"> – </template>{{ e.current ? data.labels.present : e.end }}</p>
          </div>
        </section>

        <section v-if="data.techGroups.length" class="sec">
          <h2 class="aside-h">{{ data.labels.technologies }}</h2>
          <div v-for="g in data.techGroups" :key="g.name" class="tgroup">
            <p v-if="g.name" class="tgroup-name">{{ g.name }}</p>
            <ul class="chips"><li v-for="t in g.items" :key="t">{{ t }}</li></ul>
          </div>
        </section>

        <section v-if="data.languages.length" class="sec">
          <h2 class="aside-h">{{ data.labels.languages }}</h2>
          <ul class="langs">
            <li v-for="l in data.languages" :key="l.name"><span>{{ l.name }}</span><span class="lvl">{{ l.level }}</span></li>
          </ul>
        </section>

        <section v-if="data.interests.length" class="sec">
          <h2 class="aside-h">{{ data.labels.interests }}</h2>
          <ul class="chips"><li v-for="i in data.interests" :key="i">{{ i }}</li></ul>
        </section>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.tpl-bold {
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
  color: #2b2e40;
  font-size: 10.5px;
  line-height: 1.5;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.band {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18mm 14mm;
  color: #fff;
  overflow: hidden;
  background: linear-gradient(115deg,
    color-mix(in srgb, var(--cv-accent) 90%, #000) 0%,
    var(--cv-accent) 50%,
    color-mix(in srgb, var(--cv-accent) 65%, #ff5e00) 100%);
}
.band-fx {
  position: absolute; inset: 0;
  background:
    radial-gradient(circle at 82% -10%, rgba(255, 255, 255, 0.25), transparent 40%),
    radial-gradient(circle at 10% 120%, rgba(0, 0, 0, 0.18), transparent 45%);
}
.avatar { position: relative; width: 78px; height: 78px; border-radius: 16px; object-fit: cover; border: 2px solid rgba(255, 255, 255, 0.6); box-shadow: 0 8px 22px -8px rgba(0, 0, 0, 0.5); }
.band-text { position: relative; }
.name { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; }
.role { font-size: 12px; font-weight: 500; opacity: 0.95; margin-top: 2px; }
.contact { list-style: none; display: flex; flex-wrap: wrap; gap: 3px 14px; margin-top: 8px; font-size: 9.5px; opacity: 0.95; }
.contact li { position: relative; }
.contact li:not(:last-child)::after { content: '|'; position: absolute; inset-inline-end: -8px; opacity: 0.5; }
.body { display: grid; grid-template-columns: 1.9fr 1fr; gap: 0; }
.main { padding: 14mm 8mm 14mm 14mm; }
.aside { padding: 14mm 14mm 14mm 10mm; background: #f6f6fa; }
.sec { margin-bottom: 15px; }
.sec-h {
  font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--cv-accent); margin-bottom: 8px; padding-bottom: 4px;
  border-bottom: 2px solid color-mix(in srgb, var(--cv-accent) 28%, transparent);
}
.summary { color: #4c5065; }
.entry { margin-bottom: 11px; }
.entry-head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.entry-head h3 { font-size: 11.5px; font-weight: 700; color: #1a1c2b; }
.dates { font-size: 9px; color: #8a8fa3; white-space: nowrap; }
.org { font-size: 10px; font-weight: 600; color: var(--cv-accent); }
.bullets { margin: 4px 0 0; padding-inline-start: 15px; display: grid; gap: 2px; }
.bullets li { color: #4c5065; }
.proj-desc { color: #4c5065; margin-top: 1px; }
.proj-tech { font-size: 9px; color: var(--cv-accent); font-weight: 600; margin-top: 2px; }
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
.stat { background: #fff; border: 1px solid #e7e7ee; border-radius: 8px; padding: 8px; text-align: center; }
.stat-v { display: block; font-size: 16px; font-weight: 800; color: var(--cv-accent); }
.stat-l { font-size: 8px; color: #6a6e82; text-transform: uppercase; letter-spacing: 0.06em; }
.aside-h { font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #1a1c2b; margin-bottom: 8px; }
.skill { margin-bottom: 7px; }
.skill-top { display: flex; justify-content: space-between; font-size: 9px; margin-bottom: 3px; }
.meter { height: 5px; border-radius: 9999px; background: #e4e4ec; overflow: hidden; }
.meter span { display: block; height: 100%; border-radius: inherit; background: var(--cv-accent); }
.edu { margin-bottom: 8px; }
.edu h3 { font-size: 10.5px; font-weight: 700; color: #1a1c2b; }
.edu-org { font-size: 9.5px; color: var(--cv-accent); font-weight: 600; }
.edu-date { font-size: 8.5px; color: #8a8fa3; }
.chips { list-style: none; display: flex; flex-wrap: wrap; gap: 5px; }
.chips li {
  font-size: 9px; padding: 2px 8px; border-radius: 9999px; background: #fff;
  border: 1px solid color-mix(in srgb, var(--cv-accent) 30%, #e2e2ea);
  color: color-mix(in srgb, var(--cv-accent) 78%, #000);
}
.tgroup { margin-bottom: 7px; }
.tgroup-name { font-size: 8.5px; font-weight: 700; color: #1a1c2b; margin-bottom: 3px; }
.langs { list-style: none; display: grid; gap: 4px; }
.langs li { display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; }
.lvl { font-size: 8px; font-weight: 700; color: var(--cv-accent); }
</style>
