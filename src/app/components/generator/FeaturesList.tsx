"use client";
import { motion } from "framer-motion";
import { Zap, Database, Shield, Rocket, Sparkles } from "lucide-react";

interface EmptyStateProps {
  isDark: boolean;
  textPrimary: string;
  textSecondary: string;
}

const FeaturesList = ({ isDark, textSecondary }: EmptyStateProps) => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate complex datasets in seconds with AI",
    },
    {
      icon: Database,
      title: "Any Data Type",
      description: "From user profiles to product catalogs",
    },
    {
      icon: Shield,
      title: "No Signup Required",
      description: "Start generating immediately, zero friction",
    },
    {
      icon: Rocket,
      title: "Optional Live APIs",
      description: "Convert to REST endpoints when you need them",
    },
  ];

  return (
    <motion.div
      key="features"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`${isDark ? "bg-gray-900" : "bg-white"} border ${
        isDark ? "border-gray-800" : "border-gray-200"
      } rounded-2xl p-8 shadow-xl`}
    >
      <div className="text-center mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-block p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        <h3 className="text-xl font-bold mb-2">Generating Your Data...</h3>
        <p className={`text-sm ${textSecondary}`}>
          This will only take a moment
        </p>
      </div>

      <div className="space-y-6">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`flex gap-4 p-4 ${
                isDark ? "bg-gray-800/50" : "bg-gray-50"
              } rounded-xl`}
            >
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Icon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">{feature.title}</h4>
                <p className={`text-sm ${textSecondary}`}>
                  {feature.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default FeaturesList;
