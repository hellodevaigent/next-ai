"use client"

import { useBreakpoint } from "@/lib/hooks/use-breakpoint"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ConnectWallet } from "../web3/connect-wallet"
import { Wallet } from "@phosphor-icons/react"
import { useState } from "react"

type DialogConnectWalletProps = {
  onWalletVerified?: (walletInfo: { 
    address: string
    signature: string
    nonce: string 
  }) => void
}

export function DialogConnectWallet({
  onWalletVerified,
}: DialogConnectWalletProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useBreakpoint(768)

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleWalletVerified = (walletInfo: { 
    address: string
    signature: string
    nonce: string 
  }) => {
    onWalletVerified?.(walletInfo)
    setIsOpen(false)
  }

  const trigger = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground bg-muted rounded-full p-1.5 transition-colors"
            onClick={() => setIsOpen(true)}
          >
            <Wallet className="size-5" />
            <span className="sr-only">Connect Wallet</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Connect Wallet</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  const renderContent = () => (
    <div className="flex max-h-[80vh] flex-col">
      <ConnectWallet
        onClose={handleClose}
        onWalletVerified={handleWalletVerified}
      />
    </div>
  )

  if (isMobile) {
    return (
      <>
        {trigger}
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="px-0">
            <DrawerHeader className="sr-only">
              <DrawerTitle>Connect Wallet</DrawerTitle>
            </DrawerHeader>
            {renderContent()}
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  return (
    <>
      {trigger}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="[&>button:last-child]:bg-background gap-0 overflow-hidden rounded-3xl p-0 shadow-xs sm:max-w-md [&>button:last-child]:rounded-full [&>button:last-child]:p-1">
          <DialogHeader className="sr-only">
            <DialogTitle>Connect Wallet</DialogTitle>
          </DialogHeader>
          {renderContent()}
        </DialogContent>
      </Dialog>
    </>
  )
}