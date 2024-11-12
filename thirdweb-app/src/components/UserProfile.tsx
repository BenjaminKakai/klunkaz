// src/components/UserProfile.tsx
import { useAddress, useContract, useContractRead } from "@thirdweb-dev/react";

export function UserProfile() {
  const address = useAddress();
  const { contract } = useContract("YOUR_CONTRACT_ADDRESS");
  const { data: userBikes } = useContractRead(contract, "getUserBikes", [address]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
      <p>Address: {address}</p>
      <h3 className="text-xl font-bold mt-4 mb-2">Your Listed Bikes</h3>
      <div className="grid grid-cols-1 gap-4">
        {userBikes?.map((bike: any, index: number) => (
          <div key={index} className="border p-4 rounded">
            <p>Bike Name: {bike.name}</p>
            <p>Price: {bike.price} ETH</p>
          </div>
        ))}
      </div>
    </div>
  );
}