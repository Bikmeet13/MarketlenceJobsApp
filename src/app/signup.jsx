import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from "../services/api";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const validDetails = () => {
    if (!username.trim() || !email.trim() || !password) {
      Alert.alert("Complete your details", "Enter your name, email, and password.");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Choose a longer password", "Your password must have at least 6 characters.");
      return false;
    }
    return true;
  };

  const sendOtp = async () => {
    if (!validDetails()) return;
    setLoading(true);
    try {
      await api.post("/send-email-otp", { email: email.trim() });
      setOtpSent(true);
      Alert.alert("Verification code sent", "Check your email for the 6-digit code.");
    } catch (error) {
      Alert.alert("Could not send code", error?.response?.data?.error || "Please try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async () => {
    if (!otp.trim()) {
      Alert.alert("Enter your code", "Enter the 6-digit code sent to your email.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/verify-email-otp", {
        username: username.trim(),
        email: email.trim(),
        password,
        otp: otp.trim(),
        isAdmin: false,
      });
      Alert.alert("Account created", "You can now log in to Marketlence Jobs.", [
        { text: "Log in", onPress: () => router.replace("/login") },
      ]);
    } catch (error) {
      Alert.alert("Could not create account", error?.response?.data?.error || "Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Save jobs, build your profile, and apply faster.</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Full name</Text>
            <TextInput value={username} onChangeText={setUsername} placeholder="Your name" style={styles.input} editable={!otpSent} />
            <Text style={styles.label}>Email address</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" style={styles.input} editable={!otpSent} />
            <Text style={styles.label}>Password</Text>
            <TextInput value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry style={styles.input} editable={!otpSent} />

            {otpSent && (
              <>
                <Text style={styles.label}>Email verification code</Text>
                <TextInput value={otp} onChangeText={setOtp} placeholder="6-digit code" keyboardType="number-pad" maxLength={6} style={styles.input} />
              </>
            )}

            <TouchableOpacity disabled={loading} onPress={otpSent ? createAccount : sendOtp} style={[styles.button, loading && styles.buttonDisabled]}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{otpSent ? "Create account" : "Send verification code"}</Text>}
            </TouchableOpacity>

            {otpSent && <TouchableOpacity disabled={loading} onPress={sendOtp}><Text style={styles.resend}>Resend code</Text></TouchableOpacity>}
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/login")}><Text style={styles.loginLink}>Log in</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F8FF" },
  flex: { flex: 1 },
  content: { padding: 24, paddingTop: 22, flexGrow: 1 },
  back: { color: "#2563EB", fontSize: 15, fontWeight: "800" },
  header: { marginTop: 36, marginBottom: 30 },
  title: { color: "#111827", fontSize: 31, fontWeight: "800" },
  subtitle: { color: "#64748B", fontSize: 15, lineHeight: 22, marginTop: 9 },
  form: { backgroundColor: "#FFFFFF", padding: 20, borderRadius: 20, borderWidth: 1, borderColor: "#E5EAF3" },
  label: { color: "#374151", fontSize: 13, fontWeight: "800", marginBottom: 7, marginTop: 2 },
  input: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#D7E0F2", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, color: "#111827", fontSize: 15, marginBottom: 17 },
  button: { backgroundColor: "#2563EB", borderRadius: 13, paddingVertical: 16, alignItems: "center", marginTop: 5 },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  resend: { color: "#2563EB", fontWeight: "800", textAlign: "center", marginTop: 17 },
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 27 },
  loginPrompt: { color: "#64748B" },
  loginLink: { color: "#2563EB", fontWeight: "800" },
});
