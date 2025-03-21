import { Car, MapPin, Clock, DollarSign } from 'lucide-react';

interface TaxiResultProps {
  pickupLocation: string;
  dropoffLocation: string;
  estimatedTime: string;
  price: string;
  driverName: string;
  carType: string;
  licensePlate: string;
}

export function TaxiResult({ pickupLocation, dropoffLocation, estimatedTime, price, driverName, carType, licensePlate }: TaxiResultProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-xl shadow-lg">
      <div className="flex items-center gap-4">
        <div className="bg-white dark:bg-blue-900/50 p-3 rounded-full">
          <Car className="w-12 h-12 text-blue-500" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
            Taxi Booking Confirmed
          </h3>
          <p className="text-blue-700 dark:text-blue-300">
            Driver: {driverName}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-4">
        <div className="p-4 bg-white dark:bg-blue-900/50 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <MapPin className="w-5 h-5" />
            <span>Pickup: {pickupLocation}</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-blue-800 dark:text-blue-200">
            <MapPin className="w-5 h-5" />
            <span>Dropoff: {dropoffLocation}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-blue-900/50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Clock className="w-5 h-5" />
              <span>ETA: {estimatedTime}</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-blue-800 dark:text-blue-200">
              <DollarSign className="w-5 h-5" />
              <span>Price: {price}</span>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-blue-900/50 rounded-lg">
            <div className="text-blue-800 dark:text-blue-200">
              <p>Car Type: {carType}</p>
              <p className="mt-2">License Plate: {licensePlate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 