import { Leaf, Sprout, Sun, Droplets, MapPin, Cloud } from "lucide-react";
import QuickActions from "./QuickActions";

interface WelcomeScreenProps {
  onQuickAction: (message: string) => void;
  location?: {
    city: string;
    temperature: number;
    condition: string;
    humidity: number;
  };
}

const WelcomeScreen = ({ onQuickAction, location }: WelcomeScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-8 text-center animate-fade-in">
      {/* Logo and Title */}
      <div className="mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Sprout className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Farm Helper AI
        </h1>
        <p className="text-lg text-muted-foreground">
          Your Farming Assistant
        </p>

        {/* Location and Weather Info */}
        {location && location.city !== "Unknown" && (
          <div className="flex items-center justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin size={16} />
              <span className="font-medium text-foreground">{location.city}</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Cloud size={16} />
              <span className="font-medium text-foreground">{location.temperature}°C</span>
              <span>{location.condition}</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <div className="text-muted-foreground">
              <span>💧 {location.humidity}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-md">
        <div className="flex flex-col items-center gap-2 p-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-green-600" />
          </div>
          <span className="text-sm font-medium text-foreground">Crop Tips</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <Sun className="w-6 h-6 text-yellow-500" />
          </div>
          <span className="text-sm font-medium text-foreground">Weather</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-4">
          <div className="w-12 h-12 rounded-full bg-sky/10 flex items-center justify-center">
            <Droplets className="w-6 h-6 text-sky" />
          </div>
          <span className="text-sm font-medium text-foreground">Irrigation</span>
        </div>
      </div>

      {/* Welcome message */}
      <div className="bg-card rounded-2xl p-5 mb-8 max-w-md border border-border shadow-sm">
        <p className="text-foreground leading-relaxed">
          Namaste! I am your farming assistant. I can help you with crop selection, 
          weather advice, pest control, and more. Ask me anything about farming!
        </p>
      </div>

      {/* Quick Actions */}
      <div className="w-full max-w-lg">
        <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
        <QuickActions onSelect={onQuickAction} />
      </div>
    </div>
  );
};

export default WelcomeScreen;
