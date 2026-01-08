"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/Card";
import { Calendar, Clock, MapPin, Plus, ArrowRight, MessageSquare, Bot, Stethoscope, BadgeCheck } from "lucide-react";
import { ChatInterface } from "@/components/ChatInterface";
import { Input } from "@/components/Input";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { cn } from "@/lib/utils";

export default function PatientDashboard() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PatientDashboardContent />
    </Suspense>
  );
}

function PatientDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [isBooking, setIsBooking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState<string>("");
  const [patientEmail, setPatientEmail] = useState<string>("");
  const [patientRole, setPatientRole] = useState<string>("");
  const [patientId, setPatientId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<
    Array<{
      id: string;
      scheduled_at: string;
      status: string;
      doctor: { full_name: string | null; email: string | null } | null;
    }>
  >([]);

  const loadAppointments = async (uid: string) => {
    const { data: appts } = await supabase
      .from('appointments')
      .select('id, scheduled_at, status, doctor:doctor_id (full_name, email)')
      .eq('patient_id', uid)
      .order('scheduled_at', { ascending: true });

    setAppointments((appts as any) ?? []);
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    setIsBooking(tab === 'doctors');
  }, [searchParams]);

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth');
          return;
        }

        setPatientId(user.id);
        setPatientEmail(user.email || "");

        // Fetch profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single();

        if (profile) {
          setPatientName(profile.full_name || user.email || "Patient");
          setPatientRole(profile.role || "");
          
          // Verify role
          if (profile.role !== 'patient') {
            router.push('/doctor');
            return;
          }
        }

        await loadAppointments(user.id);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [router, supabase]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  const cancelAppointment = async (id: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      console.error('Failed to cancel appointment:', error);
      return;
    }

    if (patientId) {
      await loadAppointments(patientId);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Header */}
      <div className="relative rounded-3xl bg-indigo-600 overflow-hidden shadow-2xl">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579684385180-7352e6d630d4?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center mix-blend-overlay opacity-20" />
         <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-transparent" />
         
         <div className="relative z-10 p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
               <h1 className="text-3xl font-bold text-white mb-2">Good Morning, {patientName}!</h1>
               <p className="text-indigo-100 max-w-lg">You have <span className="font-bold text-white">{appointments.length} upcoming appointments</span>. Your health score is looking great today.</p>
            </div>
             <div className="flex items-center gap-3">
               <Button 
                  size="lg" 
                  variant="outline"
                  className="bg-white/80 text-indigo-900 border-white/40 hover:bg-white shadow-sm"
                  onClick={() => router.push(searchParams.get('tab') === 'assistant' ? '/patient' : '/patient?tab=assistant')}
               >
                  {searchParams.get('tab') === 'assistant' ? "Back to Dashboard" : "Talk to Dr. AI"} <MessageSquare className="ml-2 h-4 w-4" />
               </Button>
            <Button 
               size="lg" 
               className="bg-white text-indigo-900 border-0 hover:bg-indigo-50 shadow-xl"
               onClick={() => router.push(isBooking ? '/patient' : '/patient?tab=doctors')}
            >
               {isBooking ? "View Appointments" : "Book New Appointment"} <Plus className="ml-2 h-4 w-4" />
            </Button>
             </div>
         </div>
      </div>

      {searchParams.get('tab') === 'assistant' ? (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
           <ChatInterface 
              initialMode={searchParams.get('mode') === 'triage' ? 'triage' : 'normal'}
              onBookDoctor={(spec) => {
                 router.push(`/patient?tab=doctors&spec=${spec}`);
              }} 
           />
        </div>
      ) : isBooking ? (
        <BookingSection
          initialSpecialization={searchParams.get('spec')}
          onBooked={async () => {
             if (patientId) {
               await loadAppointments(patientId);
             }
             router.push('/patient');
          }}
        />
      ) : searchParams.get('tab') === 'profile' ? (
        <div className="max-w-3xl mx-auto">
          <Card className="border-slate-100">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-slate-500">Name</div>
              <div className="font-semibold text-slate-900">{patientName}</div>
              <div className="text-sm text-slate-500 mt-4">Email</div>
              <div className="font-semibold text-slate-900">{patientEmail || '—'}</div>
              <div className="text-sm text-slate-500 mt-4">Role</div>
              <div className="font-semibold text-slate-900">{patientRole || 'patient'}</div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:border-red-300" onClick={handleLogout}>
                Logout
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Your Appointments</h2>
              <div className="flex gap-2">
                 <Button variant="ghost" size="sm" className="text-slate-500">History</Button>
                 <Button variant="ghost" size="sm" className="text-indigo-600 bg-indigo-50">Upcoming</Button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.map((apt) => {
                 const dt = new Date(apt.scheduled_at);
                 const date = dt.toLocaleDateString();
                 const time = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                 const doctorName = apt.doctor?.full_name || apt.doctor?.email || 'Doctor';

                 return (
                 <Card key={apt.id} className="group overflow-hidden border-slate-100 bg-white/60 hover:bg-white">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                       <div className="h-14 w-14 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-500 font-bold">
                          {doctorName.slice(0, 1).toUpperCase()}
                       </div>
                       <div>
                          <CardTitle className="text-lg">{doctorName}</CardTitle>
                          <p className="text-sm text-indigo-600 font-medium">{apt.status}</p>
                       </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                       <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                          <Calendar className="mr-3 h-4 w-4 text-slate-400" />
                          <span className="font-medium">{date}</span>
                       </div>
                       <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                          <Clock className="mr-3 h-4 w-4 text-slate-400" />
                          <span className="font-medium">{time}</span>
                       </div>
                       <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                          <MapPin className="mr-3 h-4 w-4 text-slate-400" />
                          <span className="truncate">Online / Clinic</span>
                       </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                       <Button variant="outline" className="w-full text-xs h-9 border-slate-200">Reschedule</Button>
                       <Button
                          variant="ghost"
                          className="w-full text-xs h-9 text-red-600 hover:bg-red-50 hover:text-red-700 ml-2"
                          onClick={() => cancelAppointment(apt.id)}
                       >
                          Cancel
                       </Button>
                    </CardFooter>
                 </Card>
                 )
              })}
              
              {/* Add New Placeholder Card */}
              <button 
                 onClick={() => setIsBooking(true)}
                 className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-indigo-300 transition-all group h-full min-h-[300px]"
              >
                  <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <Plus className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Book New Appointment</h3>
                  <p className="text-sm text-slate-500 mt-1">Find a specialist near you</p>
              </button>
           </div>
        </div>
      )}
    </div>
  );
}

function BookingSection({
  onBooked,
  initialSpecialization,
}: {
  onBooked?: () => Promise<void> | void;
  initialSpecialization?: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"concern" | "condition">("concern");
  const [concerns, setConcerns] = useState<Array<{ id: string; name: string }>>([]);
  const [conditions, setConditions] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedConcernId, setSelectedConcernId] = useState<string | null>(null);
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>(null);
  const [patientNote, setPatientNote] = useState<string>("");
  const [doctors, setDoctors] = useState<
    Array<{ 
      id: string; 
      full_name: string | null; 
      email?: string | null; 
      recommended?: boolean;
      specialization?: string;
    }>
  >([]);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [activeSpecialization, setActiveSpecialization] = useState<string | null>(initialSpecialization || null);
  const [loadingLists, setLoadingLists] = useState<boolean>(true);
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(false);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [creatingAppointment, setCreatingAppointment] = useState<boolean>(false);
  const [appointmentError, setAppointmentError] = useState<string | null>(null);
  const [appointmentCreated, setAppointmentCreated] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadLists() {
      setLoadingLists(true);
      try {
        const [{ data: concernsData }, { data: conditionsData }] = await Promise.all([
          supabase.from('concerns').select('id,name').order('name', { ascending: true }),
          supabase.from('diseases').select('id,name').order('name', { ascending: true }), // Keeping table name 'diseases' but mapping to conditions
        ]);

        if (!isMounted) return;
        
        const baseConcerns = (concernsData as any) ?? [];
        const baseConditions = (conditionsData as any) ?? [];

        // Appending common ones to "make the list long" and adding special options
        const extraConcerns = [
          { id: 'fever', name: 'Fever & Cold' },
          { id: 'mental', name: 'Mental Health / Stress' },
          { id: 'digestive', name: 'Digestive Issues' },
          { id: 'skin', name: 'Skin Rashes / Acne' },
          { id: 'sports', name: 'Sports Injury / Muscle Pain' },
          { id: 'routine', name: 'Routine Checkup' },
          { id: 'vaccine', name: 'Vaccination' },
        ];

        const extraConditions = [
          { id: 'htn', name: 'Hypertension (High BP)' },
          { id: 'diabetes', name: 'Type 2 Diabetes' },
          { id: 'asthma', name: 'Asthma / Breathing' },
          { id: 'anxiety', name: 'Anxiety / Depression' },
          { id: 'migraine', name: 'Migraine / Chronic Headache' },
        ];

        const combinedConcerns = [...baseConcerns, ...extraConcerns, { id: 'other', name: 'Other...' }, { id: 'chatbot', name: '✨ I\'m not sure (Ask Dr. AI)' }];
        const combinedConditions = [...baseConditions, ...extraConditions, { id: 'other', name: 'Other...' }, { id: 'chatbot', name: '✨ I\'m not sure (Ask Dr. AI)' }];

        // Deduplicate to prevent key collisions
        const finalConcerns = Array.from(new Map(combinedConcerns.map(item => [item.id, item])).values());
        const finalConditions = Array.from(new Map(combinedConditions.map(item => [item.id, item])).values());

        setConcerns(finalConcerns);
        setConditions(finalConditions);
      } finally {
        if (isMounted) setLoadingLists(false);
      }
    }

    loadLists();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    async function loadDoctors() {
      setLoadingDoctors(true);
      
      const getMockDoctors = (spec?: string | null) => {
        const allMocks = [
          { id: 'mock1', full_name: 'Dr. Sarah Mitchell', email: 'sarah@mock.com', specialization: 'Cardiology', recommended: false },
          { id: 'mock2', full_name: 'Dr. James Wilson', email: 'james@mock.com', specialization: 'Neurology', recommended: false },
          { id: 'mock3', full_name: 'Dr. Emily Chen', email: 'emily@mock.com', specialization: 'General Practice', recommended: false },
          { id: 'mock4', full_name: 'Dr. Michael Brown', email: 'michael@mock.com', specialization: 'Dermatology', recommended: false },
          { id: 'mock5', full_name: 'Dr. Lisa Ray', email: 'lisa@mock.com', specialization: 'Pediatrics', recommended: false },
          { id: 'mock6', full_name: 'Dr. Robert Fox', email: 'robert@mock.com', specialization: 'Mental Health', recommended: false },
        ];
        if (!spec) return allMocks.slice(0, 3);
        const filtered = allMocks.filter(m => m.specialization.toLowerCase().includes(spec.toLowerCase()));
        return filtered.length > 0 ? filtered : allMocks.slice(2, 5);
      };

      try {
        let realDoctors: any[] = [];
        let currentSpec: string | null = activeSpecialization;

        if (activeSpecialization) {
          const { data } = await supabase
            .from('profiles')
            .select('id, full_name, email, specialization')
            .eq('role', 'doctor')
            .ilike('specialization', `%${activeSpecialization}%`);
          realDoctors = data ?? [];
        } else if (mode === 'concern' && selectedConcernId) {
          const { data } = await supabase
            .from('doctor_concerns')
            .select('doctor_id, profiles:doctor_id (id, full_name, email, specialization)')
            .eq('concern_id', selectedConcernId);
          realDoctors = (data ?? []).map((row: any) => row.profiles).filter(Boolean);
        } else if (mode === 'condition' && selectedConditionId) {
          const { data } = await supabase
            .from('doctor_diseases')
            .select('doctor_id, profiles:doctor_id (id, full_name, email, specialization)')
            .eq('disease_id', selectedConditionId);
          realDoctors = (data ?? []).map((row: any) => row.profiles).filter(Boolean);
        }

        if (!isMounted) return;

        const recommended = realDoctors.map(d => ({ ...d, recommended: true }));
        const mocks = getMockDoctors(currentSpec);
        
        const finalDoctors = [
          ...recommended,
          ...mocks.filter(m => !recommended.find(r => r.full_name === m.full_name))
        ];

        setDoctors(finalDoctors);
      } finally {
        if (isMounted) setLoadingDoctors(false);
      }
    }

    loadDoctors();

    return () => {
      isMounted = false;
    };
  }, [mode, selectedConcernId, selectedConditionId, activeSpecialization, supabase]);

  useEffect(() => {
    setShowSchedule(false);
    setAppointmentError(null);
    setAppointmentCreated(false);
  }, [selectedDoc]);

  const createAppointment = async () => {
    setAppointmentError(null);
    setAppointmentCreated(false);

    if (!selectedDoc) {
      setAppointmentError("Please choose a doctor.");
      return;
    }

    if (!appointmentDate || !appointmentTime) {
      setAppointmentError("Please select a date and time.");
      return;
    }

    const scheduledAtIso = new Date(`${appointmentDate}T${appointmentTime}:00`).toISOString();

    setCreatingAppointment(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) {
        setAppointmentError("You must be logged in to book.");
        return;
      }

      const { error: insertError } = await supabase.from('appointments').insert({
        patient_id: authData.user.id,
        doctor_id: selectedDoc,
        scheduled_at: scheduledAtIso,
        patient_note: patientNote || null,
        concern_id: mode === 'concern' ? selectedConcernId : null,
        disease_id: mode === 'condition' ? selectedConditionId : null,
        status: 'requested',
      });

      if (insertError) throw insertError;

      setAppointmentCreated(true);

      if (onBooked) {
        await onBooked();
      }
    } catch (err: any) {
      setAppointmentError(err?.message || "Failed to create appointment.");
    } finally {
      setCreatingAppointment(false);
    }
  };

  return (
     <div className="animate-in fade-in zoom-in-95 duration-300">
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
               <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">1</span>
               {activeSpecialization ? `Recommended specialists` : "Select a Specialist"}
            </h2>
            {activeSpecialization && (
               <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setActiveSpecialization(null)}
                  className="text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50"
               >
                  Change Category
               </Button>
            )}
         </div>

         {!activeSpecialization && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
               <Card className="border-slate-100 shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden group">
                  <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <CardContent className="p-6 space-y-6">
                     <div>
                       <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Selection Type</h4>
                       <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                           <Button
                              variant={mode === "concern" ? "primary" : "ghost"}
                              size="sm"
                              className="flex-1 rounded-xl transition-all"
                              onClick={() => {
                                setMode("concern");
                                setSelectedConditionId(null);
                              }}
                           >
                              General Concern
                           </Button>
                           <Button
                              variant={mode === "condition" ? "primary" : "ghost"}
                              size="sm"
                              className="flex-1 rounded-xl transition-all"
                              onClick={() => {
                                setMode("condition");
                                setSelectedConcernId(null);
                              }}
                           >
                              Specific Condition
                           </Button>
                       </div>
                     </div>

                     {mode === 'concern' ? (
                        <div className="space-y-3">
                           <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                              <Bot className="h-4 w-4 text-indigo-500" /> Choose a concern
                           </label>
                           <select
                              value={selectedConcernId ?? ""}
                              onChange={(e) => {
                                 if (e.target.value === 'chatbot') {
                                    router.push('/patient?tab=assistant&mode=triage');
                                    return;
                                 }
                                 setSelectedConcernId(e.target.value || null);
                              }}
                              className="w-full h-12 rounded-xl border-2 border-slate-100 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                              disabled={loadingLists}
                           >
                              <option value="">Select a concern...</option>
                              {concerns.map((c) => (
                                 <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                           </select>
                        </div>
                     ) : (
                        <div className="space-y-3">
                           <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                              <Stethoscope className="h-4 w-4 text-indigo-500" /> Choose a condition
                           </label>
                           <select
                              value={selectedConditionId ?? ""}
                              onChange={(e) => {
                                 if (e.target.value === 'chatbot') {
                                    router.push('/patient?tab=assistant&mode=triage');
                                    return;
                                 }
                                 setSelectedConditionId(e.target.value || null);
                              }}
                              className="w-full h-12 rounded-xl border-2 border-slate-100 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                              disabled={loadingLists}
                           >
                              <option value="">Select known condition...</option>
                              {conditions.map((d) => (
                                 <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                           </select>
                        </div>
                     )}

                     <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                           <label className="text-sm font-semibold text-slate-700">Detailed Message (Optional)</label>
                           <button 
                              onClick={() => router.push('/patient?tab=assistant&mode=triage')}
                              className="text-[10px] font-bold uppercase tracking-tight text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 px-2 py-1 bg-indigo-50 rounded-lg transition-colors"
                           >
                              <MessageSquare className="h-3 w-3" />
                              Need Help?
                           </button>
                        </div>
                        <Input
                           value={patientNote}
                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPatientNote(e.target.value)}
                           placeholder="Tell the doctor more about your symptoms..."
                           className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        />
                     </div>
                  </CardContent>
               </Card>
            </div>
         )}

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingDoctors ? (
               <Card className="border-slate-100">
                  <CardContent className="p-6 text-center text-slate-500">Loading doctors…</CardContent>
               </Card>
            ) : doctors.length === 0 ? (
               <Card className="border-slate-100">
                  <CardContent className="p-6 text-center text-slate-500">
                     Select a {mode === 'concern' ? 'concern' : 'condition'} to see matching doctors.
                  </CardContent>
               </Card>
            ) : (
            doctors.map(doc => (
               <Card 
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc.id)}
                  className={cn(
                     "cursor-pointer transition-all border-2 rounded-2xl overflow-hidden hover:shadow-lg", 
                      selectedDoc === doc.id ? "border-indigo-600 ring-4 ring-indigo-500/10 shadow-xl scale-[1.02]" : "border-transparent"
                  )}
               >
                  <CardContent className="p-6 flex flex-col items-center text-center">
                     <div className="relative group">
                        <div className="h-24 w-24 rounded-full bg-slate-100 mb-4 shadow-md flex items-center justify-center text-slate-400 font-bold border-2 border-white">
                           {(doc.full_name || doc.email || "D").slice(0, 1).toUpperCase()}
                        </div>
                        {doc.recommended && (
                           <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-indigo-50">
                              <BadgeCheck className="h-6 w-6 text-indigo-600 fill-indigo-50" />
                           </div>
                        )}
                     </div>
                     <div className="flex flex-col items-center gap-1 mb-3">
                        {doc.recommended && (
                           <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 mb-1">
                              Recommended
                           </span>
                        )}
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">{doc.full_name || doc.email || "Doctor"}</h3>
                     </div>
                     <p className="text-slate-500 text-xs font-medium mb-4">{doc.specialization || "Medical Specialist"}</p>
                     
                     <div className="w-full grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4">
                        <div className="bg-slate-50 p-2 rounded">4.9 ★ Rating</div>
                        <div className="bg-slate-50 p-2 rounded">15+ Yrs Exp.</div>
                     </div>
                     
                     <Button 
                        variant={selectedDoc === doc.id ? "primary" : "outline"} 
                        className="w-full rounded-xl"
                     >
                        {selectedDoc === doc.id ? "Selected" : "Choose Doctor"}
                     </Button>
                  </CardContent>
               </Card>
            ))) }
         </div>
         
         {selectedDoc && (
            <div className="fixed bottom-8 left-0 right-0 flex justify-center animate-in slide-in-from-bottom-10 pointer-events-none">
               <Card className="pointer-events-auto shadow-2xl bg-slate-900 text-white border-0 flex items-center gap-6 p-4 rounded-full min-w-[320px]">
                  <div className="pl-4">
                     <p className="text-xs text-slate-400">Next Step</p>
                     <p className="font-bold">Choose Date & Time</p>
                  </div>
                  <Button
                     variant="primary"
                     className="rounded-full px-8 bg-white text-slate-900 hover:bg-slate-200 shadow-none"
                     onClick={() => setShowSchedule(true)}
                  >
                     Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
               </Card>
            </div>
         )}

         {showSchedule && selectedDoc && (
            <div className="mt-8">
               <Card className="border-slate-100">
                  <CardHeader>
                     <CardTitle>Pick a date & time</CardTitle>
                     <CardDescription>We’ll send your note to the doctor. The doctor will confirm during consultation.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <p className="text-sm font-medium text-slate-700">Date</p>
                           <Input
                              type="date"
                              value={appointmentDate}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAppointmentDate(e.target.value)}
                           />
                        </div>
                        <div className="space-y-2">
                           <p className="text-sm font-medium text-slate-700">Time</p>
                           <Input
                              type="time"
                              value={appointmentTime}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAppointmentTime(e.target.value)}
                           />
                        </div>
                     </div>

                     {appointmentError && (
                        <div className="text-sm text-red-600">{appointmentError}</div>
                     )}
                     {appointmentCreated && (
                        <div className="text-sm text-green-600">Appointment request sent.</div>
                     )}
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                     <Button variant="ghost" onClick={() => setShowSchedule(false)}>
                        Back
                     </Button>
                     <Button variant="primary" onClick={createAppointment} disabled={creatingAppointment}>
                        {creatingAppointment ? "Booking…" : "Book Appointment"}
                     </Button>
                  </CardFooter>
               </Card>
            </div>
         )}
     </div>
  )
}
