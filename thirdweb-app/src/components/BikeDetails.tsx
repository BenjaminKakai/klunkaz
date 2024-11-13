import React, { useState } from 'react';
import { useContract, useContractRead, useContractWrite, useAddress } from "@thirdweb-dev/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, User, Calendar, Star, MessageSquare, Clock, Tag } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function BikeDetails({ bikeId }: { bikeId?: string }) {
  const address = useAddress();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [review, setReview] = useState({ rating: 0, comment: "" });
  const [showRental, setShowRental] = useState(false);
  const [rentalDays, setRentalDays] = useState(1);

  const { contract } = useContract("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  const { data: bike, isLoading } = useContractRead(contract, "getBikeById", [bikeId]);
  const { data: reviews } = useContractRead(contract, "getBikeReviews", [bikeId]);
  const { mutateAsync: submitReview } = useContractWrite(contract, "submitReview");
  const { mutateAsync: purchaseBike } = useContractWrite(contract, "purchaseBike");
  const { mutateAsync: rentBike } = useContractWrite(contract, "rentBike");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!bike) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Bike not found</AlertDescription>
      </Alert>
    );
  }

  const handlePurchase = async () => {
    try {
      await purchaseBike({ args: [bikeId], value: bike.price });
    } catch (error) {
      console.error("Purchase failed:", error);
    }
  };

  const handleRent = async () => {
    try {
      const totalPrice = parseFloat(bike.metadata.rentalPrice) * rentalDays;
      await rentBike({ args: [bikeId, rentalDays], value: totalPrice.toString() });
    } catch (error) {
      console.error("Rental failed:", error);
    }
  };

  const handleReviewSubmit = async () => {
    try {
      await submitReview({ args: [bikeId, review.rating, review.comment] });
      setReview({ rating: 0, comment: "" });
    } catch (error) {
      console.error("Review submission failed:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image Gallery */}
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <img
              src={bike.metadata.images.split(',')[activeImageIndex] || "/api/placeholder/800/600"}
              alt={bike.details.bikeTitle}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {bike.metadata.images.split(',').map((image: string, index: number) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`aspect-video rounded-lg overflow-hidden border-2 ${
                  activeImageIndex === index ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <img src={image} alt={`Thumbnail ${index + 1}`} className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
        </div>

        {/* Bike Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{bike.details.bikeBrand} {bike.details.bikeTitle}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                {bike.metadata.bikeAddress}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">
                    {bike.metadata.listingType === 0 ? 
                      `${bike.price} ETH` : 
                      `${bike.metadata.rentalPrice} ETH/day`
                    }
                  </span>
                  <Tag className="w-5 h-5 text-gray-500" />
                </div>

                {bike.metadata.listingType === 0 ? (
                  <Button onClick={handlePurchase} className="w-full">
                    Purchase Bike
                  </Button>
                ) : (
                  <>
                    <Button onClick={() => setShowRental(!showRental)} className="w-full">
                      Rent Bike
                    </Button>
                    {showRental && (
                      <div className="space-y-2">
                        <input
                          type="number"
                          min="1"
                          value={rentalDays}
                          onChange={(e) => setRentalDays(parseInt(e.target.value))}
                          className="w-full p-2 border rounded"
                        />
                        <Button onClick={handleRent} className="w-full">
                          Confirm Rental ({(parseFloat(bike.metadata.rentalPrice) * rentalDays).toFixed(3)} ETH)
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Owner Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-mono">{bike.owner.slice(0, 6)}...{bike.owner.slice(-4)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="specs">
          <TabsList>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="specs">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Frame</h3>
                    <p>{bike.details.bikeFrame}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Fork</h3>
                    <p>{bike.details.bikeFork}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Size</h3>
                    <p>{bike.details.bikeSize}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Color</h3>
                    <p>{bike.details.bikeColor}</p>
                  </div>
                  {bike.details.bikeShock && (
                    <div>
                      <h3 className="font-semibold">Shock</h3>
                      <p>{bike.details.bikeShock}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  {bike.metadata.bikeFeatures.split(',').map((feature: string, index: number) => (
                    <span
                      key={index}
                      className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                    >
                      {feature.trim()}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardContent className="p-6 space-y-6">
                {address && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReview(prev => ({ ...prev, rating: star }))}
                          className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                        >
                          <Star className="w-6 h-6" />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={review.comment}
                      onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Write your review..."
                      className="w-full p-2 border rounded"
                      rows={3}
                    />
                    <Button onClick={handleReviewSubmit}>Submit Review</Button>
                  </div>
                )}

                <div className="space-y-4">
                  {reviews?.map((review: any, index: number) => (
                    <div key={index} className="border rounded p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="font-mono text-sm">
                            {review.reviewer.slice(0, 6)}...{review.reviewer.slice(-4)}
                          </span>
                        </div>
                        <div className="flex text-yellow-400">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4" fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default BikeDetails;