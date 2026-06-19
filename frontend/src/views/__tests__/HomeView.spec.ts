import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import HomeView from '../HomeView.vue'

type PublicSettings = {
  site_name?: string
  site_logo?: string
  site_subtitle?: string
  doc_url?: string
  home_content?: string
}

const { authState, appState, fetchPublicSettings } = vi.hoisted(() => ({
  authState: {
    isAuthenticated: false,
    isAdmin: false,
    user: null as null | { email?: string },
  },
  appState: {
    cachedPublicSettings: null as PublicSettings | null,
    siteName: 'Qinglan Knowledge Base',
    siteLogo: '',
    docUrl: '',
    publicSettingsLoaded: true,
  },
  fetchPublicSettings: vi.fn(),
}))

const messages: Record<string, string> = {
  'home.viewDocs': 'View Resources',
  'home.docs': 'Resources',
  'home.switchToLight': 'Switch to Light Mode',
  'home.switchToDark': 'Switch to Dark Mode',
  'home.dashboard': 'Staff Entry',
  'home.login': 'Staff Entry',
  'home.getStarted': 'View Resources',
  'home.goToDashboard': 'Staff Entry',
  'home.heroSubtitle': 'Team documents, process notes, and collaboration resources',
  'home.heroDescription': 'A shared space for public notes, process references, project materials, and frequently used links.',
  'home.tags.archive': 'Archive',
  'home.tags.processIndex': 'Process Index',
  'home.tags.updates': 'Updates',
  'home.features.processGuides': 'Process Guides',
  'home.features.processGuidesDesc': 'Collect routine workflows, approval notes, and delivery conventions in one place.',
  'home.features.projectNotes': 'Project Notes',
  'home.features.projectNotesDesc': 'Archive project descriptions, maintenance notes, and shared references for team review.',
  'home.features.commonLinks': 'Common Links',
  'home.features.commonLinksDesc': 'Keep frequently used team resources easy to find and maintain.',
  'home.providers.title': 'Recent Updates',
  'home.providers.description': 'Shared team resources and maintenance notes',
  'home.providers.resourceIndex': 'Resource Index',
  'home.providers.processNotes': 'Process Notes',
  'home.providers.contactDetails': 'Contact Details',
  'home.providers.more': 'More Records',
  'home.resourceScope.items.process.desc': 'Cross-team collaboration and delivery references',
  'home.resourceScope.items.policy.desc': 'Shared team policies, notices, and public references',
  'home.resourceScope.items.common.desc': 'Frequently used links and contact information',
  'home.footer.allRightsReserved': 'All rights reserved.',
}

vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string) => messages[key] ?? key,
    }),
  }
})

vi.mock('@/stores', () => ({
  useAuthStore: () => ({
    get isAuthenticated() {
      return authState.isAuthenticated
    },
    get isAdmin() {
      return authState.isAdmin
    },
    get user() {
      return authState.user
    },
    checkAuth: vi.fn(),
  }),
  useAppStore: () => ({
    get cachedPublicSettings() {
      return appState.cachedPublicSettings
    },
    get siteName() {
      return appState.siteName
    },
    get siteLogo() {
      return appState.siteLogo
    },
    get docUrl() {
      return appState.docUrl
    },
    get publicSettingsLoaded() {
      return appState.publicSettingsLoaded
    },
    fetchPublicSettings,
  }),
}))

describe('HomeView decoy homepage', () => {
  beforeEach(() => {
    authState.isAuthenticated = false
    authState.isAdmin = false
    authState.user = null
    appState.cachedPublicSettings = null
    appState.siteName = 'Sub2API'
    appState.siteLogo = ''
    appState.docUrl = ''
    appState.publicSettingsLoaded = true
    fetchPublicSettings.mockReset()
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    })
  })

  function mountHome() {
    return mount(HomeView, {
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a :href="typeof to === `string` ? to : to?.path"><slot /></a>',
          },
          LocaleSwitcher: true,
          Icon: true,
        },
      },
    })
  }

  it('renders a neutral knowledge-base homepage without sensitive business terms', () => {
    const wrapper = mountHome()

    const text = wrapper.text()
    expect(text).toContain('Team documents, process notes, and collaboration resources')
    expect(text).toContain('Qinglan Knowledge Base')
    expect(text).toContain('Staff Entry')
    expect(text).toContain('Recent Updates')

    const blockedTerms = [
      'AI',
      'API',
      'Claude',
      'GPT',
      'Gemini',
      'Antigravity',
      'model',
      'gateway',
      'subscription',
      'key',
      'Sub2API',
    ]

    for (const term of blockedTerms) {
      expect(text).not.toContain(term)
    }

    expect(wrapper.html()).not.toContain('github.com/Wei-Shaw')
    expect(fetchPublicSettings).not.toHaveBeenCalled()
  })

  it('keeps admin-provided home content as the highest-priority override', () => {
    appState.cachedPublicSettings = {
      home_content: '<main class="custom-home">Custom staff notice</main>',
    }

    const wrapper = mountHome()

    expect(wrapper.find('.custom-home').exists()).toBe(true)
    expect(wrapper.text()).toContain('Custom staff notice')
    expect(wrapper.text()).not.toContain('Team documents, process notes, and collaboration resources')
  })

  it('does not expose configured business subtitle on the default homepage', () => {
    appState.cachedPublicSettings = {
      site_name: 'Sub2API',
      site_logo: '/logo.png',
      site_subtitle: 'AI API Gateway Platform',
      doc_url: 'https://github.com/Wei-Shaw/sub2api',
    }

    const wrapper = mountHome()

    expect(wrapper.text()).toContain('Qinglan Knowledge Base')
    expect(wrapper.text()).not.toContain('Sub2API')
    expect(wrapper.text()).toContain('A shared space for public notes')
    expect(wrapper.text()).not.toContain('AI API Gateway Platform')
    expect(wrapper.html()).not.toContain('https://github.com/Wei-Shaw/sub2api')
    expect(wrapper.find('img[src="/logo.png"]').exists()).toBe(false)
  })
})
