import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Delivery, Order } from '@shared/schema';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';

interface DeliveryMapProps {
  delivery?: Delivery;
  order?: Order;
}

export default function DeliveryMap({ delivery, order }: DeliveryMapProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // In a real application, this would use a proper mapping service API
  // like Google Maps, Mapbox, etc. For this project, we'll display a placeholder
  // that simulates a map interface

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setIsMapLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (mapError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{mapError}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          Delivery Route
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isMapLoaded ? (
          <div className="h-80 bg-muted animate-pulse flex items-center justify-center">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        ) : (
          <div className="relative">
            <div className="h-80 bg-neutral-200 rounded-md overflow-hidden">
              {/* Simulated map view */}
              <div className="w-full h-full bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/0,0,1,0,0/600x400?access_token=placeholder')] bg-cover bg-center flex items-center justify-center">
                <div className="bg-white/90 p-4 rounded-lg shadow-md">
                  <p className="text-center font-medium mb-2">Interactive Map</p>
                  <p className="text-sm text-muted-foreground mb-3 text-center">
                    A real delivery route would be displayed here
                  </p>
                  
                  {order && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Delivery Address:</p>
                        <p>{order.deliveryAddress}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Map controls - these would be functional in a real app */}
            <div className="absolute top-4 right-4 bg-white shadow-md rounded-md p-2 flex flex-col gap-2">
              <button className="p-2 hover:bg-muted rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </button>
              <button className="p-2 hover:bg-muted rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {delivery && order && (
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-md">
                <p className="text-sm font-medium">Estimated Distance</p>
                <p className="text-lg font-bold">3.2 miles</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-md">
                <p className="text-sm font-medium">Estimated Time</p>
                <p className="text-lg font-bold">15 mins</p>
              </div>
            </div>
            
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm font-medium mb-1">Route Information</p>
              <ol className="text-sm space-y-1 pl-5 list-decimal">
                <li>Head north on Farm Road</li>
                <li>Turn right onto Main Street</li>
                <li>Continue for 1.2 miles</li>
                <li>Turn left onto Harvest Lane</li>
                <li>Destination will be on your right</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
