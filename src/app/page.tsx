import Link from 'next/link';
import { Plus, Briefcase, Users, Calendar, ChevronRight, ArrowRight, Mail, ClipboardCheck, AlertTriangle, Download } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { ExportButton } from '@/components/ui/export-button';
import { PostJobButton } from '@/components/ui/post-job-button';

// force dynamic so it fetches fresh data
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const ms = now.getTime() - date.getTime();
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${Math.max(1, seconds)} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  }

  const { count: totalApplicants } = await supabaseAdmin
    .from('candidate_analysis')
    .select('*', { count: 'exact', head: true });

  const { count: activeJobsCount } = await supabaseAdmin
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .ilike('status', '%active%');

  const { count: interviewsCount } = await supabaseAdmin
    .from('candidate_analysis')
    .select('*', { count: 'exact', head: true })
    .ilike('status', '%interview%');

  const { count: inReviewCount } = await supabaseAdmin
    .from('candidate_analysis')
    .select('*', { count: 'exact', head: true })
    .or('status.ilike.%review%,status.is.null');

  const { data: candidates } = await supabaseAdmin
    .from('candidate_analysis')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Talent Overview</h1>

        </div>
        <PostJobButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {/* Metric 1: Enhanced Active Jobs */}
        <Link href="/jobs" className="bg-white p-7 rounded-2xl border border-slate-100 card-hover block group cursor-pointer transition-all hover:border-primary/30">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3.5 bg-primary/5 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Jobs</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-4xl font-extrabold text-slate-900">{activeJobsCount || 0}</h3>
            <span className="text-slate-400 text-xs font-medium">{totalApplicants || 0} total applicants</span>
          </div>
          <div className="mt-6 flex items-center text-sm">
            <span className="text-primary font-bold inline-flex items-center group-hover:underline">
              Manage Listings <ChevronRight className="w-4 h-4 ml-1" />
            </span>
          </div>
        </Link>

        {/* Metric 2 */}
        <div className="bg-white p-7 rounded-2xl border border-slate-100 card-hover">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3.5 bg-secondary-container/30 text-secondary rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Talent Database</p>
          <h3 className="text-4xl font-extrabold text-slate-900">{totalApplicants || 1842}</h3>
          <div className="mt-6 w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
            <div className="bg-secondary h-full w-[85%] rounded-full transition-all duration-700"></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-7 rounded-2xl border border-slate-100 card-hover">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3.5 bg-tertiary-fixed/20 text-tertiary rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Interviews Scheduled</p>
          <h3 className="text-4xl font-extrabold text-slate-900">{interviewsCount || 0}</h3>

        </div>

        {/* Metric 4 */}
        <div className="bg-white p-7 rounded-2xl border border-slate-100 card-hover">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">In Review</p>
          <h3 className="text-4xl font-extrabold text-slate-900">{inReviewCount || 0}</h3>
          <p className="text-xs text-slate-500 mt-6 flex items-center">
            Candidates awaiting evaluation
          </p>
        </div>
      </div>

      {/* Top Candidates section */}
      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Recent Candidates</h2>
              <Link href="/candidates" className="text-primary text-sm font-bold hover:underline flex items-center">
                See All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {candidates && candidates.map((candidate) => {
                let parsedAnalysis: any = {};
                try {
                  if (candidate.structured_resume_analysis) {
                    let val = candidate.structured_resume_analysis;
                    if (typeof val === 'string') {
                        if (val.startsWith('"')) val = JSON.parse(val);
                        parsedAnalysis = JSON.parse(val);
                    }
                  }
                } catch (e) {
                  // silent
                }

                const title = parsedAnalysis.current_title || candidate.current_title || 'Applicant';
                const score = Math.round(candidate.overall_score || 0);

                return (
                  <Link href={`/candidates/${candidate.id}`} key={candidate.id} className="flex items-center p-5 hover:bg-slate-50/80 rounded-2xl transition-all duration-200 cursor-pointer border border-transparent hover:border-slate-100">
                    <div className="relative">
                      <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary font-bold text-xl uppercase shadow-sm">
                        {candidate.candidate_name.charAt(0)}
                      </div>
                      <div className={`absolute -top-2 -right-2 ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-slate-500'} text-[10px] text-white font-bold h-6 w-6 flex items-center justify-center rounded-lg border-2 border-white shadow-sm`}>
                        {score}
                      </div>
                    </div>
                    <div className="ml-5 flex-1">
                      <h4 className="text-base font-bold text-slate-900 capitalize leading-tight">{candidate.candidate_name.toLowerCase()}</h4>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-1">{title}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1.5 ${candidate.recommendation === 'hire' ? 'bg-emerald-50 text-emerald-700' : 'bg-primary/10 text-primary'} text-[10px] font-bold rounded-lg uppercase tracking-widest`}>
                        {candidate.recommendation && candidate.recommendation !== "no_fit" ? candidate.recommendation.substring(0, 15) : 'In Review'}
                      </span>
                    </div>
                  </Link>
                );
              })}
              
              {(!candidates || candidates.length === 0) && (
                <div className="text-center py-6 text-slate-500">
                  <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p>No candidates available yet.</p>
                </div>
              )}
            </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {/* Recent Activity section */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-8 ml-2">Recent Activity</h2>
            <div className="relative pt-2">
              {candidates && candidates.map((candidate, idx) => (
                <div key={candidate.id} className={`relative pl-8 ${idx !== candidates.length - 1 ? 'pb-8 border-l border-slate-100 border-dashed' : ''}`}>
                  <div className="absolute left-[-17px] top-0 w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border-4 border-[#fcfdfe]">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-slate-700">
                    <span className="font-bold text-slate-900">AI Screening</span> processed candidate <span className="text-primary font-bold capitalize">{candidate.candidate_name?.toLowerCase() || 'Applicant'}</span>
                  </p>
                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-2 block tracking-widest">{formatTimeAgo(candidate.created_at)}</span>
                </div>
              ))}
              
              {(!candidates || candidates.length === 0) && (
                <div className="py-4 text-sm text-slate-500 italic text-center">No recent activity found.</div>
              )}
            </div>
          </section>
        </div>

        {/* Right Sidebar Columns */}
        <div className="space-y-8 sticky top-8 self-start">
          <div className="hidden relative overflow-hidden bg-primary rounded-3xl p-8 text-white shadow-2xl shadow-primary/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-6">Retention Index</p>
              <h2 className="text-5xl font-extrabold mb-3 tracking-tighter">98%</h2>
              <p className="text-sm opacity-80 mb-8 leading-relaxed font-medium">Retention is 12% higher than industry average this month.</p>
              <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                <div className="flex justify-between text-xs font-bold mb-3">
                  <span>Placements</span>
                  <span className="opacity-100">42/43</span>
                </div>
                <div className="w-full bg-white/20 h-1.5 rounded-full">
                  <div className="bg-white h-full w-[98%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-widest">Action Items</h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100 flex items-start gap-4 hover:scale-[1.02] transition-transform cursor-pointer">
                <AlertTriangle className="text-red-500 w-5 h-5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900">3 Expiring Listings</p>
                  <p className="text-[11px] text-slate-500 mt-1">Review before Friday deadline</p>
                </div>
              </div>
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4 hover:scale-[1.02] transition-transform cursor-pointer">
                <AlertTriangle className="text-primary w-5 h-5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Urgent Approval</p>
                  <p className="text-[11px] text-slate-500 mt-1">Senior Lead budget approval</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-slate-200">
            <h3 className="font-bold text-lg mb-2">Talent Pipeline</h3>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">Generate a custom analytical report for the board meeting.</p>
            <ExportButton />
          </div>
        </div>
      </div>
    </>
  );
}
