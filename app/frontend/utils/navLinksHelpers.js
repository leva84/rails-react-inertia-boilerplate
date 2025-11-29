export const getNavLinkClasses = (currentUrl, path, isMobile = false) => {
  const isActive = currentUrl === path || (path !== '/' && currentUrl.startsWith(path))

  if (isMobile) {
    return `mobile-nav-link ${isActive ? 'mobile-nav-link-active' : 'mobile-nav-link-inactive'}`
  }

  return `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
}
