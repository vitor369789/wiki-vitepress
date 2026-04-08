import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Central de Ajuda",
  description: "Documentação completa do sistema",
  lang: 'pt-BR',
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Início', link: '/' },
      { text: 'Documentação', link: '/documentacao/' },
      { text: 'Mixtel', link: '/mixtel/troubleshooting/' },
      { text: 'API', link: '/api/' },
      { text: 'FAQ', link: '/faq' },
      { text: 'Admin', link: '/admin/' }
    ],

    sidebar: {
      '/documentacao/': [
        {
          text: 'Introdução',
          items: [
            { text: 'Bem-vindo', link: '/documentacao/' },
            { text: 'Primeiros Passos', link: '/documentacao/primeiros-passos' }
          ]
        },
        {
          text: 'Guias',
          items: [
            { text: 'Instalação', link: '/documentacao/guias/instalacao' },
            { text: 'Configuração', link: '/documentacao/guias/configuracao' }
          ]
        },
        {
          text: 'Recursos',
          items: [
            { text: 'Funcionalidades', link: '/documentacao/recursos/funcionalidades' },
            { text: 'Integrações', link: '/documentacao/recursos/integracoes' }
          ]
        }
      ],
      '/mixtel/': [
        {
          text: 'Troubleshooting',
          items: [
            { text: 'Visão Geral', link: '/mixtel/troubleshooting/' },
            { text: 'Fiberhome', link: '/mixtel/troubleshooting/fiberhome/' },
            { text: 'Huawei', link: '/mixtel/troubleshooting/huawei/' }
          ]
        },
        {
          text: 'Equipamentos',
          items: [
            { text: 'ONUs', link: '/mixtel/equipamentos/onus' },
            { text: 'OLTs', link: '/mixtel/equipamentos/olts' },
            { text: 'Switches', link: '/mixtel/equipamentos/switches' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API',
          items: [
            { text: 'Visão Geral', link: '/api/' },
            { text: 'Autenticação', link: '/api/autenticacao' },
            { text: 'Endpoints', link: '/api/endpoints' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/seu-usuario/sua-wiki' }
    ],

    footer: {
      message: 'Documentação desenvolvida com VitePress',
      copyright: 'Copyright © 2026 iCore'
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: 'Buscar',
            buttonAriaLabel: 'Buscar'
          },
          modal: {
            noResultsText: 'Nenhum resultado encontrado',
            resetButtonTitle: 'Limpar busca',
            footer: {
              selectText: 'para selecionar',
              navigateText: 'para navegar',
              closeText: 'para fechar'
            }
          }
        }
      }
    },

    outline: {
      label: 'Nesta página',
      level: [2, 3]
    },

    docFooter: {
      prev: 'Página anterior',
      next: 'Próxima página'
    },

    darkModeSwitchLabel: 'Aparência',
    sidebarMenuLabel: 'Menu',
    returnToTopLabel: 'Voltar ao topo',
    langMenuLabel: 'Mudar idioma'
  }
})
