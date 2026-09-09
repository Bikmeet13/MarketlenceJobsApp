import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from "../services/api";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = "238703562089-n53o5htfhqrboeh9pascgcf5f0ntts91.apps.googleusercontent.com";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleRequest, googleResponse, promptGoogle] = Google.useIdTokenAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    clientId: GOOGLE_WEB_CLIENT_ID,
    selectAccount: true,
  });

  const finishLogin = async ({ token, role, userId, username, email: accountEmail }) => {
    if (role !== "user") {
      Alert.alert("Access Denied", "Use the admin portal for administrator accounts.");
      return;
    }

    await AsyncStorage.multiSet([
      ["token", token],
      ["role", role],
      ["userId", String(userId)],
      ["email", accountEmail || email],
      ["username", username || accountEmail || email],
    ]);
    router.replace("/home");
  };

  useEffect(() => {
    const signInWithGoogle = async () => {
      if (googleResponse?.type !== "success") {
        if (googleResponse?.type === "error") Alert.alert("Google sign-in failed", "Please try again.");
        return;
      }

      const credential = googleResponse.params?.id_token;
      if (!credential) {
        Alert.alert("Google sign-in failed", "No verification token was received.");
        return;
      }

      setGoogleLoading(true);
      try {
        const response = await api.post("/google-login", { credential });
        await finishLogin(response.data);
      } catch (error) {
        Alert.alert("Google sign-in failed", error?.response?.data?.error || "Please try again.");
      } finally {
        setGoogleLoading(false);
      }
    };

    signInWithGoogle();
  }, [googleResponse]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await api.post("/login", { email, password });
      await finishLogin(response.data);
    } catch (error) {
      Alert.alert("Login Failed", error?.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.replace("/home")} style={styles.backButton}>
        <Text style={styles.backText}>Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Log in to save jobs and manage your profile.</Text>

      <TextInput placeholder="Email" style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Logging in..." : "Log in"}</Text>
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        style={[styles.googleButton, (!googleRequest || googleLoading) && styles.googleButtonDisabled]}
        onPress={() => promptGoogle()}
        disabled={!googleRequest || googleLoading}
      >
        <Text style={styles.googleIcon}>G</Text>
        <Text style={styles.googleText}>{googleLoading ? "Signing in with Google..." : "Continue with Google"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 25, backgroundColor: "#FFFFFF" },
  backButton: { alignSelf: "flex-start", marginBottom: 28 },
  backText: { color: "#2563EB", fontWeight: "700", fontSize: 15 },
  title: { fontSize: 32, fontWeight: "bold", color: "#2563EB" },
  subtitle: { marginTop: 8, marginBottom: 30, color: "#64748B", fontSize: 15 },
  input: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 12, padding: 15, marginBottom: 18, color: "#111827" },
  button: { backgroundColor: "#2563EB", padding: 16, borderRadius: 12, alignItems: "center" },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 18 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 22 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  dividerText: { color: "#6B7280", fontSize: 12, fontWeight: "700" },
  googleButton: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 20, padding: 15, borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 12, backgroundColor: "#FFFFFF" },
  googleButtonDisabled: { opacity: 0.55 },
  googleIcon: { color: "#4285F4", fontWeight: "900", fontSize: 20 },
  googleText: { color: "#374151", fontWeight: "700", fontSize: 16 },
  link: { marginTop: 22, textAlign: "center", color: "#2563EB", fontWeight: "600" },
});
