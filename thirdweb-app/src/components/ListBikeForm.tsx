'use client';

import { useState } from "react";
import { useContract, useContractWrite } from "@thirdweb-dev/react";

export function ListBikeForm() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const { contract } = useContract("YOUR_CONTRACT_ADDRESS");
  const { mutateAsync: listBike, isLoading } = useContractWrite(contract, "listBike");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await listBike({ args: [name, price] });
      setName("");
      setPrice("");
    } catch (error) {
      console.error("Error listing bike:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">List Your Bike</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Bike Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block mb-2">Price (ETH)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isLoading ? "Listing..." : "List Bike"}
        </button>
      </form>
    </div>
  );
}
