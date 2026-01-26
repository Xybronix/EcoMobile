import * as React from "react";
import { TouchableOpacity, View } from "react-native";
import { cn } from "./utils";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

function Switch({ 
  checked = false, 
  onCheckedChange, 
  className, 
  ...props 
}: SwitchProps) {
  return (
    <TouchableOpacity
      onPress={() => onCheckedChange?.(!checked)}
      className={cn(
        "w-11 h-6 rounded-full p-0.5 transition-colors",
        checked ? "bg-green-500" : "bg-gray-300",
        className
      )}
      {...props}
    >
      <View
        className={cn(
          "h-5 w-5 rounded-full bg-white shadow transform transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </TouchableOpacity>
  );
}

export { Switch };