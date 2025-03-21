import { Plane, Clock, MapPin } from 'lucide-react';

interface FlightResultProps {
  origin: string;
  destination: string;
  date: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
}

export function FlightResult({ origin, destination, date, flightNumber, departureTime, arrivalTime }: FlightResultProps) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 rounded-xl shadow-lg">
      <div className="flex items-center gap-4">
        <div className="bg-white dark:bg-green-900/50 p-3 rounded-full">
          <Plane className="w-12 h-12 text-green-500" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-green-900 dark:text-green-100">
            Flight {flightNumber}
          </h3>
          <p className="text-green-700 dark:text-green-300">
            {date}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-4 bg-white dark:bg-green-900/50 rounded-lg">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <MapPin className="w-5 h-5" />
            <span>From: {origin}</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-green-800 dark:text-green-200">
            <Clock className="w-5 h-5" />
            <span>Departure: {departureTime}</span>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-green-900/50 rounded-lg">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <MapPin className="w-5 h-5" />
            <span>To: {destination}</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-green-800 dark:text-green-200">
            <Clock className="w-5 h-5" />
            <span>Arrival: {arrivalTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 