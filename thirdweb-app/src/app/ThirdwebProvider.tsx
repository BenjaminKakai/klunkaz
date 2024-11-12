'use client';

import { ThirdwebProvider } from "@thirdweb-dev/react";
import { BaseSepolia } from "@thirdweb-dev/chains";
import { ReactNode } from "react";

interface ThirdwebProviderProps {
  children: ReactNode;
}

export function ThirdwebProviderWrapper({ children }: ThirdwebProviderProps) {
  return (
    <ThirdwebProvider
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
      activeChain={BaseSepolia}
    >
      {children}
    </ThirdwebProvider>
  );
}