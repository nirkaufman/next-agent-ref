import { Hotel, MapPin, Star, DollarSign, Calendar } from 'lucide-react';

interface HotelResultProps {
  name: string;
  location: string;
  rating: number;
  price: string;
  checkIn: string;
  checkOut: string;
  amenities: string[];
  imageUrl?: string;
}

export function HotelResult({ name, location, rating, price, checkIn, checkOut, amenities, imageUrl }: HotelResultProps) {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-6 rounded-xl shadow-lg">
      <div className="flex items-center gap-4">
        <div className="bg-white dark:bg-orange-900/50 p-3 rounded-full">
          <Hotel className="w-12 h-12 text-orange-500" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100">
            {name}
          </h3>
          <p className="text-orange-700 dark:text-orange-300">
            {location}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-orange-900/50 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <Star className="w-5 h-5" />
              <span>Rating: {rating}/5</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-orange-800 dark:text-orange-200">
              <DollarSign className="w-5 h-5" />
              <span>Price: {price}</span>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-orange-900/50 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <Calendar className="w-5 h-5" />
              <span>Check-in: {checkIn}</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-orange-800 dark:text-orange-200">
              <Calendar className="w-5 h-5" />
              <span>Check-out: {checkOut}</span>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-orange-900/50 rounded-lg">
          <h4 className="text-orange-800 dark:text-orange-200 font-semibold mb-2">Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {amenities.map((amenity, index) => (
              <span key={index} className="px-3 py-1 bg-orange-100 dark:bg-orange-800/50 text-orange-700 dark:text-orange-300 rounded-full text-sm">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 