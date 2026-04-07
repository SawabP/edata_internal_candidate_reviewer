import Link from 'next/link';
import { ArrowLeft, Search, Bell, TrendingUp, Minus, TrendingDown, ChevronRight, Users, ExternalLink, Plus, Sparkles } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { SearchBar } from '@/components/ui/search-bar';

export const dynamic = 'force-dynamic';

export default async function JobLeaderboard({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const query = resolvedSearch?.q?.toLowerCase() || '';
  const jobId = parseInt(resolvedParams.id, 10);
  if (isNaN(jobId)) return notFound();

  // Fetch job details
  const { data: job, error: jobError } = await supabaseAdmin
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    return notFound();
  }

  // Fetch candidates for this job
  const { data: candidates } = await supabaseAdmin
    .from('candidate_analysis')
    .select('*')
    .eq('job_id', jobId)
    .order('overall_score', { ascending: false });

  const totalCandidates = candidates?.length || 0;
  
  // Calculate pipeline stats
  let averageScore = 0;
  let pipelineCount = 0;
  if (totalCandidates > 0) {
    averageScore = Math.round((candidates as any[]).reduce((acc, c) => acc + (c.overall_score || 0), 0) / totalCandidates);
    pipelineCount = (candidates as any[]).filter(c => c.recommendation !== 'reject').length;
  }
  
  let displayCandidates = candidates || [];
  if (query) {
    displayCandidates = displayCandidates.filter(c => 
      c.candidate_name?.toLowerCase().includes(query) ||
      c.current_title?.toLowerCase().includes(query) ||
      c.status?.toLowerCase().includes(query) ||
      c.recommendation?.toLowerCase().includes(query)
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* TopNavBar Anchor */}
      <header className="w-full sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 md:px-8 py-4 border border-slate-100 gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/jobs" className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 font-headline tracking-tight">Executive Talent Pipeline</h1>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <SearchBar />
        </div>
      </header>

      {/* Main Workspace */}
      <div className="p-8 w-full flex-1">
        
        {/* Context Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2.5 py-0.5 ${job.status.toLowerCase() === 'active' ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-slate-200 text-slate-600'} text-[10px] font-bold uppercase rounded-md tracking-wider capitalize`}>
              {job.status} Search
            </span>
            <span className="text-slate-400 text-sm">•</span>
            <span className="text-slate-500 text-sm font-medium">Requisition #{job.job_code || `REQ-${job.id}`}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-extrabold text-slate-900 font-headline mb-2 tracking-tight">{job.job_title}</h2>
              <p className="text-slate-500 font-medium line-clamp-1">{job.job_description || 'Remote / GCC'}</p>
            </div>
            <div className="flex items-center gap-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100 shrink-0">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-extrabold text-primary">{totalCandidates}</span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Applicants</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-100"></div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-extrabold text-tertiary-fixed-dim">{averageScore}%</span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Avg Match</span>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Leaderboard Table */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[60px_3fr_1.2fr_1.2fr_2.5fr_80px] gap-4 px-8 py-5 bg-slate-50/50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 tracking-[0.1em] uppercase">
            <div className="text-center">Rank</div>
            <div>Candidate Profile</div>
            <div>Match Score</div>
            <div>Status</div>
            <div>Score Distribution</div>
            <div className="text-right">Action</div>
          </div>

          {/* Candidate Rows */}
          <div className="divide-y divide-slate-50">
            {displayCandidates.map((candidate, index) => {
              let parsedAnalysis: any = {};
              try {
                if (candidate.structured_resume_analysis) {
                  let val = candidate.structured_resume_analysis;
                  if (typeof val === 'string') {
                    if (val.startsWith('"')) val = JSON.parse(val);
                    parsedAnalysis = JSON.parse(val);
                  }
                }
              } catch (e) {}

              const title = parsedAnalysis.current_title || candidate.current_title || 'Applicant';
              const rank = index + 1;
              const score = Math.round(candidate.overall_score || 0);
              
              // Define tag styles based on the user's manual database status
              const rawStatus = candidate.status || 'In Review';
              const normalizedStatus = rawStatus.toLowerCase();
              
              const isRejected = normalizedStatus.includes('reject');
              const isPending = normalizedStatus === 'in review' || normalizedStatus === 'pending';
              const isPositive = normalizedStatus.includes('hire') || normalizedStatus.includes('interview');
              
              let tagBg = 'bg-blue-50 text-blue-700 border-blue-100';
              if (isPending) tagBg = 'bg-slate-50 text-slate-600 border-slate-200';
              if (isRejected) tagBg = 'bg-red-50 text-red-600 border-red-100';
              if (isPositive) tagBg = 'bg-emerald-50 text-emerald-700 border-emerald-100';

              return (
                <Link key={candidate.id} href={`/candidates/${candidate.id}`} className="grid grid-cols-[60px_3fr_1.2fr_1.2fr_2.5fr_80px] gap-4 px-8 py-5 items-center hover:bg-slate-50/80 transition-all duration-300 group block">
                  <div className="flex justify-center">
                    <span className={`w-7 h-7 rounded-full ${rank === 1 ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200' : rank <= 3 ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' : 'bg-slate-50 text-slate-500 ring-1 ring-slate-200'} flex items-center justify-center font-bold text-xs shadow-sm`}>
                      {rank}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xl uppercase shadow-sm ring-2 ring-white">
                        {candidate.candidate_name.charAt(0)}
                      </div>
                      <span className={`absolute -bottom-1 -right-1 w-3 h-3 ${score >= 80 ? 'bg-tertiary-fixed-dim' : 'bg-slate-400'} rounded-full border-2 border-white`}></span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-[15px] group-hover:text-primary transition-colors capitalize">{candidate.candidate_name.toLowerCase()}</h3>
                      <p className="text-[11px] text-slate-400 font-medium line-clamp-1">{title}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-xl font-extrabold ${score >= 80 ? 'text-tertiary-fixed-dim' : score >= 50 ? 'text-amber-500' : 'text-slate-500'}`}>{score}%</span>
                      {score >= 80 && <TrendingUp className="w-3.5 h-3.5 text-tertiary-fixed-dim" />}
                      {score < 50 && <TrendingDown className="w-3.5 h-3.5 text-slate-500" />}
                    </div>
                  </div>
                  <div>
                    <span className={`px-2.5 py-1 flex items-center ${tagBg} border rounded-lg text-[10px] font-bold tracking-tight uppercase max-w-full truncate overflow-hidden`}>
                      {rawStatus.substring(0, 20)}
                    </span>
                  </div>
                  <div className="pr-8">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-slate-400'} rounded-full`} style={{ width: `${score}%` }}></div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </Link>
              );
            })}
            
            {(!candidates || candidates.length === 0) && (
              <div className="text-center py-12 text-slate-500 col-span-6 flex items-center justify-center w-full">
                No candidates have applied for this position yet.
              </div>
            )}
          </div>

          {/* Footer Stats & Pagination */}
          <div className="bg-slate-50/50 px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Showing {totalCandidates} candidates</p>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50" disabled>Previous</button>
              <div className="flex gap-1.5">
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold shadow-sm">1</span>
              </div>
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        </div>

        {/* Bento Analysis Section */}
        {totalCandidates > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-extrabold text-slate-900 font-headline">AI Talent Density Insight</h4>
              </div>
              <p className="text-slate-600 leading-relaxed text-[15px]">
                The current candidate pool shows an exceptionally high density of specialized knowledge for this role. Based on the {averageScore}% average match, we recommend prioritizing technical deep-dives into their domain expertise during the interview stages.
              </p>
            </div>
            
            <div className="bg-indigo-600 p-8 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden group">
              <Users className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none" />
              <div className="relative z-10">
                <h4 className="text-2xl font-bold font-headline text-white mb-3">Team Fit Matrix</h4>
                <p className="text-indigo-100 text-sm leading-relaxed font-medium">Cross-reference top candidates with current engineering team dynamics and skill gaps.</p>
              </div>
              <button className="relative z-10 mt-8 flex items-center justify-center gap-2 text-sm font-bold bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95">
                View Full Analysis <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
