'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 font-bold text-white text-sm">
            FV
          </div>
          <span className="text-lg font-bold">FlareVault</span>
        </Link>

        <ConnectButton
          showBalance={false}
          chainStatus="name"
          accountStatus="address"
        />
      </div>
    </header>
  )
}
