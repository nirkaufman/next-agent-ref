import ReactDOMServer from 'react-dom/server';
import { WeatherResult } from '@/app/components/WeatherResult';
import { FlightResult } from '@/app/components/FlightResult';
import { AttractionResult } from '@/app/components/AttractionResult';
import { TaxiResult } from '@/app/components/TaxiResult';
import { HotelResult } from '@/app/components/HotelResult';

export const renderMessageContent = (content: string) => {
  // First handle the special tags for agent steps
  let html = content
    .replace(/<thought>(.*?)<\/thought>/gs, '<div class="my-3 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg text-blue-700 dark:text-blue-300"><div class="flex items-center gap-2"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg><span>Thought: $1</span></div></div>')
    .replace(/<action>(.*?)<\/action>/gs, '<div class="my-3 bg-green-50 dark:bg-green-900/30 p-4 rounded-lg text-green-700 dark:text-green-300"><div class="flex items-center gap-2"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg><span>Action: $1</span></div></div>')
    .replace(/<result>(.*?)<\/result>/gs, '<div class="my-3 bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg text-purple-700 dark:text-purple-300"><div class="flex items-center gap-2"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>Result: $1</span></div></div>')
    .replace(/<next>(.*?)<\/next>/gs, '<div class="my-3 bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg text-orange-700 dark:text-orange-300"><div class="flex items-center gap-2"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg><span>Next: $1</span></div></div>');

  // Then handle regular HTML elements
  html = html
    .replace(/<h3>(.*?)<\/h3>/g, '<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2">$1</h3>')
    .replace(/<ul>(.*?)<\/ul>/gs, '<ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">$1</ul>')
    .replace(/<li>(.*?)<\/li>/g, '<li class="text-gray-700 dark:text-gray-300">$1</li>')
    .replace(/<p>(.*?)<\/p>/g, '<p class="text-gray-700 dark:text-gray-300">$1</p>')
    .replace(/<strong>(.*?)<\/strong>/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')
    .replace(/<em>(.*?)<\/em>/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>')
    .replace(/<div class="space-y-2">(.*?)<\/div>/gs, '<div class="space-y-2">$1</div>');

  // Handle special result components
  const weatherMatch = html.match(/<weather-result>(.*?)<\/weather-result>/s);
  if (weatherMatch) {
    try {
      const weatherData = JSON.parse(weatherMatch[1]);
      html = html.replace(/<weather-result>.*?<\/weather-result>/s, `<div class="my-4">${ReactDOMServer.renderToString(<WeatherResult {...weatherData} />)}</div>`);
    } catch (e) {
      console.error('Failed to parse weather result:', e);
    }
  }

  const flightMatch = html.match(/<flight-result>(.*?)<\/flight-result>/s);
  if (flightMatch) {
    try {
      const flightData = JSON.parse(flightMatch[1]);
      html = html.replace(/<flight-result>.*?<\/flight-result>/s, `<div class="my-4">${ReactDOMServer.renderToString(<FlightResult {...flightData} />)}</div>`);
    } catch (e) {
      console.error('Failed to parse flight result:', e);
    }
  }

  const attractionMatch = html.match(/<attraction-result>(.*?)<\/attraction-result>/s);
  if (attractionMatch) {
    try {
      const attractionData = JSON.parse(attractionMatch[1]);
      html = html.replace(/<attraction-result>.*?<\/attraction-result>/s, `<div class="my-4">${ReactDOMServer.renderToString(<AttractionResult {...attractionData} />)}</div>`);
    } catch (e) {
      console.error('Failed to parse attraction result:', e);
    }
  }

  const taxiMatch = html.match(/<taxi-result>(.*?)<\/taxi-result>/s);
  if (taxiMatch) {
    try {
      const taxiData = JSON.parse(taxiMatch[1]);
      html = html.replace(/<taxi-result>.*?<\/taxi-result>/s, `<div class="my-4">${ReactDOMServer.renderToString(<TaxiResult {...taxiData} />)}</div>`);
    } catch (e) {
      console.error('Failed to parse taxi result:', e);
    }
  }

  const hotelMatch = html.match(/<hotel-result>(.*?)<\/hotel-result>/s);
  if (hotelMatch) {
    try {
      const hotelData = JSON.parse(hotelMatch[1]);
      html = html.replace(/<hotel-result>.*?<\/hotel-result>/s, `<div class="my-4">${ReactDOMServer.renderToString(<HotelResult {...hotelData} />)}</div>`);
    } catch (e) {
      console.error('Failed to parse hotel result:', e);
    }
  }

  return html;
};
