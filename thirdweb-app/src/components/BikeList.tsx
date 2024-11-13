'use client';

import { useState } from "react";
import { useContract, useContractRead } from "@thirdweb-dev/react";
import { useRouter } from "next/navigation"; // Changed from next/router
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Bike {
  id: string;
  name: string;
  price: string;
  type: 'rent' | 'sale';
  imageUrl: string;
  location: string;
  features: string[];
  isAvailable: boolean;
  rentalRate?: string;
}

export function BikeList() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<'all' | 'rent' | 'sale'>('all');
  const { contract } = useContract("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  const { data: bikes, isLoading } = useContractRead(contract, "getAllBikes");

  // Filter bikes based on type
  const filteredBikes = bikes?.filter((bike: Bike) => {
    if (activeFilter === 'all') return true;
    return bike.type === activeFilter;
  }) || []; // Added fallback empty array

  // Separate bikes by type
  const rentalBikes = bikes?.filter((bike: Bike) => bike.type === 'rent') || [];
  const saleBikes = bikes?.filter((bike: Bike) => bike.type === 'sale') || [];

  const handleViewDetails = (bikeId: string) => {
    router.push(`/bikes/${bikeId}`);
  };

  const BikeCard = ({ bike }: { bike: Bike }) => (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-video relative">
        <img
          src={bike.imageUrl || "/api/placeholder/400/300"}
          alt={bike.name}
          className="object-cover w-full h-full"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
            bike.type === 'rent' ? 'bg-blue-500' : 'bg-green-500'
          }`}>
            {bike.type === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>
      </div>
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold">{bike.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{bike.location}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            {bike.type === 'rent' ? (
              <p className="text-lg font-semibold text-primary">{bike.rentalRate} ETH/day</p>
            ) : (
              <p className="text-lg font-semibold text-primary">{bike.price} ETH</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {bike.features?.slice(0, 3).map((feature, index) => (
              <span 
                key={index}
                className="bg-secondary px-2.5 py-0.5 rounded-full text-xs font-medium text-secondary-foreground"
              >
                {feature}
              </span>
            ))}
          </div>
          <Button 
            onClick={() => handleViewDetails(bike.id)}
            className="w-full"
            variant="secondary"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Available Bikes</h2>
        <div className="flex gap-2">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('all')}
          >
            All
          </Button>
          <Button
            variant={activeFilter === 'rent' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('rent')}
          >
            For Rent
          </Button>
          <Button
            variant={activeFilter === 'sale' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('sale')}
          >
            For Sale
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="all">All Bikes</TabsTrigger>
          <TabsTrigger value="rent">Rental Bikes</TabsTrigger>
          <TabsTrigger value="sale">Bikes for Sale</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBikes.map((bike: Bike) => (
              <BikeCard key={bike.id} bike={bike} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rent">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentalBikes.map((bike: Bike) => (
              <BikeCard key={bike.id} bike={bike} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sale">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {saleBikes.map((bike: Bike) => (
              <BikeCard key={bike.id} bike={bike} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BikeList;
