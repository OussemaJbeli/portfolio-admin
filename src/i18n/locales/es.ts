import type { MessageSchema } from '@/i18n'

// Español
const es: MessageSchema = {
  nav: {
    home: 'Inicio',
    about: 'Acerca de',
    projects: 'Proyectos',
    contact: 'Contacto',
  },
  theme: {
    toLight: 'Cambiar a modo claro',
    toDark: 'Cambiar a modo oscuro',
  },
  language: {
    label: 'Idioma',
  },
  hero: {
    greeting: 'Hola, soy',
    name: 'Tu Nombre',
    role: 'Ingeniero Frontend',
    tagline:
      'Creo interfaces web rápidas y accesibles con Vue, TypeScript y Tailwind CSS.',
    ctaProjects: 'Ver proyectos',
    ctaContact: 'Contactar',
  },
  palette: {
    title: 'Paleta del tema',
    subtitle:
      'Estos son los tokens de color principales. Cambia el tema para verlos adaptarse.',
  },
  features: {
    title: 'Lo que incluye este starter',
    subtitle: 'Una base moderna y completa con Vue 3.',
    darkmode: {
      title: 'Modo oscuro',
      desc: 'Tema persistente y adaptado al sistema mediante un atributo data-theme.',
    },
    i18n: {
      title: 'Multi-idioma',
      desc: 'Internacionalización con vue-i18n y un selector listo para usar.',
    },
    tailwind: {
      title: 'Tailwind CSS v4',
      desc: 'Estilos utilitarios conectados a tus tokens de diseño personalizados.',
    },
    typescript: {
      title: 'TypeScript',
      desc: 'Componentes, router y stores totalmente tipados.',
    },
  },
  footer: {
    builtWith: 'Hecho con Vue 3, TypeScript y Tailwind CSS',
    rights: 'Todos los derechos reservados.',
  },
}

export default es
