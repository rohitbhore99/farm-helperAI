import { Sprout, CloudRain, Bug, FlaskConical } from "lucide-react";

interface QuickActionsProps {
  onSelect: (message: string) => void;
}

const quickActions = [
  {
    icon: Sprout,
    label: "Crop Advice",
    message: "Which crop should I grow this season?",
  },
  {
    icon: CloudRain,
    label: "Weather Tips",
    message: "How should I protect my crops from heavy rain?",
  },
  {
    icon: Bug,
    label: "Pest Help",
    message: "My crops have yellow spots on leaves. What should I do?",
  },
  {
    icon: FlaskConical,
    label: "Fertilizer",
    message: "What fertilizer should I use for wheat?",
  },
];

const QuickActions = ({ onSelect }: QuickActionsProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {quickActions.map((action) => (
        <button
          key={action.label}
          onClick={() => onSelect(action.message)}
          className="btn-quick-action"
        >
          <action.icon size={16} />
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
