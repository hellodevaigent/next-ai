import { usePathname } from "next/navigation"

type RouteConfig = {
  exact?: string[]
  startsWith?: string[]
  regex?: RegExp[]
}

export const useRouteVisibility = (config: RouteConfig) => {
  const pathname = usePathname()

  const shouldHide = () => {
    if (config.exact?.includes(pathname)) {
      return true
    }

    if (config.startsWith?.some((pattern) => pathname.startsWith(pattern))) {
      return true
    }

    if (config.regex?.some((pattern) => pattern.test(pathname))) {
      return true
    }

    return false
  }

  return { shouldHide }
}
