import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import api from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return Alert.alert("Enter a valid email", "Use the email address of your MarketLence Jobs account.");
    setBusy(true);
    try {
      await api.post("/send-email-otp", { email: email.trim().toLowerCase() });
      setOtpSent(true);
      Alert.alert("Verification code sent", "Check your email inbox for the OTP.");
    } catch (error) {
      Alert.alert("Could not send code", error?.response?.data?.error || "Please try again.");
    } finally { setBusy(false); }
  };

  const resetPassword = async () => {
    if (otp.trim().length < 4) return Alert.alert("Enter the verification code");
    if (newPassword.length < 8) return Alert.alert("Password too short", "Use at least 8 characters.");
    setBusy(true);
    try {
      await api.post("/reset-password", { email: email.trim().toLowerCase(), otp: otp.trim(), newPassword });
      Alert.alert("Password updated", "You can now sign in with your new password.", [{ text:"Sign in", onPress:() => router.replace("/login") }]);
    } catch (error) {
      Alert.alert("Could not reset password", error?.response?.data?.error || "Please check the code and try again.");
    } finally { setBusy(false); }
  };

  return <SafeAreaView style={styles.screen}><View style={styles.content}><Pressable onPress={() => router.back()}><Text style={styles.back}>← Back to login</Text></Pressable><Text style={styles.eyebrow}>ACCOUNT RECOVERY</Text><Text style={styles.heading}>Reset your password</Text><Text style={styles.subheading}>We will email a verification code to your registered email address.</Text><View style={styles.card}><Text style={styles.label}>Email address</Text><TextInput value={email} onChangeText={setEmail} editable={!otpSent && !busy} autoCapitalize="none" keyboardType="email-address" placeholder="you@email.com" placeholderTextColor="#94a3b8" style={styles.input}/>{otpSent ? <><Text style={styles.label}>Verification code</Text><TextInput value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} placeholder="Enter OTP" placeholderTextColor="#94a3b8" style={styles.input}/><Text style={styles.label}>New password</Text><TextInput value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="At least 8 characters" placeholderTextColor="#94a3b8" style={styles.input}/><Pressable onPress={sendCode} disabled={busy}><Text style={styles.resend}>Resend verification code</Text></Pressable></> : null}<Pressable onPress={otpSent ? resetPassword : sendCode} disabled={busy} style={[styles.action,busy && styles.disabled]}>{busy ? <ActivityIndicator color="#fff"/> : <Text style={styles.actionText}>{otpSent ? "Update password" : "Send verification code"}</Text>}</Pressable></View></View></SafeAreaView>;
}
const styles = StyleSheet.create({screen:{flex:1,backgroundColor:"#f4f7fb"},content:{padding:21},back:{color:"#2563eb",fontWeight:"800"},eyebrow:{color:"#2563eb",fontWeight:"900",fontSize:11,letterSpacing:1,marginTop:34},heading:{fontSize:30,color:"#172033",fontWeight:"900",marginTop:8},subheading:{color:"#64748b",lineHeight:21,marginTop:8},card:{backgroundColor:"#fff",borderRadius:20,padding:18,marginTop:28,borderWidth:1,borderColor:"#e5eaf2"},label:{color:"#334155",fontSize:12,fontWeight:"800",marginTop:9,marginBottom:7},input:{borderWidth:1,borderColor:"#d8e0eb",borderRadius:12,padding:14,color:"#172033",marginBottom:12},resend:{color:"#2563eb",fontSize:12,fontWeight:"800",marginTop:3},action:{backgroundColor:"#2563eb",borderRadius:12,padding:15,alignItems:"center",marginTop:24},disabled:{opacity:.65},actionText:{color:"#fff",fontWeight:"900",fontSize:15}});
