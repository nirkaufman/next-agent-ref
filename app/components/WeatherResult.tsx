import { Cloud, Sun, CloudRain, CloudSnow } from 'lucide-react';

interface WeatherResultProps {
  destination: string;
  month: string;
  forecast: string;
}

export function WeatherResult({ destination, month, forecast }: WeatherResultProps) {
  // Simple logic to determine weather icon based on forecast text
  const getWeatherIcon = (forecast: string) => {
    if (forecast.toLowerCase().includes('sunny')) return <Sun className="w-12 h-12 text-yellow-500" />;
    if (forecast.toLowerCase().includes('rain')) return <CloudRain className="w-12 h-12 text-blue-500" />;
    if (forecast.toLowerCase().includes('snow')) return <CloudSnow className="w-12 h-12 text-blue-300" />;
    return <Cloud className="w-12 h-12 text-gray-500" />;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-xl shadow-lg">
      <div className="flex items-center gap-4">
        <div className="bg-white dark:bg-blue-900/50 p-3 rounded-full">
          {getWeatherIcon(forecast)}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
            Weather in {destination}
          </h3>
          <p className="text-blue-700 dark:text-blue-300">
            {month}
          </p>
        </div>
      </div>
      <div className="mt-4 p-4 bg-white dark:bg-blue-900/50 rounded-lg">
        <p className="text-blue-800 dark:text-blue-200">
          {forecast}
        </p>
      </div>
    </div>
  );
} 