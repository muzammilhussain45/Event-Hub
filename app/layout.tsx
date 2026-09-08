import type { Metadata } from 'next'
import { Poppins, Geist } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

import './globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Event Hub',
  description: 'A platform for managing and discovering events',
  icons: {
    icon: '/assets/images/logo.png'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={cn("font-sans", geist.variable)}>
        <body className={poppins.variable}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
