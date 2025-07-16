import { usePathname } from "next/navigation"

export function usePathnameCheck(paths: string[]) {
  const pathname = usePathname()
  return paths.includes(pathname)
}

// Alternative with more descriptive name
export function useIsPathExcluded(excludedPaths: string[]) {
  const pathname = usePathname()
  return excludedPaths.includes(pathname)
}