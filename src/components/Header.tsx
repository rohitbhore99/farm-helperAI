import { MapPin, Cloud } from "lucide-react";

interface HeaderProps {
  location?: {
    city: string;
    temperature: number;
    condition: string;
    humidity: number;
  };
}

const Header = ({ location }: HeaderProps) => {
  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div>
          <h1 className="font-bold text-lg text-foreground leading-tight">
            Farm Helper AI
          </h1>
          <p className="text-xs text-muted-foreground">Farming Assistant</p>
        </div>

        {location && location.city !== "Unknown" && (
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin size={14} />
              <span>{location.city}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Cloud size={14} />
              <span className="font-medium text-foreground">{location.temperature}°C</span>
              <span>{location.condition}</span>
            </div>
            <div className="text-muted-foreground">
              <span>💧 {location.humidity}%</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
