import { AlertTriangle, CheckCircle, Radio } from "lucide-react";

type AlertLevel = "advisory" | "warning" | "evacuation";

interface AlertBannerProps {
  level: AlertLevel;
  message: string;
  lastUpdated: string;
}

const alertConfig = {
  advisory: {
    icon: CheckCircle,
    label: "ADVISORY",
    className: "alert-banner-safe",
    description: "Normal conditions - Stay alert",
  },
  warning: {
    icon: AlertTriangle,
    label: "WARNING",
    className: "alert-banner-warning",
    description: "Elevated water levels - Prepare to evacuate",
  },
  evacuation: {
    icon: Radio,
    label: "EVACUATION",
    className: "alert-banner-danger",
    description: "Immediate evacuation required",
  },
};

const AlertBanner = ({ level, message, lastUpdated }: AlertBannerProps) => {
  const config = alertConfig[level];
  const Icon = config.icon;

  return (
    <div className={`${config.className} rounded-lg p-4 md:p-6`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-black/20">
            <Icon className="h-6 w-6 md:h-8 md:w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg md:text-xl tracking-wide">
                {config.label}
              </span>
              {level === "evacuation" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/20 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
            <p className="text-sm md:text-base opacity-90">{message}</p>
          </div>
        </div>
        <div className="text-xs md:text-sm opacity-75 font-medium">
          Last updated: {lastUpdated}
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;
