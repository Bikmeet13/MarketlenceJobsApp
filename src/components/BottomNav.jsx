import { router, usePathname } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const items = [
  { label: "Jobs", icon: "⌕", href: "/home" },
  { label: "Saved", icon: "♡", href: "/saved-jobs" },
  { label: "Applications", icon: "▣", href: "/applications" },
  { label: "Profile", icon: "●", href: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return <View style={styles.bar}>{items.map((item) => {
    const active = pathname === item.href;
    return <TouchableOpacity key={item.href} onPress={() => router.replace(item.href)} style={styles.item}>
      <Text style={[styles.icon, active && styles.active]}>{item.icon}</Text><Text style={[styles.label, active && styles.active]}>{item.label}</Text>
    </TouchableOpacity>;
  })}</View>;
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", backgroundColor: "#FFFFFF", borderTopWidth: 1, borderColor: "#E5EAF3", paddingTop: 8, paddingBottom: 10, elevation: 12 },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 }, icon: { color: "#94A3B8", fontSize: 19, fontWeight: "800" },
  label: { color: "#64748B", fontSize: 11, fontWeight: "700" }, active: { color: "#2563EB" },
});
