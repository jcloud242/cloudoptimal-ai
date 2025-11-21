import { FaAws, FaMicrosoft, FaGoogle } from "react-icons/fa";

export default function RecommendationCard({
  provider,
  architecture,
  reasoning,
}) {
  const providerConfig = {
    AWS: {
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
      icon: FaAws,
    },
    Azure: {
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
      icon: FaMicrosoft,
    },
    "Google Cloud": {
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
      icon: FaGoogle,
    },
    GCP: {
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
      icon: FaGoogle,
    },
  };

  const config = providerConfig[provider] || providerConfig.AWS;
  const IconComponent = config.icon;

  return (
    <div className={`${config.bgColor} border rounded-lg p-5 space-y-4 shadow-sm`}>
      <div className="flex items-center gap-3">
        <IconComponent className={`text-2xl ${config.color}`} />
        <div>
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Recommended Provider
          </p>
          <p className={`text-lg font-bold ${config.color}`}>{provider}</p>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
          Architecture
        </h3>
        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
          {architecture}
        </p>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
          Why This Choice
        </h4>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {reasoning}
        </p>
      </div>
    </div>
  );
}
