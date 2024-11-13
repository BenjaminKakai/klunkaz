// src/components/TransactionHistory.tsx
import { useContract, useContractRead } from "@thirdweb-dev/react";

export function TransactionHistory() {
  const { contract } = useContract("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  const { data: transactions } = useContractRead(contract, "getTransactionHistory");

  return 
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
      <div className="space-y-2">
        {transactions?.map((tx: any, index: number) => (
          <div key={index} className="border p-4 rounded">
            <p>Transaction ID: {tx.id}</p>
            <p>Type: {tx.type}</p>
            <p>Amount: {tx.amount} ETH</p>
          </div>
        ))}
      </div>
    </div>
  );
}