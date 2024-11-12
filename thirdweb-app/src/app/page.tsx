'use client';

import { BikeList } from "@/components/BikeList";
import { ListBikeForm } from "@/components/ListBikeForm";
import { UserProfile } from "@/components/UserProfile";
import { TransactionHistory } from "@/components/TransactionHistory";
import { ThirdwebProvider, ConnectWallet } from "@thirdweb-dev/react";
import { BaseSepolia } from "@thirdweb-dev/chains";

export default function Home() {
  return (
    <ThirdwebProvider 
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID} 
      activeChain={BaseSepolia}
    >
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Bike Marketplace</h1>
          <ConnectWallet />
        </div>

        <div className="space-y-8">
          <BikeList />
          <ListBikeForm />
          <UserProfile />
          <TransactionHistory />
        </div>
      </main>
    </ThirdwebProvider>
  );
}