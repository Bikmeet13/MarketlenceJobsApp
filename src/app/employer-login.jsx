import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export default function EmployerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const login = async () => {
    if (!email.trim() || !password) return Alert.alert("Enter your email and password");
    setLoading(true);
    try {
      const response = await api.post("/employers/login", { email: email.trim(), password });
      const { token, role, userId, username } = response.data;
      await AsyncStorage.multiSet([["token", token], ["role", role], ["userId", String(userId)], ["email", email.trim()], ["username", username || email.trim()]]);
      router.replace("/employer-dashboard");
    } catch (error) { Alert.alert("Could not sign in", error?.response?.data?.error || "Please check your employer email and password."); } finally { setLoading(false); }
  };
  return <SafeAreaView style={styles.screen}><View style={styles.content}><Pressable onPress={() => router.back()}><Text style={styles.back}>← Back</Text></Pressable><Text style={styles.eyebrow}>FOR EMPLOYERS</Text><Text style={styles.heading}>Manage your hiring</Text><Text style={styles.subheading}>Sign in to post jobs, review candidates, and feature your openings.</Text><View style={styles.card}><Text style={styles.label}>Work email</Text><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@company.com" placeholderTextColor="#94a3b8" style={styles.input}/><Text style={styles.label}>Password</Text><TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Your password" placeholderTextColor="#94a3b8" style={styles.input}/><Pressable onPress={login} disabled={loading} style={[styles.button, loading && styles.disabled]}>{loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.buttonText}>Employer sign in</Text>}</Pressable></View><Text style={styles.help}>Need an employer account? Register on jobs.marketlence.com, then use the same email and password here.</Text><Pressable onPress={() => router.push("/login")}><Text style={styles.link}>Looking for a job? Candidate login</Text></Pressable></View></SafeAreaView>;
}
const styles = StyleSheet.create({screen:{flex:1,backgroundColor:"#f4f7fb"},content:{padding:22},back:{color:"#2563eb",fontWeight:"800"},eyebrow:{color:"#2563eb",fontWeight:"900",fontSize:11,letterSpacing:1,marginTop:34},heading:{color:"#172033",fontSize:31,fontWeight:"900",marginTop:8},subheading:{color:"#64748b",lineHeight:21,marginTop:8},card:{backgroundColor:"#fff",padding:18,borderRadius:20,marginTop:27,borderWidth:1,borderColor:"#e5eaf2"},label:{color:"#334155",fontSize:12,fontWeight:"800",marginBottom:7,marginTop:7},input:{borderWidth:1,borderColor:"#d8e0eb",borderRadius:12,padding:14,color:"#172033",marginBottom:12},button:{backgroundColor:"#2563eb",borderRadius:12,padding:15,alignItems:"center",marginTop:8},disabled:{opacity:.65},buttonText:{color:"#fff",fontWeight:"900",fontSize:15},help:{color:"#64748b",lineHeight:19,fontSize:12,marginTop:20},link:{color:"#2563eb",fontWeight:"800",marginTop:16,fontSize:13}});
