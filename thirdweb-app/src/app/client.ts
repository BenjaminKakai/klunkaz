// src/app/client.ts
import { createThirdwebClient } from "thirdweb";

// Base Sepolia chain ID is 84532
const BASE_SEPOLIA_CHAIN_ID = 84532;

if (!process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID) {
  throw new Error("No client ID provided");
}

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  chainId: BASE_SEPOLIA_CHAIN_ID
});