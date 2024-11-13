'use client';

import React, { useState, useMemo } from 'react';
import { useContract, useContractRead, useAddress } from "@thirdweb-dev/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Tag,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  XCircle,
  Clock3,
  Bike
} from "lucide-react";

interface Transaction {
  id: string;
  type: 'purchase' | 'rental' | 'return';
  amount: string;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
  bikeId: string;
  buyer: string;
  seller: string;
  duration?: number;
}

export function TransactionHistory() {
  const address = useAddress();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTimeRange, setFilterTimeRange] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all');

  const { contract } = useContract("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  const { data: transactions, isLoading } = useContractRead(contract, "getTransactionHistory");
  const { data: bikeDetails } = useContractRead(contract, "getAllBikes");

  const bikeMap = useMemo(() => {
    if (!bikeDetails) return {};
    return bikeDetails.reduce((acc: any, bike: any) => {
      acc[bike.id] = bike;
      return acc;
    }, {});
  }, [bikeDetails]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock3 className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <Tag className="h-4 w-4" />;
      case 'rental':
        return <ArrowUpRight className="h-4 w-4" />;
      case 'return':
        return <ArrowDownLeft className="h-4 w-4" />;
      default:
        return <Bike className="h-4 w-4" />;
    }
  };

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    return transactions.filter((tx: Transaction) => {
      const typeMatch = filterType === 'all' || tx.type === filterType;
      const statusMatch = filterStatus === 'all' || tx.status === filterStatus;
      
      const now = Date.now();
      const txTime = tx.timestamp * 1000;
      const timeMatch = filterTimeRange === 'all' ||
        (filterTimeRange === 'day' && now - txTime <= 86400000) ||
        (filterTimeRange === 'week' && now - txTime <= 604800000) ||
        (filterTimeRange === 'month' && now - txTime <= 2592000000);

      const tabMatch = activeTab === 'all' ||
        (activeTab === 'sent' && tx.buyer === address) ||
        (activeTab === 'received' && tx.seller === address);

      return typeMatch && statusMatch && timeMatch && tabMatch;
    });
  }, [transactions, filterType, filterStatus, filterTimeRange, activeTab, address]);

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Transaction History</CardTitle>
            <div className="flex gap-2">
              <Select value={filterTimeRange} onValueChange={setFilterTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="day">Last 24h</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="purchase">Purchases</SelectItem>
                  <SelectItem value="rental">Rentals</SelectItem>
                  <SelectItem value="return">Returns</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">All Transactions</TabsTrigger>
              <TabsTrigger value="sent" className="flex-1">Sent</TabsTrigger>
              <TabsTrigger value="received" className="flex-1">Received</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="space-y-4">
                {filteredTransactions.map((tx: Transaction) => {
                  const bike = bikeMap[tx.bikeId];
                  return (
                    <div key={tx.id} className="rounded-lg border p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(tx.type)}
                          <div>
                            <h3 className="font-semibold">
                              {bike ? `${bike.details.bikeBrand} ${bike.details.bikeTitle}` : `Bike #${tx.bikeId}`}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                              {tx.type === 'rental' && tx.duration && ` (${tx.duration} days)`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(tx.status)}
                          <span className="font-mono text-lg">{tx.amount} ETH</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(tx.timestamp * 1000).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(tx.timestamp * 1000).toLocaleTimeString()}
                        </div>
                      </div>

                      <div className="mt-2 flex gap-2 text-xs">
                        <span className="text-gray-500">From:</span>
                        <span className="font-mono">{tx.seller.slice(0, 6)}...{tx.seller.slice(-4)}</span>
                        <span className="text-gray-500">To:</span>
                        <span className="font-mono">{tx.buyer.slice(0, 6)}...{tx.buyer.slice(-4)}</span>
                      </div>
                    </div>
                  );
                })}

                {filteredTransactions.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    No transactions found
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default TransactionHistory;