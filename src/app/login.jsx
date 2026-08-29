import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    try {
      const res = await api.post("/login", {
        email,
        password,
      });

      const { token, role, userId, username } = res.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("role", role);
      await AsyncStorage.setItem("userId", String(userId));
      await AsyncStorage.setItem("email", email);
      await AsyncStorage.setItem("username", username || email);

      Alert.alert("Success", "Login successful 🚀");

      if (role === "user") {
        router.replace("/profile");
      } else {
        Alert.alert("Access Denied", "Use Admin Login ❌");
      }
    } catch (err) {
      console.log(err.response?.data);

      Alert.alert(
        "Login Failed",
        err?.response?.data?.error || "Login failed ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back 👋</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={styles.link}>
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/employer-login")}>
        <Text style={styles.employerLink}>
          Are you an employer? Employer sign in
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2563EB",
    marginBottom: 30,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    marginBottom: 18,
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },

  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#2563EB",
    fontWeight: "600",
  },

  employerLink: {
    marginTop: 14,
    textAlign: "center",
    color: "#0f766e",
    fontWeight: "700",
  },
});
