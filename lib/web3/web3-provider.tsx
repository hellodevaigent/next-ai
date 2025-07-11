'use client';

import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "./config";

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      {children}
    </WagmiProvider>
  );
};