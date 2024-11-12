// src/components/BikeDetails.tsx
export function BikeDetails({ bikeId }: { bikeId?: string }) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Bike Details</h2>
        <p>Details for bike {bikeId}</p>
      </div>
    );
  }