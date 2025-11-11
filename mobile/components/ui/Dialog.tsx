import * as React from "react";
import { Modal, View, Text } from "react-native";
import { cn } from "./utils";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children, ...props }: DialogProps) {
  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent={true}
      onRequestClose={() => onOpenChange?.(false)}
      {...props}
    >
      {children}
    </Modal>
  );
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

function DialogContent({ className, children, ...props }: DialogContentProps) {
  return (
    <View className={cn("flex-1 justify-center items-center bg-black/50", className)} {...props}>
      <View className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {children}
      </View>
    </View>
  );
}

interface DialogHeaderProps {
  className?: string;
  children: React.ReactNode;
}

function DialogHeader({ className, children, ...props }: DialogHeaderProps) {
  return (
    <View className={cn("mb-4", className)} {...props}>
      {children}
    </View>
  );
}

interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

function DialogTitle({ className, children, ...props }: DialogTitleProps) {
  return (
    <Text className={cn("text-lg font-semibold text-gray-900", className)} {...props}>
      {children}
    </Text>
  );
}

interface DialogDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

function DialogDescription({ className, children, ...props }: DialogDescriptionProps) {
  return (
    <Text className={cn("text-sm text-gray-600 mt-1", className)} {...props}>
      {children}
    </Text>
  );
}

interface DialogFooterProps {
  className?: string;
  children: React.ReactNode;
}

function DialogFooter({ className, children, ...props }: DialogFooterProps) {
  return (
    <View className={cn("flex-row justify-end gap-2 mt-6", className)} {...props}>
      {children}
    </View>
  );
}

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};