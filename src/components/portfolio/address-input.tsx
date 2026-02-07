'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, Plus, X } from 'lucide-react'
import { shortenAddress } from '@/lib/utils'

interface AddressInputProps {
  addresses: string[]
  onAddressesChange: (addresses: string[]) => void
}

export function AddressInput({ addresses, onAddressesChange }: AddressInputProps) {
  const [input, setInput] = useState('')
  const { address: connectedAddress } = useAccount()

  const addAddress = () => {
    const trimmed = input.trim()
    if (trimmed && /^0x[a-fA-F0-9]{40}$/.test(trimmed) && !addresses.includes(trimmed)) {
      onAddressesChange([...addresses, trimmed])
      setInput('')
    }
  }

  const addConnected = () => {
    if (connectedAddress && !addresses.includes(connectedAddress)) {
      onAddressesChange([...addresses, connectedAddress])
    }
  }

  const removeAddress = (addr: string) => {
    onAddressesChange(addresses.filter((a) => a !== addr))
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Tracked Wallets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="0x... wallet address"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addAddress()}
            className="font-mono text-xs"
          />
          <Button size="sm" onClick={addAddress} disabled={!input.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {connectedAddress && !addresses.includes(connectedAddress) && (
          <Button variant="outline" size="sm" className="w-full" onClick={addConnected}>
            <Wallet className="h-4 w-4 mr-2" />
            Add connected wallet ({shortenAddress(connectedAddress)})
          </Button>
        )}

        {addresses.length > 0 && (
          <div className="space-y-1">
            {addresses.map((addr) => (
              <div
                key={addr}
                className="flex items-center justify-between rounded-md bg-muted px-3 py-1.5 text-xs font-mono"
              >
                <span>{shortenAddress(addr, 6)}</span>
                <button
                  onClick={() => removeAddress(addr)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
