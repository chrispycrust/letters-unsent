"use client"

import { useEffect, useState } from "react"

const MOBILE_OWNER_SURFACE_QUERY = "(max-width: 1280px)"

function getIsMobileOwnerSurface(): boolean {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(MOBILE_OWNER_SURFACE_QUERY).matches
}

export default function useIsMobileOwnerSurface() {
  const [isMobile, setIsMobile] = useState(getIsMobileOwnerSurface)

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return
    }

    const mediaQuery = window.matchMedia(MOBILE_OWNER_SURFACE_QUERY)
    const updateIsMobile = () => setIsMobile(mediaQuery.matches)

    updateIsMobile()
    mediaQuery.addEventListener("change", updateIsMobile)

    return () => {
      mediaQuery.removeEventListener("change", updateIsMobile)
    }
  }, [])

  return isMobile
}
