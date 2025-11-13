import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export const AdaptiveSkeleton = ({
  category,
  textSecondary,
  cardBg,
  borderColor,
}: any) => {
  const renderSkeletons = () => {
    switch (category) {
      case "users":
        return (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="space-y-2 border-b pb-3 border-gray-700/30"
              >
                <Skeleton className="h-4 w-1/3 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
                <Skeleton className="h-4 w-2/3 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
                <Skeleton className="h-4 w-1/2 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
              </div>
            ))}
          </div>
        );
      case "products":
        return (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-gray-700/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 space-y-2"
              >
                <Skeleton className="h-24 w-full rounded-md bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
                <Skeleton className="h-4 w-2/3 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
                <Skeleton className="h-4 w-1/2 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
              </div>
            ))}
          </div>
        );
      case "locations":
        return (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-1/3 bg-gradient-to-r from-green-500/10 to-emerald-500/10" />
                <Skeleton className="h-4 w-2/3 bg-gradient-to-r from-green-500/10 to-emerald-500/10" />
              </div>
            ))}
          </div>
        );
      case "api":
      default:
        return (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-4 w-[80%] bg-gradient-to-r from-purple-500/10 to-pink-500/10"
              />
            ))}
          </div>
        );
    }
  };

  return (
    <motion.div
      key="adaptive-skeleton"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`${cardBg} border ${borderColor} rounded-2xl p-8 shadow-xl`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
        </div>
        <div>
          <h3 className="text-xl font-bold">Generating {category} data...</h3>
          <p className={`text-sm ${textSecondary}`}>
            AI is creating structured {category} JSON data. Please wait...
          </p>
        </div>
      </div>

      {renderSkeletons()}

      {/* Animated Dots */}
      <div className="mt-10 flex items-center gap-3 justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="h-3 w-3 bg-purple-500 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
          className="h-3 w-3 bg-pink-500 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4,
          }}
          className="h-3 w-3 bg-purple-500 rounded-full"
        />
      </div>
    </motion.div>
  );
};
