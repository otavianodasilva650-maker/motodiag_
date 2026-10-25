import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen name="motos" options={{ title: "Motos", tabBarIcon: ({ color }) => <IconSymbol size={26} name="bicycle" color={color} /> }} />
      <Tabs.Screen name="defeitos" options={{ title: "Defeitos", tabBarIcon: ({ color }) => <IconSymbol size={26} name="cross.case.fill" color={color} /> }} />
      <Tabs.Screen name="multimetro" options={{ title: "Multímetro", tabBarIcon: ({ color }) => <IconSymbol size={26} name="gauge.with.dots.needle.67percent" color={color} /> }} />
      <Tabs.Screen name="historico" options={{ title: "Histórico", tabBarIcon: ({ color }) => <IconSymbol size={26} name="clock.arrow.circlepath" color={color} /> }} />
      <Tabs.Screen name="admin" options={{ href: null, title: "Admin" }} />
    </Tabs>
  );
}
