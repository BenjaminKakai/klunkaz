'use client';

import { useState } from "react";
import { useContract, useContractWrite } from "@thirdweb-dev/react";

export function ListBikeForm() {
  // Connect to the deployed contract on localhost
  const { contract } = useContract("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  const { mutateAsync: listBike, isLoading } = useContractWrite(contract, "listBike");

  // Rest of the component remains the same...
  const [formData, setFormData] = useState({
    bikeBrand: "",
    bikeTitle: "",
    bikeSize: "",
    bikeColor: "",
    bikeFrame: "",
    bikeFork: "",
    bikeShock: "",
    category: "",
    bikeAddress: "",
    bikeFeatures: "",
    price: "",
    rentalPrice: "",
    listingType: "Sale", // "Sale" or "Rental"
    minRentalPeriod: "1",
    deposit: "",
  });

  // Image handling
  const [images, setImages] = useState<FileList | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImages(e.target.files);
      
      // Create preview URLs
      const urls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setImageUrls(urls);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Upload images to IPFS or your preferred storage solution
      const imageLinks = imageUrls.join(',');

      const bikeDetails = {
        bikeBrand: formData.bikeBrand,
        bikeTitle: formData.bikeTitle,
        bikeSize: formData.bikeSize,
        bikeColor: formData.bikeColor,
        bikeFrame: formData.bikeFrame,
        bikeFork: formData.bikeFork,
        bikeShock: formData.bikeShock,
      };

      const bikeMetadata = {
        category: formData.category,
        images: imageLinks,
        bikeAddress: formData.bikeAddress,
        bikeFeatures: formData.bikeFeatures,
        isStolen: false,
        isInsured: false,
        listingType: formData.listingType === "Sale" ? 0 : 1, // 0 for Sale, 1 for Rental
        rentalPrice: formData.listingType === "Rental" ? formData.rentalPrice : "0",
        isRented: false,
        currentRenter: "0x0000000000000000000000000000000000000000",
        rentalEndTime: 0,
      };

      await listBike({ args: [
        formData.price,
        bikeDetails,
        bikeMetadata,
        bikeMetadata.listingType,
        bikeMetadata.rentalPrice
      ]});

      // Reset form
      setFormData({
        bikeBrand: "",
        bikeTitle: "",
        bikeSize: "",
        bikeColor: "",
        bikeFrame: "",
        bikeFork: "",
        bikeShock: "",
        category: "",
        bikeAddress: "",
        bikeFeatures: "",
        price: "",
        rentalPrice: "",
        listingType: "Sale",
        minRentalPeriod: "1",
        deposit: "",
      });
      setImages(null);
      setImageUrls([]);

    } catch (error) {
      console.error("Error listing bike:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">List Your Bike</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Listing Type Selection */}
        <div>
          <label className="block mb-2 font-medium">Listing Type</label>
          <select
            name="listingType"
            value={formData.listingType}
            onChange={handleInputChange}
            className="border p-2 rounded w-full"
          >
            <option value="Sale">For Sale</option>
            <option value="Rental">For Rent</option>
          </select>
        </div>

        {/* Basic Bike Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">Brand</label>
            <input
              type="text"
              name="bikeBrand"
              value={formData.bikeBrand}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Model/Title</label>
            <input
              type="text"
              name="bikeTitle"
              value={formData.bikeTitle}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
              required
            />
          </div>
        </div>

        {/* Bike Specifications */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">Size</label>
            <input
              type="text"
              name="bikeSize"
              value={formData.bikeSize}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Color</label>
            <input
              type="text"
              name="bikeColor"
              value={formData.bikeColor}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        {/* Components */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 font-medium">Frame</label>
            <input
              type="text"
              name="bikeFrame"
              value={formData.bikeFrame}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Fork</label>
            <input
              type="text"
              name="bikeFork"
              value={formData.bikeFork}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Shock</label>
            <input
              type="text"
              name="bikeShock"
              value={formData.bikeShock}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        {/* Category and Features */}
        <div>
          <label className="block mb-2 font-medium">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="border p-2 rounded w-full"
            required
          >
            <option value="">Select category</option>
            <option value="Mountain">Mountain Bike</option>
            <option value="Road">Road Bike</option>
            <option value="Urban">Urban/Commuter</option>
            <option value="Electric">Electric Bike</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Features & Specifications</label>
          <textarea
            name="bikeFeatures"
            value={formData.bikeFeatures}
            onChange={handleInputChange}
            className="border p-2 rounded w-full h-24"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block mb-2 font-medium">Location</label>
          <input
            type="text"
            name="bikeAddress"
            value={formData.bikeAddress}
            onChange={handleInputChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">
              {formData.listingType === "Sale" ? "Sale Price (ETH)" : "Security Deposit (ETH)"}
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
              required
              min="0"
              step="0.001"
            />
          </div>
          {formData.listingType === "Rental" && (
            <div>
              <label className="block mb-2 font-medium">Daily Rental Rate (ETH)</label>
              <input
                type="number"
                name="rentalPrice"
                value={formData.rentalPrice}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
                required
                min="0"
                step="0.001"
              />
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block mb-2 font-medium">Upload Images</label>
          <input
            type="file"
            onChange={handleImageUpload}
            multiple
            accept="image/*"
            className="border p-2 rounded w-full"
          />
          <div className="mt-2 grid grid-cols-4 gap-2">
            {imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-24 h-24 object-cover rounded"
              />
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 w-full"
        >
          {isLoading ? "Listing..." : "List Bike"}
        </button>
      </form>
    </div>
  );
}