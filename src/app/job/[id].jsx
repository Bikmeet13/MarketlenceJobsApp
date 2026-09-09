import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../services/api";

export default function JobDetails() {
  const { id, source } = useLocalSearchParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (source) {
      AsyncStorage.getItem(`job_${id}`)
        .then((storedJob) => {
          if (!storedJob) throw new Error("Job not found");
          setJob(JSON.parse(storedJob));
        })
        .catch(() => setError("We could not load this external job."))
        .finally(() => setLoading(false));
      return;
    }

    api
      .get(`/jobs/${id}`)
      .then((response) => setJob(response.data))
      .catch(() => setError("We could not load this job."))
      .finally(() => setLoading(false));
  }, [id, source]);

  const applyOnPortal = async () => {
    const url = job?.applyLink || `https://jobs.marketlence.com/jobs/${id}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert("Unable to open application", "Please try again later.");
    }
  };

  const saveJob = async () => {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) {
      Alert.alert("Log in to save jobs", "Create an account or log in to keep this job in your saved list.", [{ text: "Not now", style: "cancel" }, { text: "Log in", onPress: () => router.push("/login") }]);
      return;
    }
    try {
      await api.post("/save-job", { user_id: Number(userId), job_id: source ? null : Number(id), external_job_id: source ? String(id) : null, source: source || "internal", title: job.title, company: job.company, location: job.location });
      Alert.alert("Saved", "This job is now in your saved jobs.");
    } catch (error) { Alert.alert("Could not save job", error?.response?.data || "Please try again."); }
  };

  if (loading) {
    return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#2563EB" /></SafeAreaView>;
  }

  if (error || !job) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.error}>{error || "Job not found."}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Text style={styles.backText}>Go back</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Back to jobs</Text>
        </TouchableOpacity>

        <View style={styles.companyMark}><Text style={styles.companyInitial}>{(job.company || "M").charAt(0).toUpperCase()}</Text></View>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.company}>{job.company || "Company not specified"}</Text>

        <View style={styles.pills}>
          {job.location && <Text style={styles.pill}>{job.location}</Text>}
          {(job.mode || job.type) && <Text style={styles.pill}>{job.mode || job.type}</Text>}
          {job.experience && <Text style={styles.pill}>{job.experience}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this role</Text>
          <Text style={styles.description}>{job.description || "No description has been added for this role yet."}</Text>
        </View>

        {job.skills && <View style={styles.section}><Text style={styles.sectionTitle}>Skills</Text><Text style={styles.description}>{job.skills}</Text></View>}
        {job.salary && <View style={styles.section}><Text style={styles.sectionTitle}>Salary</Text><Text style={styles.salary}>{job.salary}</Text></View>}

        <TouchableOpacity onPress={applyOnPortal} style={styles.applyButton}>
          <Text style={styles.applyText}>Apply for this job</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={saveJob} style={styles.saveButton}><Text style={styles.saveText}>♡ Save job</Text></TouchableOpacity>
        <Text style={styles.note}>You will continue securely on Marketlence Jobs.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F8FF" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F5F8FF", padding: 24 },
  content: { padding: 20, paddingBottom: 38 },
  backLink: { alignSelf: "flex-start", marginBottom: 25 },
  backLinkText: { color: "#2563EB", fontWeight: "800", fontSize: 15 },
  companyMark: { width: 62, height: 62, borderRadius: 19, backgroundColor: "#DBEAFE", alignItems: "center", justifyContent: "center", marginBottom: 17 },
  companyInitial: { color: "#1D4ED8", fontSize: 26, fontWeight: "800" },
  title: { color: "#111827", fontSize: 29, lineHeight: 36, fontWeight: "800" },
  company: { color: "#64748B", fontSize: 17, marginTop: 6 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 19 },
  pill: { color: "#1D4ED8", backgroundColor: "#DBEAFE", borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7, fontSize: 13, fontWeight: "700" },
  section: { marginTop: 28, backgroundColor: "#FFFFFF", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "#E5EAF3" },
  sectionTitle: { color: "#111827", fontSize: 17, fontWeight: "800", marginBottom: 9 },
  description: { color: "#475569", fontSize: 15, lineHeight: 23 },
  salary: { color: "#15803D", fontSize: 16, fontWeight: "800" },
  applyButton: { backgroundColor: "#2563EB", alignItems: "center", borderRadius: 15, paddingVertical: 17, marginTop: 30 },
  applyText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  saveButton: { borderWidth: 1.5, borderColor: "#2563EB", alignItems: "center", borderRadius: 15, paddingVertical: 15, marginTop: 12 },
  saveText: { color: "#2563EB", fontSize: 16, fontWeight: "800" },
  note: { color: "#64748B", textAlign: "center", fontSize: 12, marginTop: 10 },
  error: { color: "#374151", fontWeight: "700", fontSize: 16, textAlign: "center" },
  backButton: { marginTop: 16, backgroundColor: "#2563EB", paddingHorizontal: 16, paddingVertical: 11, borderRadius: 10 },
  backText: { color: "#FFFFFF", fontWeight: "800" },
});
