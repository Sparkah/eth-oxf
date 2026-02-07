'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, TrendingUp, Coins, ArrowLeftRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const { isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard')
    }
  }, [isConnected, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <div className="text-center space-y-4 max-w-2xl">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white text-2xl font-bold">
            FV
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">FlareVault</h1>
        <p className="text-lg text-muted-foreground">
          Your all-in-one portfolio dashboard for the Flare ecosystem.
          Track balances, discover yield, bridge XRP, and stake — all in one place.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl w-full">
        {[
          { icon: Shield, label: 'Portfolio', desc: 'Track all tokens' },
          { icon: TrendingUp, label: 'Yield', desc: 'Compare APYs' },
          { icon: ArrowLeftRight, label: 'Bridge', desc: 'XRP to FXRP' },
          { icon: Coins, label: 'Stake', desc: 'Earn stXRP' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-center"
          >
            <item.icon className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-medium">{item.label}</p>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <ConnectButton />
        <Link href="/dashboard">
          <Button variant="outline" size="lg">
            Explore with demo data
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
