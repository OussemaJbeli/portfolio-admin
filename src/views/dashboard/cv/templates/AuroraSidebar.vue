<script setup lang="ts">
/** Aurora — a modern two-column résumé: a full-height accent-gradient sidebar
 *  (identity, contact, skills, tech) beside a clean content column. */
import type { CvTemplateProps } from '@/views/dashboard/cv/types'

defineProps<CvTemplateProps>()
</script>

<template>
  <div class="tpl-aurora" :dir="data.rtl ? 'rtl' : 'ltr'">
    <!-- Sidebar -->
    <aside class="side">
      <div class="side-glow" aria-hidden="true" />
      <div v-if="data.photoUrl" class="avatar">
        <img :src="data.photoUrl" :alt="data.name" />
      </div>
      <h1 class="name">{{ data.name }}</h1>
      <p class="role">{{ data.role }}</p>

      <section v-if="data.contact.email || data.contact.phone || data.contact.location" class="block">
        <h2 class="side-h">{{ data.labels.contact }}</h2>
        <ul class="contact">
          <li v-if="data.contact.email">✉ {{ data.contact.email }}</li>
          <li v-if="data.contact.phone">☏ {{ data.contact.phone }}</li>
          <li v-if="data.contact.location">⌖ {{ data.contact.location }}</li>
          <li v-for="lnk in data.links" :key="lnk.url">↗ {{ lnk.label }}</li>
        </ul>
      </section>

      <section v-if="data.skills.length" class="block">
        <h2 class="side-h">{{ data.labels.skills }}</h2>
        <div v-for="s in data.skills" :key="s.name" class="skill">
          <div class="skill-top"><span>{{ s.name }}</span><span>{{ s.percentage }}%</span></div>
          <div class="meter"><span :style="{ width: s.percentage + '%' }" /></div>
        </div>
      </section>

      <section v-if="data.techGroups.length" class="block">
        <h2 class="side-h">{{ data.labels.technologies }}</h2>
        <div v-for="g in data.techGroups" :key="g.name" class="tgroup">
          <p v-if="g.name" class="tgroup-name">{{ g.name }}</p>
          <ul class="chips">
            <li v-for="t in g.items" :key="t">{{ t }}</li>
          </ul>
        </div>
      </section>

      <section v-if="data.languages.length" class="block">
        <h2 class="side-h">{{ data.labels.languages }}</h2>
        <ul class="langs">
          <li v-for="l in data.languages" :key="l.name"><span>{{ l.name }}</span><span class="lvl">{{ l.level }}</span></li>
        </ul>
      </section>

      <section v-if="data.interests.length" class="block">
        <h2 class="side-h">{{ data.labels.interests }}</h2>
        <ul class="chips">
          <li v-for="i in data.interests" :key="i">{{ i }}</li>
        </ul>
      </section>
    </aside>

    <!-- Content -->
    <main class="content">
      <section v-if="data.summary" class="c-block">
        <h2 class="c-h">{{ data.labels.summary }}</h2>
        <p class="summary">{{ data.summary }}</p>
      </section>

      <section v-if="data.experience.length" class="c-block">
        <h2 class="c-h">{{ data.labels.experience }}</h2>
        <div v-for="(e, i) in data.experience" :key="i" class="entry">
          <div class="entry-head">
            <h3>{{ e.title }}</h3>
            <span class="dates">{{ e.start }}<template v-if="e.start"> – </template>{{ e.current ? data.labels.present : e.end }}</span>
          </div>
          <p v-if="e.org || e.location || e.employmentType" class="org">{{ e.org }}<template v-if="e.location"> · {{ e.location }}</template><template v-if="e.employmentType"> · {{ e.employmentType }}</template></p>
          <ul v-if="e.bullets.length" class="bullets">
            <li v-for="(b, bi) in e.bullets" :key="bi">{{ b }}</li>
          </ul>
        </div>
      </section>

      <section v-if="data.education.length" class="c-block">
        <h2 class="c-h">{{ data.labels.education }}</h2>
        <div v-for="(e, i) in data.education" :key="i" class="entry">
          <div class="entry-head">
            <h3>{{ e.title }}</h3>
            <span class="dates">{{ e.start }}<template v-if="e.start"> – </template>{{ e.current ? data.labels.present : e.end }}</span>
          </div>
          <p v-if="e.org || e.location || e.employmentType" class="org">{{ e.org }}<template v-if="e.location"> · {{ e.location }}</template><template v-if="e.employmentType"> · {{ e.employmentType }}</template></p>
        </div>
      </section>

      <section v-if="data.projects.length" class="c-block">
        <h2 class="c-h">{{ data.labels.projects }}</h2>
        <div v-for="(p, i) in data.projects" :key="i" class="proj">
          <h3>{{ p.title }}</h3>
          <p v-if="p.description" class="proj-desc">{{ p.description }}</p>
          <p v-if="p.tech.length" class="proj-tech">{{ p.tech.join(' · ') }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.tpl-aurora {
  display: flex;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
  color: #23263a;
  line-height: 1.5;
  font-size: 10.5px;
}
.side {
  position: relative;
  width: 34%;
  padding: 22mm 8mm;
  color: #fff;
  background: linear-gradient(160deg,
    color-mix(in srgb, var(--cv-accent) 92%, #000) 0%,
    var(--cv-accent) 45%,
    color-mix(in srgb, var(--cv-accent) 70%, #ff5e00) 100%);
  overflow: hidden;
}
.side-glow {
  position: absolute;
  top: -20%;
  right: -30%;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  filter: blur(28px);
}
.avatar {
  width: 74px;
  height: 74px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 6px 18px -6px rgba(0, 0, 0, 0.4);
  margin-bottom: 12px;
}
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.name { font-size: 20px; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; }
.role { margin-top: 4px; font-size: 11px; font-weight: 500; opacity: 0.92; }
.block { margin-top: 18px; }
.side-h {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  padding-bottom: 5px;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.35);
}
.contact { list-style: none; display: grid; gap: 5px; word-break: break-word; }
.skill { margin-bottom: 8px; }
.skill-top { display: flex; justify-content: space-between; font-size: 9.5px; margin-bottom: 3px; }
.meter { height: 4px; border-radius: 9999px; background: rgba(255, 255, 255, 0.28); overflow: hidden; }
.meter span { display: block; height: 100%; border-radius: inherit; background: #fff; }
.chips { list-style: none; display: flex; flex-wrap: wrap; gap: 5px; }
.chips li {
  font-size: 9px;
  padding: 2px 8px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.28);
}
.tgroup { margin-bottom: 8px; }
.tgroup-name { font-size: 9px; font-weight: 700; opacity: 0.85; margin-bottom: 4px; }
.langs { list-style: none; display: grid; gap: 5px; }
.langs li { display: flex; align-items: center; justify-content: space-between; font-size: 9.5px; }
.lvl { font-size: 8px; padding: 1px 7px; border-radius: 9999px; background: rgba(255, 255, 255, 0.2); font-weight: 700; }
.content { flex: 1; padding: 22mm 12mm; }
.c-block { margin-bottom: 16px; }
.c-h {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--cv-accent);
  margin-bottom: 9px;
  padding-bottom: 4px;
  border-bottom: 2px solid color-mix(in srgb, var(--cv-accent) 30%, transparent);
}
.summary { color: #4a4e63; }
.entry { margin-bottom: 12px; }
.entry-head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.entry-head h3 { font-size: 11.5px; font-weight: 700; color: #1a1d2e; }
.dates { font-size: 9px; color: #8a8fa3; white-space: nowrap; }
.org { font-size: 10px; font-weight: 600; color: var(--cv-accent); margin-top: 1px; }
.bullets { margin: 5px 0 0; padding-inline-start: 15px; display: grid; gap: 2px; }
.bullets li { color: #4a4e63; }
.proj { margin-bottom: 10px; }
.proj h3 { font-size: 11px; font-weight: 700; }
.proj-desc { color: #4a4e63; margin-top: 1px; }
.proj-tech { font-size: 9px; color: var(--cv-accent); margin-top: 2px; font-weight: 600; }
</style>
