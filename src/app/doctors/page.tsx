"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Search, Stethoscope, Heart, Brain, Bone, Eye, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock specialization data for MVP
const SPECIALIZATIONS = [
  { id: "cardiology", name: "Cardiology", icon: Heart, color: "bg-red-500" },
  { id: "neurology", name: "Neurology", icon: Brain, color: "bg-purple-500" },
  { id: "orthopedics", name: "Orthopedics", icon: Bone, color: "bg-orange-500" },
  { id: "ophthalmology", name: "Ophthalmology", icon: Eye, color: "bg-blue-500" },
  { id: "general", name: "General Practice", icon: Stethoscope, color: "bg-green-500" },
  { id: "internal", name: "Internal Medicine", icon: Activity, color: "bg-indigo-500" },
];

// Mock doctors data for MVP
const MOCK_DOCTORS = [
  { id: "1", full_name: "Dr. Sarah Johnson", email: "sarah.johnson@hospital.com", avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: "2", full_name: "Dr. Michael Chen", email: "michael.chen@hospital.com", avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: "3", full_name: "Dr. Emily Rodriguez", email: "emily.rodriguez@hospital.com", avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: "4", full_name: "Dr. James Williams", email: "james.williams@hospital.com", avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: "5", full_name: "Dr. Aisha Patel", email: "aisha.patel@hospital.com", avatar: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: "6", full_name: "Dr. Robert Thompson", email: "robert.thompson@hospital.com", avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: "7", full_name: "Dr. Maria Garcia", email: "maria.garcia@hospital.com", avatar: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: "8", full_name: "Dr. David Kim", email: "david.kim@hospital.com", avatar: "https://images.unsplash.com/photo-1582750433449-d22b1c74caf6?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: "9", full_name: "Dr. Jennifer Lee", email: "jennifer.lee@hospital.com", avatar: "https://images.unsplash.com/photo-1651008325506-71d345846b45?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: "10", full_name: "Dr. Ahmed Hassan", email: "ahmed.hassan@hospital.com", avatar: "https://images.unsplash.com/photo-1612531386530-97286d74c2ea?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: "11", full_name: "Dr. Lisa Anderson", email: "lisa.anderson@hospital.com", avatar: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: "12", full_name: "Dr. Carlos Martinez", email: "carlos.martinez@hospital.com", avatar: "https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: "13", full_name: "Dr. Rachel Cohen", email: "rachel.cohen@hospital.com", avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: "14", full_name: "Dr. Kevin O'Brien", email: "kevin.obrien@hospital.com", avatar: "https://images.unsplash.com/photo-1582201942988-13e60e4556ee?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: "15", full_name: "Dr. Priya Sharma", email: "priya.sharma@hospital.com", avatar: "https://images.unsplash.com/photo-1623854767648-e7b6179e8888?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: "16", full_name: "Dr. Thomas Wright", email: "thomas.wright@hospital.com", avatar: "https://images.unsplash.com/photo-1550831106-0994fe8abcfe?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: "17", full_name: "Dr. Fatima Al-Rashid", email: "fatima.alrashid@hospital.com", avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: "18", full_name: "Dr. Daniel Park", email: "daniel.park@hospital.com", avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: "19", full_name: "Dr. Olivia Brown", email: "olivia.brown@hospital.com", avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: "20", full_name: "Dr. Marcus Johnson", email: "marcus.johnson@hospital.com", avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300&h=300" },
];

// Mock function to assign specializations to doctors
const assignMockSpecializations = (doctors: any[]) => {
  return doctors.map((doctor, index) => {
    // Assign 1-3 random specializations per doctor based on index for consistency
    const seed = parseInt(doctor.id);
    const numSpecs = (seed % 3) + 1;
    const specs = [];
    const usedIndices = new Set();
    
    for (let i = 0; i < numSpecs; i++) {
      let randIndex = (seed + i * 7) % SPECIALIZATIONS.length;
      while (usedIndices.has(randIndex)) {
        randIndex = (randIndex + 1) % SPECIALIZATIONS.length;
      }
      
      usedIndices.add(randIndex);
      specs.push(SPECIALIZATIONS[randIndex]);
    }
    
    return {
      ...doctor,
      specializations: specs,
      experience: Math.floor(Math.random() * 20) + 5, // 5-25 years
      rating: (Math.random() * 0.5 + 4.5).toFixed(1), // 4.5-5.0
      patients: Math.floor(Math.random() * 500) + 100, // 100-600 patients
    };
  });
};

export default function DoctorsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isAuthed, setIsAuthed] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!isMounted) return;
        setIsAuthed(!!authData.user);

        // Use mock doctors data for MVP
        if (!isMounted) return;
        const doctorsWithSpecs = assignMockSpecializations(MOCK_DOCTORS);
        setDoctors(doctorsWithSpecs);
      } catch (e: any) {
        if (!isMounted) return;
        setDoctors([]);
        setError(e?.message || "Unable to load doctors.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const filtered = useMemo(() => {
    let result = doctors;

    // Filter by specialization
    if (selectedSpec) {
      result = result.filter((d) =>
        d.specializations.some((s: any) => s.id === selectedSpec)
      );
    }

    // Filter by search query (name or specialization)
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((d) => {
        const nameMatch = (d.full_name || d.email || "").toLowerCase().includes(q);
        const specMatch = d.specializations.some((s: any) =>
          s.name.toLowerCase().includes(q)
        );
        return nameMatch || specMatch;
      });
    }

    return result;
  }, [doctors, selectedSpec, searchQuery]);

  // Group doctors by specialization for display
  const doctorsBySpec = useMemo(() => {
    if (selectedSpec || searchQuery) return null; // Don't group when filtering

    const grouped: Record<string, any[]> = {};
    SPECIALIZATIONS.forEach((spec) => {
      grouped[spec.id] = doctors.filter((d) =>
        d.specializations.some((s: any) => s.id === spec.id)
      );
    });
    return grouped;
  }, [doctors, selectedSpec, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">Find Your Doctor</h1>
            <p className="text-slate-600 dark:text-slate-400">Browse specialists and book appointments instantly</p>
          </div>
          <div className="flex items-center gap-3">
            {isAuthed ? (
              <Link href="/patient?tab=doctors">
                <Button variant="gradient" size="lg">Book an Appointment</Button>
              </Link>
            ) : (
              <Link href="/auth?mode=register">
                <Button variant="gradient" size="lg">Get Started</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Symptom Helper Banner */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
           <div className="flex-shrink-0 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shadow-sm text-lg font-bold">?</div>
              <div>
                 <h3 className="font-bold text-indigo-900 dark:text-indigo-100">Not sure who to see?</h3>
                 <p className="text-sm text-indigo-700 dark:text-indigo-300">Select a symptom to find the right specialist.</p>
              </div>
           </div>
           
           <div className="flex flex-wrap gap-2 flex-1">
              {[
                 { label: "Headache", spec: "neurology", emoji: "🤕" },
                 { label: "Stomach Pain", spec: "internal", emoji: "🤢" },
                 { label: "Bone/Joints", spec: "orthopedics", emoji: "🦴" },
                 { label: "Eye Trouble", spec: "ophthalmology", emoji: "👁️" },
                 { label: "Heart Pain", spec: "cardiology", emoji: "❤️" },
                 { label: "General Health", spec: "general", emoji: "🩺" },
              ].map((symptom) => (
                 <button
                    key={symptom.label}
                    onClick={() => { setSelectedSpec(symptom.spec); setSearchQuery(""); }}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white hover:shadow-md transition-all text-sm font-medium border border-indigo-100 dark:border-slate-700"
                 >
                    <span className="mr-2">{symptom.emoji}</span>
                    {symptom.label}
                 </button>
              ))}
           </div>
        </div>

        {/* Search & Filter Section */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Search className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Search by Specialization
            </CardTitle>
            <CardDescription>
              Find the right specialist for your needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or specialization..."
                className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            {/* Specialization Filter Chips */}
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Filter by Specialization:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setSelectedSpec(null); setSearchQuery(""); }}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    !selectedSpec && !searchQuery
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  All Doctors
                </button>
                {SPECIALIZATIONS.map((spec) => {
                  const Icon = spec.icon;
                  const count = doctors.filter((d) =>
                    d.specializations.some((s: any) => s.id === spec.id)
                  ).length;

                  return (
                    <button
                      key={spec.id}
                      onClick={() => { setSelectedSpec(spec.id); setSearchQuery(""); }}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                        selectedSpec === spec.id
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {spec.name}
                      <span className="text-xs opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

{/* End of Filters */}
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <Card className="border-slate-100">
            <CardContent className="p-12 text-center text-slate-500">
              <div className="animate-pulse">Loading doctors...</div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-slate-100">
            <CardContent className="p-6 text-center">
              <div className="text-slate-700">{error}</div>
              <div className="text-sm text-slate-500 mt-2">
                If this is an RLS issue, allow reading doctors from the{" "}
                <code className="px-1 bg-slate-100 rounded">profiles</code> table.
              </div>
              <div className="mt-4">
                <Link href="/auth?mode=register">
                  <Button variant="primary">Get Started</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="border-slate-100">
            <CardContent className="p-12 text-center text-slate-500">
              <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No doctors found</p>
              <p className="text-sm mt-2">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : doctorsBySpec && !selectedSpec && !searchQuery ? (
          // Grouped by specialization view
          <div className="space-y-8">
            {SPECIALIZATIONS.map((spec) => {
              const specDoctors = doctorsBySpec[spec.id];
              if (specDoctors.length === 0) return null;

              const Icon = spec.icon;

              return (
                <div key={spec.id} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white", spec.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{spec.name}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{specDoctors.length} specialists available</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {specDoctors.slice(0, 6).map((doctor) => (
                      <DoctorCard key={doctor.id} doctor={doctor} isAuthed={isAuthed} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Filtered/search results view
          <div>
            <p className="text-sm text-slate-600 mb-4">
              Showing {filtered.length} {filtered.length === 1 ? "doctor" : "doctors"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} isAuthed={isAuthed} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DoctorCard({ doctor, isAuthed }: { doctor: any; isAuthed: boolean }) {
  const name = doctor.full_name || doctor.email || "Doctor";

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-xl hover:dark:shadow-black/20 transition-all duration-300 group overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
            <div className="h-16 w-16 rounded-full overflow-hidden shadow-lg ring-2 ring-slate-100 dark:ring-slate-800">
            <img 
              src={doctor.avatar} 
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 truncate">{name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{doctor.email || ""}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                ⭐ {doctor.rating}
              </span>
              <span>•</span>
              <span>{doctor.experience} yrs exp</span>
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div className="flex flex-wrap gap-2 mb-4">
          {doctor.specializations.slice(0, 2).map((spec: any) => {
            const Icon = spec.icon;
            return (
              <span
                key={spec.id}
                className={cn(
                  "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white",
                  spec.color
                )}
              >
                <Icon className="h-3 w-3" />
                {spec.name}
              </span>
            );
          })}
          {doctor.specializations.length > 2 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              +{doctor.specializations.length - 2} more
            </span>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          {isAuthed ? (
            <Link href="/patient?tab=doctors">
              <Button variant="primary" className="w-full group-hover:shadow-lg transition-shadow">
                Book Appointment
              </Button>
            </Link>
          ) : (
            <Link href="/auth?mode=register">
              <Button variant="outline" className="w-full border-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                Sign Up to Book
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
