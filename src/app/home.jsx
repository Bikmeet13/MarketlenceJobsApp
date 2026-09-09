import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../services/api";
import BottomNav from "../components/BottomNav";

const COUNTRIES = [
  { label: "India", code: "in", terms: ["india"] },
  { label: "United States", code: "us", terms: ["united states", "usa"] },
  { label: "United Kingdom", code: "gb", terms: ["united kingdom", "uk", "great britain"] },
  { label: "Canada", code: "ca", terms: ["canada"] },
  { label: "Australia", code: "au", terms: ["australia"] },
  { label: "Germany", code: "de", terms: ["germany", "deutschland"] },
];
const MODES = ["All modes", "Remote", "Hybrid", "Onsite", "Visa sponsorship"];

function JobCard({ job }) {
  const openJob = async () => {
    if (job.source) {
      await AsyncStorage.setItem(`job_${job.id}`, JSON.stringify(job));
    }

    router.push({
      pathname: "/job/[id]",
      params: { id: String(job.id), source: job.source || "" },
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={openJob}
      style={styles.card}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.companyMark}>
          <Text style={styles.companyInitial}>{(job.company || "M").charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardTitleWrap}>
          <Text numberOfLines={2} style={styles.jobTitle}>{job.title}</Text>
          <Text numberOfLines={1} style={styles.companyName}>{job.company || "Company not specified"}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{job.location || "Location not specified"}</Text>
        <Text style={styles.metaDot}>•</Text>
        <Text style={styles.metaText}>{job.mode || job.type || "Full-time"}</Text>
      </View>

      {job.skills ? <Text numberOfLines={2} style={styles.skills}>{job.skills}</Text> : null}

      <View style={styles.cardFooter}>
        <Text numberOfLines={1} style={styles.salary}>{job.salary || "Salary not disclosed"}</Text>
        <Text style={styles.details}>View details →</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("there");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [mode, setMode] = useState("All modes");
  const [sort, setSort] = useState("Newest");

  const loadJobs = async (isRefresh = false, selectedCountry = country) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError("");

    try {
      const [internalResult, adzunaResult, arbeitnowResult] = await Promise.allSettled([
        api.get("/jobs"),
        api.get("/external-jobs", { params: { country: selectedCountry.code } }),
        api.get("/arbeitnow-jobs"),
      ]);

      const internalJobs = internalResult.status === "fulfilled" && Array.isArray(internalResult.value.data)
        ? internalResult.value.data
        : [];
      const adzunaJobs = adzunaResult.status === "fulfilled" && Array.isArray(adzunaResult.value.data)
        ? adzunaResult.value.data.slice(0, 20).map((job) => ({
            id: `adzuna-${job.id}`,
            title: job.title,
            company: job.company?.display_name || "Company not specified",
            location: job.location?.display_name || "Location not specified",
            salary: job.salary_min && job.salary_max
              ? `₹${Number(job.salary_min).toLocaleString()} - ₹${Number(job.salary_max).toLocaleString()}`
              : "Salary not disclosed",
            description: job.description,
            mode: "External",
            skills: "",
            applyLink: job.redirect_url,
            source: "adzuna",
            country: selectedCountry.label,
          }))
        : [];
      const arbeitnowJobs = arbeitnowResult.status === "fulfilled" && Array.isArray(arbeitnowResult.value.data)
        ? arbeitnowResult.value.data.slice(0, 20).map((job) => ({
            id: `arbeitnow-${job.slug}`,
            title: job.title,
            company: job.company_name || "Company not specified",
            location: job.location || "Location not specified",
            salary: "Salary not disclosed",
            description: job.description,
            mode: job.remote ? "Remote" : "Onsite",
            skills: (job.tags || []).join(", "),
            applyLink: job.url,
            source: "arbeitnow",
          }))
        : [];

      if (internalResult.status !== "fulfilled" && !adzunaJobs.length && !arbeitnowJobs.length) {
        throw internalResult.reason || new Error("Unable to load jobs");
      }

      setJobs([...internalJobs, ...adzunaJobs, ...arbeitnowJobs]);
    } catch (requestError) {
      console.log("JOB LIST ERROR:", requestError?.message);
      setError("We could not load jobs right now. Pull down to try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    AsyncStorage.multiGet(["username", "token"]).then((values) => {
      const stored = Object.fromEntries(values);
      setUsername(stored.username || "there");
      setIsLoggedIn(Boolean(stored.token));
    });
  }, []);

  useEffect(() => {
    loadJobs(false, country);
  }, [country]);

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();
    const countryMatches = (job) => {
      if (job.source === "adzuna") return job.country === country.label;
      const place = `${job.country || ""} ${job.location || ""}`.toLowerCase();
      return country.terms.some((item) => place.includes(item));
    };
    const modeMatches = (job) => {
      if (mode === "All modes") return true;
      const text = `${job.mode || ""} ${job.type || ""} ${job.skills || ""} ${job.description || ""}`.toLowerCase();
      return mode === "Visa sponsorship" ? /visa|sponsor/.test(text) : text.includes(mode.toLowerCase());
    };
    const visible = jobs.filter((job) => {
      const searchMatches = !term || [job.title, job.company, job.location, job.skills, job.mode].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
      return searchMatches && countryMatches(job) && modeMatches(job);
    });
    return visible.sort((a, b) => {
      const first = new Date(a.posted_at || a.created_at || 0).getTime();
      const second = new Date(b.posted_at || b.created_at || 0).getTime();
      return sort === "Oldest" ? first - second : second - first;
    });
  }, [jobs, search, country, mode, sort]);

  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "role", "userId", "email", "username"]);
    setIsLoggedIn(false);
    setUsername("there");
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredJobs}
        keyExtractor={(job) => String(job.id)}
        renderItem={({ item }) => <JobCard job={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadJobs(true)} tintColor="#2563EB" />}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.brand}>Marketlence Jobs</Text>
                <Image source={require("../../assets/logo.png")} style={styles.brandLogo} />
                <Text style={styles.greeting}>Hello, {username}</Text>
              </View>
              {isLoggedIn ? (
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                  <Text style={styles.logoutText}>Log out</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.authActions}>
                  <TouchableOpacity onPress={() => router.push("/login")} style={styles.loginButton}>
                    <Text style={styles.loginText}>Log in</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push("/signup")} style={styles.signupButton}>
                    <Text style={styles.signupText}>Sign up</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.hero}>
              <Text style={styles.heroTitle}>Find your next opportunity</Text>
              <Text style={styles.heroText}>Discover jobs that match your skills and goals.</Text>
            </View>

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search jobs, skills, or locations"
              placeholderTextColor="#6B7280"
              style={styles.searchInput}
              returnKeyType="search"
            />

            <Text style={styles.filterLabel}>Country</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {COUNTRIES.map((item) => <TouchableOpacity key={item.code} onPress={() => setCountry(item)} style={[styles.chip, country.code === item.code && styles.chipActive]}><Text style={[styles.chipText, country.code === item.code && styles.chipTextActive]}>{item.label}</Text></TouchableOpacity>)}
            </ScrollView>

            <View style={styles.filterHeader}>
              <Text style={styles.filterLabel}>Work style</Text>
              <TouchableOpacity onPress={() => setSort((value) => value === "Newest" ? "Oldest" : "Newest")}><Text style={styles.sort}>{sort} ↓</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {MODES.map((item) => <TouchableOpacity key={item} onPress={() => setMode(item)} style={[styles.chip, mode === item && styles.chipActive]}><Text style={[styles.chipText, mode === item && styles.chipTextActive]}>{item}</Text></TouchableOpacity>)}
            </ScrollView>

            <View style={styles.listHeading}>
              <Text style={styles.listTitle}>Latest jobs</Text>
              <Text style={styles.jobCount}>{filteredJobs.length} roles</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>{error || "No jobs found"}</Text>
              {!error && <Text style={styles.emptyText}>Try a different search term.</Text>}
            </View>
          )
        }
      />
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F8FF" },
  listContent: { padding: 20, paddingBottom: 36 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  brand: { color: "#1D4ED8", fontWeight: "800", fontSize: 20 },
  brandLogo: { width: 32, height: 32, resizeMode: "contain", marginTop: 5 },
  greeting: { color: "#4B5563", fontSize: 14, marginTop: 3 },
  authActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  loginButton: { paddingHorizontal: 11, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: "#BFDBFE" },
  loginText: { color: "#1D4ED8", fontWeight: "700", fontSize: 13 },
  signupButton: { paddingHorizontal: 11, paddingVertical: 9, borderRadius: 10, backgroundColor: "#2563EB" },
  signupText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  logoutButton: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 10, backgroundColor: "#E0E7FF" },
  logoutText: { color: "#1D4ED8", fontWeight: "700", fontSize: 13 },
  hero: { backgroundColor: "#1D4ED8", borderRadius: 24, padding: 24, marginBottom: 18 },
  heroTitle: { color: "#FFFFFF", fontSize: 27, fontWeight: "800", lineHeight: 34 },
  heroText: { color: "#DBEAFE", fontSize: 15, lineHeight: 22, marginTop: 8 },
  searchInput: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D7E0F2", borderRadius: 15, paddingHorizontal: 16, paddingVertical: 15, fontSize: 15, color: "#111827", shadowColor: "#1E3A8A", shadowOpacity: 0.07, shadowRadius: 12, elevation: 2 },
  filterLabel: { color: "#334155", fontWeight: "800", fontSize: 13, marginTop: 17, marginBottom: 9 },
  filterHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sort: { color: "#2563EB", fontSize: 13, fontWeight: "800", marginTop: 17, marginBottom: 9 },
  chipRow: { gap: 8, paddingRight: 20 },
  chip: { borderWidth: 1, borderColor: "#CBD5E1", backgroundColor: "#FFFFFF", borderRadius: 99, paddingHorizontal: 13, paddingVertical: 9 },
  chipActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  chipText: { color: "#475569", fontSize: 12, fontWeight: "700" },
  chipTextActive: { color: "#FFFFFF" },
  listHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 26, marginBottom: 13 },
  listTitle: { color: "#111827", fontSize: 21, fontWeight: "800" },
  jobCount: { color: "#64748B", fontSize: 13, fontWeight: "600" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 18, marginBottom: 13, borderWidth: 1, borderColor: "#E5EAF3" },
  cardTopRow: { flexDirection: "row", alignItems: "center" },
  companyMark: { width: 46, height: 46, borderRadius: 14, backgroundColor: "#DBEAFE", alignItems: "center", justifyContent: "center", marginRight: 12 },
  companyInitial: { color: "#1D4ED8", fontWeight: "800", fontSize: 19 },
  cardTitleWrap: { flex: 1 },
  jobTitle: { color: "#111827", fontSize: 17, fontWeight: "800", lineHeight: 22 },
  companyName: { color: "#64748B", fontSize: 14, marginTop: 3 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 15 },
  metaText: { color: "#4B5563", fontSize: 13, flexShrink: 1 },
  metaDot: { color: "#94A3B8", marginHorizontal: 7 },
  skills: { color: "#475569", fontSize: 13, lineHeight: 19, marginTop: 10 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 17 },
  salary: { color: "#15803D", fontSize: 13, fontWeight: "700", flex: 1, marginRight: 8 },
  details: { color: "#2563EB", fontSize: 13, fontWeight: "800" },
  loader: { marginTop: 32 },
  emptyState: { alignItems: "center", paddingVertical: 42 },
  emptyTitle: { color: "#374151", fontSize: 16, fontWeight: "700", textAlign: "center" },
  emptyText: { color: "#6B7280", marginTop: 7, textAlign: "center" },
});
