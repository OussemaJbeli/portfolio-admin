/**
 * Inline SVG icon set (Lucide-style line icons) — no icon dependency.
 * Each entry is the inner markup of a 24×24 stroke icon, rendered by `Icon.vue`.
 */
export const icons = {
  dashboard:
    '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  hero: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9.5" r="1.6"/><path d="M4 18l5-5 3 3 4-4 4 4"/>',
  about: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  bullets:
    '<path d="M4 7l1.6 1.6L8.5 5.5"/><path d="M4 16.5l1.6 1.6L8.5 15"/><line x1="11" y1="7" x2="20" y2="7"/><line x1="11" y1="17" x2="20" y2="17"/>',
  stats:
    '<line x1="6" y1="20" x2="6" y2="12"/><line x1="12" y1="20" x2="12" y2="5"/><line x1="18" y1="20" x2="18" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/>',
  skills: '<circle cx="12" cy="9" r="5"/><path d="M9 13.5L7.5 21 12 18.5 16.5 21 15 13.5"/>',
  technologies:
    '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><line x1="9" y1="3" x2="9" y2="6"/><line x1="15" y1="3" x2="15" y2="6"/><line x1="9" y1="18" x2="9" y2="21"/><line x1="15" y1="18" x2="15" y2="21"/><line x1="3" y1="9" x2="6" y2="9"/><line x1="3" y1="15" x2="6" y2="15"/><line x1="18" y1="9" x2="21" y2="9"/><line x1="18" y1="15" x2="21" y2="15"/>',
  projects:
    '<path d="M3 7a2 2 0 0 1 2-2h3.5l2 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  categories:
    '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  blogs:
    '<path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><line x1="9.5" y1="13" x2="15" y2="13"/><line x1="9.5" y1="16.5" x2="15" y2="16.5"/>',
  author: '<path d="M4 20h4L19 9l-4-4L4 16z"/><line x1="14" y1="6" x2="18" y2="10"/>',
  messages:
    '<path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4V6a1 1 0 0 1 1-1z"/><line x1="8.5" y1="9.5" x2="15.5" y2="9.5"/><line x1="8.5" y1="12.5" x2="13" y2="12.5"/>',
  settings:
    '<line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/><circle cx="9" cy="8" r="2.4"/><circle cx="15" cy="16" r="2.4"/>',
  navigation:
    '<circle cx="12" cy="12" r="9"/><polygon points="15.5 8.5 13 13 8.5 15.5 11 11"/>',
  social:
    '<circle cx="6" cy="12" r="2.5"/><circle cx="17" cy="6" r="2.5"/><circle cx="17" cy="18" r="2.5"/><line x1="8.3" y1="10.8" x2="14.7" y2="7.2"/><line x1="8.3" y1="13.2" x2="14.7" y2="16.8"/>',
  contact: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  users:
    '<circle cx="9" cy="8" r="3.5"/><path d="M3 19a6 6 0 0 1 12 0"/><path d="M16 5a3.5 3.5 0 0 1 0 6"/><path d="M17.5 13.5A6 6 0 0 1 21 19"/>',
  search: '<circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  logout:
    '<path d="M14 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8"/><path d="M11 12h9"/><path d="M17 8l4 4-4 4"/>',
  menu: '<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>',
  close: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
  chevron: '<polyline points="9 6 15 12 9 18"/>',
} as const

export type IconName = keyof typeof icons
