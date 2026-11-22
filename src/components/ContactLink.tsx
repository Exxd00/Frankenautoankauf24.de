"use client"

import type { ComponentPropsWithoutRef } from "react"
import { trackPhoneClick, trackWhatsAppClick } from "@/lib/leadTracking"

type ContactLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href" | "onClick"> & {
  href: `tel:${string}` | `https://wa.me/${string}`
}

export default function ContactLink({ href, ...props }: ContactLinkProps) {
  const onClick = href.startsWith("tel:") ? trackPhoneClick : trackWhatsAppClick
  return <a {...props} href={href} onClick={onClick} />
}
