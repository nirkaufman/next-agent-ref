import { MapPin, Star, Clock, DollarSign } from 'lucide-react';

interface AttractionResultProps {
  name: string;
  location: string;
  rating: number;
  description: string;
  openingHours: string;
  price: string;
  imageUrl?: string;
}

export function AttractionResult({ name, location, rating, description, openingHours, price, imageUrl }: AttractionResultProps) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-xl shadow-lg">
      <div className="flex items-center gap-4">
        <div className="bg-white dark:bg-purple-900/50 p-3 rounded-full">
          <MapPin className="w-12 h-12 text-purple-500" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100">
            {name}
          </h3>
          <p className="text-purple-700 dark:text-purple-300">
            {location}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-4">
        <div className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
          <Star className="w-5 h-5" />
          <span>Rating: {rating}/5</span>
        </div>
        <div className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
          <Clock className="w-5 h-5" />
          <span>Hours: {openingHours}</span>
        </div>
        <div className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
          <DollarSign className="w-5 h-5" />
          <span>Price: {price}</span>
        </div>
        <p className="text-purple-700 dark:text-purple-300 mt-2">
          {description}
        </p>
      </div>
    </div>
  );
} 