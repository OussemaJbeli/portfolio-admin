<script setup lang="ts">
/** Terminal — a dark, monospace résumé styled as a terminal window. Section
 *  headers read like shell commands; skills render as ASCII meters. Prints its
 *  dark background (print-color-adjust: exact). */
import { computed } from 'vue'
import type { CvTemplateProps } from '@/views/dashboard/cv/types'

const props = defineProps<CvTemplateProps>()

/** "[██████░░░░] 62%" style bar for a 0–100 value. */
function bar(pct: number): string {
  const filled = Math.round((pct / 100) * 10)
  return '█'.repeat(filled) + '░'.repeat(10 - filled)
}

const handle = computed(() => (props.data.name || 'user').toLowerCase().replace(/\s+/g, '-'))
</script>

<template>
  <div class="tpl-term" :dir="data.rtl ? 'rtl' : 'ltr'">
    <!-- Title bar -->
    <div class="bar">
      <span class="dot r" /><span class="dot y" /><span class="dot g" />
      <span class="bar-title">{{ handle }}@portfolio: ~/cv</span>
    </div>

    <div class="body">
      <!-- Prompt header -->
      <p class="cmd"><span class="usr">{{ handle }}</span>:<span class="pth">~</span>$ whoami</p>
      <h1 class="name">{{ data.name }}</h1>
      <p class="role">// {{ data.role }}</p>

      <ul class="meta">
        <li v-if="data.contact.email"><span class="k">email</span> = "{{ data.contact.email }}"</li>
        <li v-if="data.contact.phone"><span class="k">phone</span> = "{{ data.contact.phone }}"</li>
        <li v-if="data.contact.location"><span class="k">loc</span>&nbsp;&nbsp;= "{{ data.contact.location }}"</li>
        <li v-for="lnk in data.links" :key="lnk.url"><span class="k">{{ lnk.platform.toLowerCase() }}</span> = "{{ lnk.label }}"</li>
      </ul>

      <template v-if="data.summary">
        <p class="cmd"><span class="usr">{{ handle }}</span>:<span class="pth">~</span>$ cat summary.txt</p>
        <p class="summary">{{ data.summary }}</p>
      </template>

      <template v-if="data.skills.length">
        <p class="cmd"><span class="usr">{{ handle }}</span>:<span class="pth">~</span>$ ./skills --list</p>
        <pre class="skills">{{ '' }}<span v-for="s in data.skills" :key="s.name" class="skill-row">{{ s.name.padEnd(22, ' ') }}[<span class="meter">{{ bar(s.percentage) }}</span>] {{ s.percentage }}%
</span></pre>
      </template>

      <template v-if="data.techGroups.length">
        <p class="cmd"><span class="usr">{{ handle }}</span>:<span class="pth">~</span>$ ls stack/</p>
        <div v-for="g in data.techGroups" :key="g.name" class="tgrp">
          <p v-if="g.name" class="tgrp-name"># {{ g.name }}</p>
          <p class="stack"><span v-for="t in g.items" :key="t" class="tok">{{ t }}</span></p>
        </div>
      </template>

      <template v-if="data.languages.length">
        <p class="cmd"><span class="usr">{{ handle }}</span>:<span class="pth">~</span>$ cat languages.txt</p>
        <ul class="meta">
          <li v-for="l in data.languages" :key="l.name"><span class="k">{{ l.name.toLowerCase() }}</span> = "{{ l.level }}"<template v-if="l.note"> <span class="cmt">// {{ l.note }}</span></template></li>
        </ul>
      </template>

      <template v-if="data.interests.length">
        <p class="cmd"><span class="usr">{{ handle }}</span>:<span class="pth">~</span>$ cat interests.txt</p>
        <p class="stack"><span v-for="i in data.interests" :key="i" class="tok">{{ i }}</span></p>
      </template>

      <template v-if="data.experience.length">
        <p class="cmd"><span class="usr">{{ handle }}</span>:<span class="pth">~</span>$ git log --oneline experience</p>
        <div v-for="(e, i) in data.experience" :key="i" class="entry">
          <p class="entry-h"><span class="hash">{{ (i + 1).toString(16).padStart(7, '0') }}</span> <b>{{ e.title }}</b> <span v-if="e.org" class="at">@ {{ e.org }}</span></p>
          <p class="entry-d">{{ e.start }}<template v-if="e.start"> → </template>{{ e.current ? data.labels.present : e.end }}<template v-if="e.location"> · {{ e.location }}</template><template v-if="e.employmentType"> · {{ e.employmentType }}</template></p>
          <ul class="bullets"><li v-for="(b, bi) in e.bullets" :key="bi">{{ b }}</li></ul>
        </div>
      </template>

      <template v-if="data.education.length">
        <p class="cmd"><span class="usr">{{ handle }}</span>:<span class="pth">~</span>$ git log --oneline education</p>
        <div v-for="(e, i) in data.education" :key="i" class="entry">
          <p class="entry-h"><span class="hash">edu{{ (i + 1).toString().padStart(4, '0') }}</span> <b>{{ e.title }}</b> <span v-if="e.org" class="at">@ {{ e.org }}</span></p>
          <p class="entry-d">{{ e.start }}<template v-if="e.start"> → </template>{{ e.current ? data.labels.present : e.end }}<template v-if="e.location"> · {{ e.location }}</template><template v-if="e.employmentType"> · {{ e.employmentType }}</template></p>
        </div>
      </template>

      <template v-if="data.projects.length">
        <p class="cmd"><span class="usr">{{ handle }}</span>:<span class="pth">~</span>$ ls projects/</p>
        <div v-for="(p, i) in data.projects" :key="i" class="entry">
          <p class="entry-h"><span class="folder">▸</span> <b>{{ p.title }}</b></p>
          <p v-if="p.description" class="proj-desc">{{ p.description }}</p>
          <p v-if="p.tech.length" class="proj-tech"># {{ p.tech.join(' ') }}</p>
        </div>
      </template>

      <p class="cmd end"><span class="usr">{{ handle }}</span>:<span class="pth">~</span>$ <span class="caret">▮</span></p>
    </div>
  </div>
</template>

<style scoped>
.tpl-term {
  background: #0b1020;
  color: #d7dcf5;
  font-family: ui-monospace, 'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace;
  font-size: 9.6px;
  line-height: 1.6;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #10162e;
  border-bottom: 1px solid #1e2749;
}
.dot { width: 9px; height: 9px; border-radius: 50%; }
.dot.r { background: #ff5f56; } .dot.y { background: #ffbd2e; } .dot.g { background: #27c93f; }
.bar-title { margin-inline-start: 8px; color: #6b76a8; font-size: 9px; }
.body { padding: 14mm 12mm; }
.cmd { color: #6b76a8; margin-top: 14px; }
.cmd:first-of-type { margin-top: 0; }
.usr { color: var(--cv-accent); font-weight: 700; }
.pth { color: #5aa9ff; }
.name {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  margin-top: 4px;
  letter-spacing: -0.01em;
}
.role { color: var(--cv-accent); margin-top: 1px; }
.meta { list-style: none; margin-top: 8px; display: grid; gap: 2px; color: #aab2df; }
.meta .k { color: #5aa9ff; }
.summary { color: #c2c9ee; margin-top: 5px; max-width: 62ch; }
.skills { margin-top: 5px; font-family: inherit; white-space: pre-wrap; }
.skill-row { display: block; }
.meter { color: var(--cv-accent); }
.tgrp { margin-top: 5px; }
.tgrp-name { color: #6b76a8; }
.cmt { color: #6b76a8; }
.stack { margin-top: 4px; display: flex; flex-wrap: wrap; gap: 5px; }
.tok {
  padding: 1px 7px;
  border: 1px solid #26315c;
  border-radius: 4px;
  background: #131b38;
  color: #cdd5f7;
}
.entry { margin-top: 8px; }
.entry-h b { color: #fff; }
.hash { color: var(--cv-accent); }
.at { color: #7f8ac0; }
.folder { color: var(--cv-accent); }
.entry-d { color: #6b76a8; }
.bullets { margin: 3px 0 0; padding-inline-start: 16px; }
.bullets li { color: #c2c9ee; }
.proj-desc { color: #c2c9ee; margin-top: 1px; }
.proj-tech { color: #6b76a8; margin-top: 1px; }
.end { margin-top: 16px; }
.caret { color: var(--cv-accent); }
</style>
