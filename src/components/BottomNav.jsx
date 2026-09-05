import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

const items = [
  { key: "home", label: "Home", icon: "⌂", route: "/home" },
  { key: "saved", label: "Saved", icon: "♡", route: "/saved-jobs" },
  { key: "applications", label: "Applied", icon: "◫", route: "/applications" },
  { key: "profile", label: "Profile", icon: "◉", route: "/profile" },
];

export default function BottomNav({ active }) {
  return (
    <View style={styles.shell}>
      {items.map((item) => {
        const selected = item.key === active;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={() => !selected && router.replace(item.route)}
            style={[styles.item, selected && styles.activeItem]}
          >
            <Text style={[styles.icon, selected && styles.activeText]}>{item.icon}</Text>
            <Text style={[styles.label, selected && styles.activeText]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flexDirection: "row", backgroundColor: "#ffffff", borderTopWidth: 1, borderTopColor: "#e5eaf2", paddingHorizontal: 8, paddingTop: 8, paddingBottom: 10 },
  item: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 12, paddingVertical: 5 },
  activeItem: { backgroundColor: "#eaf2ff" },
  icon: { color: "#64748b", fontSize: 19, fontWeight: "800", lineHeight: 21 },
  label: { color: "#64748b", fontSize: 10, fontWeight: "800", marginTop: 2 },
  activeText: { color: "#2563eb" },
});
