import type { MessageSchema } from '@/i18n'

// Français
const fr: MessageSchema = {
  nav: {
    home: 'Accueil',
    about: 'À propos',
    projects: 'Projets',
    contact: 'Contact',
  },
  theme: {
    toLight: 'Passer en mode clair',
    toDark: 'Passer en mode sombre',
  },
  language: {
    label: 'Langue',
  },
  hero: {
    greeting: 'Bonjour, je suis',
    name: 'Votre Nom',
    role: 'Ingénieur Frontend',
    tagline:
      "Je conçois des interfaces web rapides et accessibles avec Vue, TypeScript et Tailwind CSS.",
    ctaProjects: 'Voir les projets',
    ctaContact: 'Me contacter',
  },
  palette: {
    title: 'Palette de thème',
    subtitle:
      "Voici les jetons de couleur principaux. Changez de thème pour les voir s'adapter.",
  },
  features: {
    title: 'Ce que contient ce starter',
    subtitle: 'Une base Vue 3 moderne et complète.',
    darkmode: {
      title: 'Mode sombre',
      desc: 'Thème persistant et adapté au système via un attribut data-theme.',
    },
    i18n: {
      title: 'Multilingue',
      desc: 'Internationalisation avec vue-i18n et un sélecteur prêt à l’emploi.',
    },
    tailwind: {
      title: 'Tailwind CSS v4',
      desc: 'Style utilitaire connecté à vos jetons de design personnalisés.',
    },
    typescript: {
      title: 'TypeScript',
      desc: 'Composants, routeur et stores entièrement typés.',
    },
  },
  footer: {
    builtWith: 'Réalisé avec Vue 3, TypeScript et Tailwind CSS',
    rights: 'Tous droits réservés.',
  },
}

export default fr
