import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from "@react-native-google-signin/google-signin";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../services/api";

GoogleSignin.configure({
  webClientId: "238703562089-n53o5htfhqrboeh9pascgcf5f0ntts91.apps.googleusercontent.com",
});

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

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const googleResult = await GoogleSignin.signIn();
      if (!isSuccessResponse(googleResult)) return;
      const credential = googleResult.data.idToken;
      if (!credential) throw new Error("Google did not return an identity token. Please try again.");

      const res = await api.post("/google-login", { credential });
      const { token, role, userId, username, email: googleEmail } = res.data;
      if (role !== "user") {
        Alert.alert("Candidate account required", "Please use Employer sign in for an employer account.");
        return;
      }

      await AsyncStorage.multiSet([
        ["token", token],
        ["role", role],
        ["userId", String(userId)],
        ["email", googleEmail],
        ["username", username || googleEmail],
      ]);
      Alert.alert("Welcome to MarketLence Jobs", "Google sign-in was successful.");
      router.replace("/profile");
    } catch (err) {
      if (isErrorWithCode(err) && err.code === statusCodes.SIGN_IN_CANCELLED) return;
      Alert.alert("Google sign-in failed", err?.response?.data?.error || err?.message || "Please try again.");
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

      <TouchableOpacity onPress={() => router.push("/forgot-password")}>
        <Text style={styles.forgotLink}>
          Forgot password?
        </Text>
      </TouchableOpacity>

      <View style={styles.divider}><View style={styles.dividerLine}/><Text style={styles.dividerText}>OR</Text><View style={styles.dividerLine}/></View>

      <TouchableOpacity
        style={[styles.googleButton, loading && styles.disabledButton]}
        onPress={handleGoogleLogin}
        disabled={loading}
      >
        <Text style={styles.googleMark}>G</Text>
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/employer-login")}>
        <Text style={styles.employerLink}>
          Are you an employer? Employer sign in
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/career-tools")}>
        <Text style={styles.toolsLink}>
          Resume Builder & Docs Converter
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

  forgotLink: {
    marginTop: 16,
    textAlign: "right",
    color: "#2563EB",
    fontWeight: "700",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 22,
  },

  dividerLine: {
    height: 1,
    flex: 1,
    backgroundColor: "#e2e8f0",
  },

  dividerText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "800",
  },

  googleButton: {
    marginTop: 17,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#fff",
  },

  disabledButton: {
    opacity: 0.6,
  },

  googleMark: {
    color: "#4285F4",
    fontWeight: "900",
    fontSize: 18,
    marginRight: 10,
  },

  googleText: {
    color: "#334155",
    fontWeight: "800",
    fontSize: 15,
  },

  employerLink: {
    marginTop: 14,
    textAlign: "center",
    color: "#0f766e",
    fontWeight: "700",
  },

  toolsLink: {
    marginTop: 14,
    textAlign: "center",
    color: "#7c3aed",
    fontWeight: "700",
  },
});
