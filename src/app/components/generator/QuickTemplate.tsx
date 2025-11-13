"use client";
import { motion } from "framer-motion";
import { Database, Users, Package, MapPin } from "lucide-react";

interface QuickTemplatesProps {
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  isDark: boolean;
}

const QuickTemplates = ({ setPrompt, isDark }: QuickTemplatesProps) => {
  const useCases = [
    {
      id: "mock-api",
      title: "Mock API",
      icon: Database,
      color: "from-blue-500 to-cyan-500",
      prompt: "Generate mock API...",
    },
    {
      id: "users",
      title: "User Profiles",
      icon: Users,
      color: "from-purple-500 to-pink-500",
      prompt: "Generate user profiles...",
    },
    {
      id: "products",
      title: "Products",
      icon: Package,
      color: "from-orange-500 to-red-500",
      prompt: "Generate product list...",
    },
    {
      id: "locations",
      title: "Locations",
      icon: MapPin,
      color: "from-green-500 to-emerald-500",
      prompt: "Generate random locations...",
    },
  ];

  const borderColor = isDark ? "border-gray-800" : "border-gray-200";

  return (
    <div className="mb-6">
      <label className="text-sm font-medium mb-3 block">Quick Templates</label>
      <div className="grid grid-cols-2 gap-2">
        {useCases.map((uc, i) => {
          const Icon = uc.icon;
          return (
            <motion.button
              key={uc.id}
              onClick={() => setPrompt(uc.prompt)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`${
                isDark
                  ? "bg-gray-800 hover:bg-gray-750"
                  : "bg-gray-50 hover:bg-gray-100"
              } border ${borderColor} rounded-lg p-3 transition-all group relative overflow-hidden`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${uc.color} opacity-0 group-hover:opacity-5`}
              />
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 bg-gradient-to-br ${uc.color} rounded-md`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-sm">{uc.title}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickTemplates;
