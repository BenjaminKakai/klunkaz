// src/components/Navigation.tsx
'use client';

import Link from 'next/link';
import { ConnectWallet } from "@thirdweb-dev/react";

export function Navigation() {
  return (
    <nav className="container mx-auto px-4 py-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Link href="/" className="text-lg font-bold">
            Home
          </Link>
          <Link href="/list-bike" className="text-lg">
            List Bike
          </Link>
          <Link href="/profile" className="text-lg">
            Profile
          </Link>
          <Link href="/transactions" className="text-lg">
            Transactions
          </Link>
        </div>
        <ConnectWallet />
      </div>
    </nav>
  );
}