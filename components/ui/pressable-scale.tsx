import * as Haptics from "expo-haptics";
import type { ReactNode } from "react";
import { Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

type PressableScaleProps = Omit<PressableProps, "style" | "children"> & {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
};

export function PressableScale({ children, style, haptic = false, onPress, ...props }: PressableScaleProps) {
  return (
    <Pressable
      {...props}
      onPress={(event) => {
        if (haptic && Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(event);
      }}
      style={({ pressed }) => [style, pressed && { opacity: 0.82, transform: [{ scale: 0.98 }] }]}
    >
      {children}
    </Pressable>
  );
}
