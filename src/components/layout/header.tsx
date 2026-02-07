'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useNetwork } from '@/providers/network-provider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export function Header() {
  const { network, toggleNetwork } = useNetwork()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 font-bold text-white text-sm">
              FV
            </div>
            <span className="text-lg font-bold">FlareVault</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/yield" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Yield
            </Link>
            <Link href="/bridge" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Bridge
            </Link>
            <Link href="/stake" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Stake
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="network-toggle" className="text-xs text-muted-foreground">
              {network === 'flare' ? 'Mainnet' : 'Coston2'}
            </Label>
            <Switch
              id="network-toggle"
              checked={network === 'coston2'}
              onCheckedChange={toggleNetwork}
            />
          </div>
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus="address"
          />
        </div>
      </div>
    </header>
  )
}
