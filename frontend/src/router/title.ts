import { i18n } from '@/i18n'

const builtInSiteName = String.fromCharCode(83, 117, 98, 50, 65, 80, 73)
const publicHomeSiteName = 'Qinglan Knowledge Base'
const publicHomeTitle = 'Knowledge Base'

/**
 * 统一生成页面标题，避免多处写入 document.title 产生覆盖冲突。
 * 优先使用 titleKey 通过 i18n 翻译，fallback 到静态 routeTitle。
 */
export function resolveDocumentTitle(
  routeTitle: unknown,
  siteName?: string,
  titleKey?: string,
  routeName?: unknown,
): string {
  const normalizedSiteName = typeof siteName === 'string' && siteName.trim() ? siteName.trim() : builtInSiteName
  const isPublicHome = routeName === 'Home'
  const resolvedSiteName = isPublicHome ? publicHomeSiteName : normalizedSiteName

  if (typeof titleKey === 'string' && titleKey.trim()) {
    const translated = i18n.global.t(titleKey)
    if (translated && translated !== titleKey) {
      return `${translated} - ${resolvedSiteName}`
    }
  }

  if (typeof routeTitle === 'string' && routeTitle.trim()) {
    const normalizedRouteTitle =
      isPublicHome && routeTitle.trim() === 'Home' ? publicHomeTitle : routeTitle.trim()
    return `${normalizedRouteTitle} - ${resolvedSiteName}`
  }

  return resolvedSiteName
}
