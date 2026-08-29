import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

const label = (value) => String(value || "Submitted").replace(/_/g, " ");

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  const load = useCallback(async () => {
    const token = await AsyncStorage.getItem("token");
    setSignedIn(Boolean(token));
    if (!token) { setLoading(false); return; }
    try {
      const response = await api.get("/applications", { headers: { Authorization: `Bearer ${token}` } });
      setApplications(Array.isArray(response.data) ? response.data : []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  if (!signedIn) return <SafeAreaView style={styles.screen}><View style={styles.center}><Text style={styles.emptyTitle}>Log in to view applications</Text><Pressable onPress={() => router.replace("/login")} style={styles.login}><Text style={styles.loginText}>Log in</Text></Pressable></View></SafeAreaView>;

  return <SafeAreaView style={styles.screen}><View style={styles.header}><Pressable onPress={() => router.back()}><Text style={styles.back}>← Back</Text></Pressable><Text style={styles.heading}>Applications</Text><Text style={styles.subheading}>Keep track of every role you apply for.</Text></View><FlatList data={applications} keyExtractor={(item) => String(item.id)} contentContainerStyle={styles.list} renderItem={({ item }) => <View style={styles.card}><View style={styles.cardTop}><View style={styles.companyMark}><Text style={styles.companyMarkText}>{String(item.company || "M").charAt(0).toUpperCase()}</Text></View><View style={styles.cardInfo}><Text style={styles.title}>{item.title || "Job application"}</Text><Text style={styles.company}>{item.company || "MarketLence Jobs"}</Text><Text style={styles.location}>⌖ {item.location || "Location not specified"}</Text></View></View><View style={styles.status}><Text style={styles.statusText}>{label(item.status)}</Text></View></View>} ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyTitle}>No applications yet</Text><Text style={styles.emptyText}>When you apply to a job through MarketLence Jobs, its status will appear here.</Text><Pressable onPress={() => router.replace("/home")} style={styles.login}><Text style={styles.loginText}>Explore jobs</Text></Pressable></View>} /></SafeAreaView>;
}

const styles = StyleSheet.create({ screen:{flex:1,backgroundColor:"#f4f7fb"},header:{padding:20,paddingBottom:10},back:{color:"#2563eb",fontWeight:"800"},heading:{fontSize:28,fontWeight:"900",color:"#172033",marginTop:18},subheading:{color:"#64748b",marginTop:5},list:{padding:16,paddingTop:8,paddingBottom:32},card:{backgroundColor:"#fff",borderRadius:18,padding:16,marginBottom:13,borderWidth:1,borderColor:"#e5eaf2"},cardTop:{flexDirection:"row",alignItems:"center"},companyMark:{height:47,width:47,borderRadius:15,alignItems:"center",justifyContent:"center",backgroundColor:"#e0ecff"},companyMarkText:{color:"#2563eb",fontSize:19,fontWeight:"900"},cardInfo:{marginLeft:12,flex:1},title:{fontSize:16,fontWeight:"900",color:"#172033"},company:{marginTop:3,color:"#2563eb",fontSize:13,fontWeight:"700"},location:{color:"#64748b",fontSize:12,marginTop:4},status:{alignSelf:"flex-start",marginTop:14,backgroundColor:"#dcfce7",borderRadius:20,paddingHorizontal:10,paddingVertical:6},statusText:{color:"#15803d",textTransform:"capitalize",fontSize:11,fontWeight:"800"},center:{flex:1,alignItems:"center",justifyContent:"center",padding:28},empty:{alignItems:"center",paddingTop:72,paddingHorizontal:25},emptyTitle:{fontSize:20,fontWeight:"900",color:"#172033",textAlign:"center"},emptyText:{color:"#64748b",lineHeight:20,textAlign:"center",marginTop:8},login:{backgroundColor:"#2563eb",paddingHorizontal:19,paddingVertical:12,borderRadius:12,marginTop:20},loginText:{color:"#fff",fontWeight:"900"} });
