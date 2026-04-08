import Link from 'next/link';
import { ArrowLeft, Search, Bell, TrendingUp, Minus, TrendingDown, ChevronRight, Users, ExternalLink, Plus, Sparkles } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { SearchBar } from '@/components/ui/search-bar';
import { PaginationControls } from '@/app/candidates/pagination-controls';

export const dynamic = 'force-dynamic';

export default async function JobLeaderboard({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ q?: string, page?: string, limit?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const query = resolvedSearch?.q?.toLowerCase() || '';
  const page = Number(resolvedSearch?.page) || 1;
  const limit = Number(resolvedSearch?.limit) || 20;
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

  const totalFiltered = displayCandidates.length;
  const totalPages = Math.ceil(totalFiltered / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedCandidates = displayCandidates.slice(startIndex, endIndex);

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
            {paginatedCandidates.map((candidate, index) => {
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
              const rank = startIndex + index + 1;
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
            
            {(!paginatedCandidates || paginatedCandidates.length === 0) && (
              <div className="text-center py-12 text-slate-500 col-span-6 flex items-center justify-center w-full">
                No candidates have applied for this position yet.
              </div>
            )}
          </div>

          {/* Footer Stats & Pagination */}
          <div className="bg-slate-50/50 px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Showing {paginatedCandidates.length} of {totalFiltered} records</p>
            <PaginationControls totalPages={totalPages} currentPage={page} currentLimit={limit} totalItems={totalFiltered} />
          </div>
        </div>



      </div>

    </div>
  );
}
