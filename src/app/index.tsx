import { router } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function Index() {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Let everyone discover the job listings first. Login is required only
      // for candidate features such as saving jobs and applying.
      router.replace("/home");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
       source={require("../../assets/logo.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>
        MarketLence Jobs
      </Text>

      <Text style={styles.subtitle}>
        Find Your Dream Job
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
  },
  subtitle: {
    marginTop: 10,
    color: "#DBEAFE",
    fontSize: 18,
  },
});
