"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/Card";
import { Calendar, Clock, Users, DollarSign, Activity, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/Input";
import { cn } from "@/lib/utils";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

// Mock Data
const stats = [
  { title: "Total Patients", value: "1,240", change: "+12%", icon: Users, color: "bg-blue-500" },
  { title: "Appointments", value: "86", change: "Today", icon: Calendar, color: "bg-indigo-500" },
  { title: "Revenue", value: "$4,200", change: "This Week", icon: DollarSign, color: "bg-green-500" },
];

export default function DoctorDashboard() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DoctorDashboardContent />
    </Suspense>
  );
}

function DoctorDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"overview" | "schedule" | "appointments" | "profile">("overview");
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState<string>("");
  const [doctorEmail, setDoctorEmail] = useState<string>("");
  const [doctorRole, setDoctorRole] = useState<string>("");
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<
    Array<{
      id: string;
      scheduled_at: string;
      status: string;
      patient_note: string | null;
      patient: { full_name: string | null; email: string | null } | null;
    }>
  >([]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'schedule') {
      setActiveTab('schedule');
      return;
    }
    if (tab === 'appointments') {
      setActiveTab('appointments');
      return;
    }
    if (tab === 'profile') {
      setActiveTab('profile');
      return;
    }
    setActiveTab('overview');
  }, [searchParams]);

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth');
          return;
        }

        setDoctorId(user.id);
        setDoctorEmail(user.email || "");

        // Fetch profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single();

        if (profile) {
          setDoctorName(profile.full_name || user.email || "Doctor");
          setDoctorRole(profile.role || "");
          
          // Verify role
          if (profile.role !== 'doctor') {
            router.push('/patient');
            return;
          }
        }

        const { data: appts } = await supabase
          .from('appointments')
          .select('id, scheduled_at, status, patient_note, patient:patient_id (full_name, email)')
          .eq('doctor_id', user.id)
          .order('scheduled_at', { ascending: true });

        setAppointments((appts as any) ?? []);
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

  const updateAppointmentStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Failed to update appointment:', error);
      return;
    }

    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">Doctor Portal</h1>
           <p className="text-slate-500">Welcome back, Dr. {doctorName}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
             <Button 
                variant={activeTab === "overview" ? "primary" : "ghost"} 
                size="sm"
                onClick={() => router.push('/doctor')}
             >
                Overview
             </Button>
             <Button 
                variant={activeTab === "schedule" ? "primary" : "ghost"} 
                size="sm"
                onClick={() => router.push('/doctor?tab=schedule')}
             >
                Schedule & Slots
             </Button>
          </div>
           <Button 
             variant="outline" 
             size="sm"
             onClick={() => router.push('/')}
             className="text-slate-600 hover:text-indigo-600 hover:border-indigo-300"
           >
             Home
           </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
            className="text-slate-600 hover:text-red-600 hover:border-red-300"
          >
            Logout
          </Button>
        </div>
      </div>

      {activeTab === "overview" ? (
        <OverviewTab
          appointments={appointments}
          updateAppointmentStatus={updateAppointmentStatus}
        />
      ) : activeTab === "appointments" ? (
        <AppointmentsTab
          appointments={appointments}
          updateAppointmentStatus={updateAppointmentStatus}
        />
      ) : activeTab === "profile" ? (
        <ProfileTab
          doctorName={doctorName}
          doctorEmail={doctorEmail}
          doctorRole={doctorRole}
          onLogout={handleLogout}
        />
      ) : (
        <ScheduleTab doctorId={doctorId} />
      )}
    </div>
  );
}

function AppointmentsTab({
  appointments,
  updateAppointmentStatus,
}: {
  appointments: Array<{
    id: string;
    scheduled_at: string;
    status: string;
    patient_note: string | null;
    patient: { full_name: string | null; email: string | null } | null;
  }>;
  updateAppointmentStatus: (id: string, status: string) => Promise<void> | void;
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Appointments</h2>
      </div>

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <Card className="border-slate-100">
            <CardContent className="p-6 text-center text-slate-500">No appointments yet.</CardContent>
          </Card>
        ) : (
          appointments.map((apt) => {
            const dt = new Date(apt.scheduled_at);
            const date = dt.toLocaleDateString();
            const time = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const patientName = apt.patient?.full_name || apt.patient?.email || 'Patient';
            const canConfirm = apt.status === 'requested';

            return (
              <Card key={apt.id} className="border-slate-100">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                    {patientName.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 truncate">{patientName}</div>
                    <div className="text-sm text-slate-500 truncate">{apt.patient_note || apt.status}</div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div className="text-xs text-slate-500 mr-2 hidden sm:block">
                      {date}
                    </div>
                    <span className="flex items-center text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                      <Clock className="w-3 h-3 mr-1" /> {time}
                    </span>
                    {canConfirm && (
                      <Button size="sm" variant="primary" onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}>
                        Confirm
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

function ProfileTab({
  doctorName,
  doctorEmail,
  doctorRole,
  onLogout,
}: {
  doctorName: string;
  doctorEmail: string;
  doctorRole: string;
  onLogout: () => Promise<void> | void;
}) {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-slate-100">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-slate-500">Name</div>
          <div className="font-semibold text-slate-900">{doctorName}</div>
          <div className="text-sm text-slate-500 mt-4">Email</div>
          <div className="font-semibold text-slate-900">{doctorEmail || '—'}</div>
          <div className="text-sm text-slate-500 mt-4">Role</div>
          <div className="font-semibold text-slate-900">{doctorRole || 'doctor'}</div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" className="text-red-600 hover:text-red-700 hover:border-red-300" onClick={onLogout}>
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function OverviewTab({
  appointments,
  updateAppointmentStatus,
}: {
  appointments: Array<{
    id: string;
    scheduled_at: string;
    status: string;
    patient_note: string | null;
    patient: { full_name: string | null; email: string | null } | null;
  }>;
  updateAppointmentStatus: (id: string, status: string) => Promise<void> | void;
}) {
   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
         {/* Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
               <Card key={i} className="border-0 shadow-lg shadow-indigo-100">
                  <CardContent className="p-6 flex items-center justify-between">
                     <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                        <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                           {stat.change}
                        </span>
                     </div>
                     <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
                        <stat.icon className="h-6 w-6" />
                     </div>
                  </CardContent>
               </Card>
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Today's Appointments */}
            <div className="lg:col-span-2 space-y-6">
               <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Today's Schedule</h2>
                  <Button variant="ghost" className="text-indigo-600">View All</Button>
               </div>
               <div className="space-y-4">
                  {appointments.length === 0 ? (
                     <Card className="border-slate-100">
                        <CardContent className="p-6 text-center text-slate-500">No appointments yet.</CardContent>
                     </Card>
                  ) : (
                  appointments.map((apt) => {
                     const dt = new Date(apt.scheduled_at);
                     const time = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                     const patientName = apt.patient?.full_name || apt.patient?.email || 'Patient';
                     const canConfirm = apt.status === 'requested';

                     return (
                     <Card key={apt.id} className="group border-slate-100 hover:shadow-md transition-all">
                        <CardContent className="p-4 flex items-center gap-4">
                           <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                              {patientName.slice(0, 1).toUpperCase()}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 truncate">{patientName}</h4>
                              <p className="text-sm text-slate-500 truncate">{apt.patient_note || apt.status}</p>
                           </div>
                           <div className="text-right flex items-center gap-2">
                              <span className="flex items-center text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                 <Clock className="w-3 h-3 mr-1" /> {time}
                              </span>
                              {canConfirm && (
                                <Button size="sm" variant="primary" onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}>Confirm</Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                              >
                                Cancel
                              </Button>
                           </div>
                           <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                           </Button>
                        </CardContent>
                     </Card>
                     )
                  }))}
               </div>
            </div>

            {/* Recent Activity / Notifications */}
            <div className="space-y-6">
               <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
               <Card className="bg-gradient-to-br from-indigo-900 to-violet-900 text-white border-0 shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                  <CardContent className="p-6 relative z-10">
                     <h3 className="text-lg font-bold mb-2">Availability</h3>
                     <p className="text-indigo-200 text-sm mb-6">Update your weekly schedule slots.</p>
                     <Button size="sm" className="w-full bg-white text-indigo-900 hover:bg-white/90 border-0">Manage Slots</Button>
                  </CardContent>
               </Card>

                <Card className="border-dashed border-2 border-slate-200 bg-slate-50">
                   <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
                         <Plus className="h-5 w-5" />
                      </div>
                      <h4 className="font-semibold text-slate-900">Add Patient Note</h4>
                      <p className="text-xs text-slate-500 mb-4">Quickly log a visit summary</p>
                      <Button variant="outline" size="sm" className="w-full">Create Note</Button>
                   </CardContent>
                </Card>
            </div>
         </div>
      </div>
   )
}

function ScheduleTab({ doctorId }: { doctorId: string | null }) {
   const supabase = createClient();
   const [slots, setSlots] = useState([
      { id: 1, day: "Monday", start: "09:00", end: "17:00" },
      { id: 2, day: "Wednesday", start: "09:00", end: "13:00" },
      { id: 3, day: "Friday", start: "10:00", end: "16:00" },
   ]);

   const [concerns, setConcerns] = useState<Array<{ id: string; name: string }>>([]);
   const [diseases, setDiseases] = useState<Array<{ id: string; name: string }>>([]);
   const [selectedConcernId, setSelectedConcernId] = useState<string>("");
   const [selectedDiseaseId, setSelectedDiseaseId] = useState<string>("");
   const [myConcerns, setMyConcerns] = useState<Array<{ id: string; name: string }>>([]);
   const [myDiseases, setMyDiseases] = useState<Array<{ id: string; name: string }>>([]);
   const [loadingExpertise, setLoadingExpertise] = useState<boolean>(true);

   const addSlot = () => {
      const newSlot = { 
         id: Math.random(), 
         day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][Math.floor(Math.random() * 5)], 
         start: "09:00", 
         end: "17:00" 
      };
      setSlots([...slots, newSlot]);
   };

   const deleteSlot = (id: number) => {
      setSlots(slots.filter(s => s.id !== id));
   };

   useEffect(() => {
      let isMounted = true;

      async function loadExpertise() {
         if (!doctorId) {
            if (isMounted) {
               setMyConcerns([]);
               setMyDiseases([]);
               setLoadingExpertise(false);
            }
            return;
         }

         setLoadingExpertise(true);
         try {
            const [{ data: concernsData }, { data: diseasesData }, { data: myConcernsData }, { data: myDiseasesData }] =
               await Promise.all([
                  supabase.from('concerns').select('id,name').order('name', { ascending: true }),
                  supabase.from('diseases').select('id,name').order('name', { ascending: true }),
                  supabase
                     .from('doctor_concerns')
                     .select('concern:concern_id (id, name)')
                     .eq('doctor_id', doctorId),
                  supabase
                     .from('doctor_diseases')
                     .select('disease:disease_id (id, name)')
                     .eq('doctor_id', doctorId),
               ]);

            if (!isMounted) return;

            setConcerns((concernsData as any) ?? []);
            setDiseases((diseasesData as any) ?? []);
            setMyConcerns((((myConcernsData as any) ?? []).map((r: any) => r.concern).filter(Boolean)) ?? []);
            setMyDiseases((((myDiseasesData as any) ?? []).map((r: any) => r.disease).filter(Boolean)) ?? []);
         } finally {
            if (isMounted) setLoadingExpertise(false);
         }
      }

      loadExpertise();

      return () => {
         isMounted = false;
      };
   }, [doctorId, supabase]);

   const addConcern = async () => {
      if (!doctorId || !selectedConcernId) return;

      const { error } = await supabase.from('doctor_concerns').insert({
         doctor_id: doctorId,
         concern_id: selectedConcernId,
      });

      if (error) {
         console.error('Failed to add concern:', error);
         return;
      }

      const picked = concerns.find((c) => c.id === selectedConcernId);
      if (picked && !myConcerns.some((c) => c.id === picked.id)) {
         setMyConcerns((prev) => [...prev, picked]);
      }
      setSelectedConcernId("");
   };

   const removeConcern = async (concernId: string) => {
      if (!doctorId) return;

      const { error } = await supabase
         .from('doctor_concerns')
         .delete()
         .eq('doctor_id', doctorId)
         .eq('concern_id', concernId);

      if (error) {
         console.error('Failed to remove concern:', error);
         return;
      }

      setMyConcerns((prev) => prev.filter((c) => c.id !== concernId));
   };

   const addDisease = async () => {
      if (!doctorId || !selectedDiseaseId) return;

      const { error } = await supabase.from('doctor_diseases').insert({
         doctor_id: doctorId,
         disease_id: selectedDiseaseId,
      });

      if (error) {
         console.error('Failed to add disease:', error);
         return;
      }

      const picked = diseases.find((d) => d.id === selectedDiseaseId);
      if (picked && !myDiseases.some((d) => d.id === picked.id)) {
         setMyDiseases((prev) => [...prev, picked]);
      }
      setSelectedDiseaseId("");
   };

   const removeDisease = async (diseaseId: string) => {
      if (!doctorId) return;

      const { error } = await supabase
         .from('doctor_diseases')
         .delete()
         .eq('doctor_id', doctorId)
         .eq('disease_id', diseaseId);

      if (error) {
         console.error('Failed to remove disease:', error);
         return;
      }

      setMyDiseases((prev) => prev.filter((d) => d.id !== diseaseId));
   };

   return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
         <Card className="border-0 shadow-lg">
            <CardHeader>
               <CardTitle>Services & Expertise</CardTitle>
               <CardDescription>Choose concerns and diseases you handle so patients can find you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               {loadingExpertise ? (
                  <div className="text-slate-500">Loading…</div>
               ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                     <div className="flex items-end gap-2">
                        <div className="flex-1">
                           <p className="text-sm font-medium text-slate-700 mb-2">Concerns</p>
                           <select
                              value={selectedConcernId}
                              onChange={(e) => setSelectedConcernId(e.target.value)}
                              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                              disabled={!doctorId}
                           >
                              <option value="">Select…</option>
                              {concerns.map((c) => (
                                 <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                           </select>
                        </div>
                        <Button variant="primary" size="sm" onClick={addConcern} disabled={!doctorId || !selectedConcernId}>
                           Add
                        </Button>
                     </div>

                     <div className="space-y-2">
                        {myConcerns.length === 0 ? (
                           <div className="text-sm text-slate-500">No concerns selected.</div>
                        ) : (
                        myConcerns.map((c) => (
                           <div key={c.id} className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="font-medium text-slate-900 truncate">{c.name}</div>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => removeConcern(c.id)}>
                                 Remove
                              </Button>
                           </div>
                        ))) }
                     </div>
                  </div>

                  <div className="space-y-3">
                     <div className="flex items-end gap-2">
                        <div className="flex-1">
                           <p className="text-sm font-medium text-slate-700 mb-2">Diseases</p>
                           <select
                              value={selectedDiseaseId}
                              onChange={(e) => setSelectedDiseaseId(e.target.value)}
                              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                              disabled={!doctorId}
                           >
                              <option value="">Select…</option>
                              {diseases.map((d) => (
                                 <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                           </select>
                        </div>
                        <Button variant="primary" size="sm" onClick={addDisease} disabled={!doctorId || !selectedDiseaseId}>
                           Add
                        </Button>
                     </div>

                     <div className="space-y-2">
                        {myDiseases.length === 0 ? (
                           <div className="text-sm text-slate-500">No diseases selected.</div>
                        ) : (
                        myDiseases.map((d) => (
                           <div key={d.id} className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="font-medium text-slate-900 truncate">{d.name}</div>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => removeDisease(d.id)}>
                                 Remove
                              </Button>
                           </div>
                        ))) }
                     </div>
                  </div>
               </div>
               )}
            </CardContent>
         </Card>

         <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
               <div>
                  <CardTitle>Weekly Availability</CardTitle>
                  <CardDescription>Manage your recurring appointment slots.</CardDescription>
               </div>
               <Button onClick={addSlot} variant="gradient" size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Add Slot
               </Button>
            </CardHeader>
            <CardContent className="space-y-4">
               {slots.length === 0 && (
                  <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                     <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                     <p>No availability slots configured.</p>
                  </div>
               )}
               {slots.map((slot) => (
                  <div key={slot.id} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                     <div className="w-32 font-bold text-slate-900 bg-indigo-50 px-3 py-1 rounded-lg text-center">{slot.day}</div>
                     <div className="flex-1 flex items-center gap-4">
                        <div className="w-32">
                           <Input type="time" defaultValue={slot.start} />
                        </div>
                        <span className="text-slate-400">to</span>
                        <div className="w-32">
                           <Input type="time" defaultValue={slot.end} />
                        </div>
                     </div>
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => deleteSlot(slot.id)}
                     >
                        <Trash2 className="h-4 w-4" />
                     </Button>
                  </div>
               ))}
            </CardContent>
            <CardFooter className="bg-slate-50 rounded-b-2xl flex justify-end">
               <Button variant="primary">Save Changes</Button>
            </CardFooter>
         </Card>
      </div>
   )
}
