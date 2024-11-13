import React, { useState } from 'react';
import { useAddress, useContract, useContractRead, useConnectionStatus } from "@thirdweb-dev/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Wallet, Bike, History, User } from "lucide-react";

const UserProfile = () => {
  const address = useAddress();
  const connectionStatus = useConnectionStatus();
  const { contract } = useContract("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  
  // Contract reads
  const { data: bikes } = useContractRead(contract, "getAllBikes");
  const { data: reviews } = useContractRead(contract, "getUserReviews", [address]);
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    location: "",
    bio: ""
  });

  // Filter user's bikes
  const userBikes = bikes?.filter((bike: any) => bike.owner === address) || [];
  const rentalBikes = userBikes.filter((bike: any) => bike.metadata.listingType === 1);
  const saleBikes = userBikes.filter((bike: any) => bike.metadata.listingType === 0);

  // Handle profile update
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement profile update logic
    console.log("Profile updated:", profileData);
  };

  if (connectionStatus !== "connected") {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardContent className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-4">Please connect your wallet to view your profile</p>
          {/* Wallet connection button would be handled by your web3 provider */}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <p className="text-sm">{profileData.location || "No location set"}</p>
              </div>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <Input
                  placeholder="Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                />
                <Input
                  placeholder="Location"
                  value={profileData.location}
                  onChange={(e) => setProfileData(prev => ({...prev, location: e.target.value}))}
                />
                <Button type="submit" className="w-full">Update Profile</Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="bikes" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="bikes" className="flex-1">
                <Bike className="w-4 h-4 mr-2" />
                My Bikes
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1">
                <History className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bikes">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Bikes for Sale ({saleBikes.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {saleBikes.map((bike: any, index: number) => (
                        <div key={index} className="border rounded p-4">
                          <p className="font-semibold">{bike.details.bikeBrand} {bike.details.bikeTitle}</p>
                          <p className="text-sm text-gray-600">{bike.price} ETH</p>
                          <div className="flex gap-2 mt-2">
                            {bike.metadata.bikeFeatures.split(',').slice(0, 2).map((feature: string, i: number) => (
                              <span key={i} className="bg-gray-100 text-xs px-2 py-1 rounded">
                                {feature.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Bikes for Rent ({rentalBikes.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {rentalBikes.map((bike: any, index: number) => (
                        <div key={index} className="border rounded p-4">
                          <p className="font-semibold">{bike.details.bikeBrand} {bike.details.bikeTitle}</p>
                          <p className="text-sm text-gray-600">{bike.metadata.rentalPrice} ETH/day</p>
                          <div className="flex gap-2 mt-2">
                            {bike.metadata.bikeFeatures.split(',').slice(0, 2).map((feature: string, i: number) => (
                              <span key={i} className="bg-gray-100 text-xs px-2 py-1 rounded">
                                {feature.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews?.map((review: any, index: number) => (
                      <div key={index} className="border rounded p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">Review for Bike #{review.productId}</p>
                            <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(review.timestamp * 1000).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;