// src/components/BikeList.tsx
import { useContract, useContractRead } from "@thirdweb-dev/react";

export function BikeList() {
  const { contract } = useContract("YOUR_CONTRACT_ADDRESS");
  const { data: bikes, isLoading } = useContractRead(contract, "getAllBikes");

  if (isLoading) return <div>Loading bikes...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Available Bikes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bikes?.map((bike: any, index: number) => (
          <div key={index} className="border p-4 rounded">
            <h3 className="font-bold">{bike.name}</h3>
            <p>Price: {bike.price} ETH</p>
          </div>
        ))}
      </div>
    </div>
  );
}