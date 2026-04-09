import Link from 'next/link';
import { ArrowLeft, Search, TrendingUp, TrendingDown, ChevronRight, Users } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { SearchBar } from '@/components/ui/search-bar';
import { PaginationControls } from './pagination-controls';

export const dynamic = 'force-dynamic';

export default async function GlobalCandidatesPage({ searchParams }: { searchParams: Promise<{ q?: string, page?: string, limit?: string }> }) {
  const resolvedSearch = await searchParams;
  const query = resolvedSearch?.q?.toLowerCase() || '';
  const page = Number(resolvedSearch?.page) || 1;
  const limit = Number(resolvedSearch?.limit) || 20;

  // Fetch all candidates globally
  const { data: candidates } = await supabaseAdmin
    .from('candidate_analysis')
    .select('*')
    .order('overall_score', { ascending: false });

  // Map job keys
  const { data: jobs } = await supabaseAdmin.from('jobs').select('id, job_title');
  const jobMap = new Map((jobs || []).map(j => [j.id, j.job_title]));

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

  const totalCandidates = candidates?.length || 0;

  return (
    <div className="flex flex-col min-h-full">
      <header className="w-full sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl flex flex-col sm:flex-row sm:justify-between items-start sm:items-center px-4 md:px-8 py-4 border border-slate-100 gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-extrabold text-slate-900 font-headline tracking-tight">Global Talent Directory</h1>
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <SearchBar />
        </div>
      </header>

      <div className="p-4 md:p-8 flex-1 w-full space-y-6 overflow-hidden">
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">All Candidates</h2>
              <p className="text-slate-500 text-sm md:text-base font-medium mt-1">Viewing candidates across all job requisitions securely fetched from the database.</p>
            </div>
            <div className="sm:text-right">
              <span className="text-3xl font-extrabold text-primary">{totalCandidates}</span>
              <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">Total Records</span>
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <div className="min-w-[1000px]">
              <div className="grid grid-cols-[60px_2.5fr_2fr_1.2fr_1fr_2fr_80px] gap-4 px-8 py-5 bg-slate-50/50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 tracking-[0.1em] uppercase items-center">
            <div className="text-center">#</div>
            <div>Candidate Profile</div>
            <div>Associated Job</div>
            <div>Match Score</div>
            <div>Status</div>
            <div>Score Profile</div>
            <div className="text-right">Action</div>
          </div>

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
              
              const rawStatus = candidate.status || 'In Review';
              const normalizedStatus = rawStatus.toLowerCase();
              
              const isRejected = normalizedStatus.includes('reject');
              const isPending = normalizedStatus === 'in review' || normalizedStatus === 'pending';
              const isPositive = normalizedStatus.includes('hire') || normalizedStatus.includes('interview');
              
              let tagBg = 'bg-blue-50 text-blue-700 border-blue-100';
              if (isPending) tagBg = 'bg-slate-50 text-slate-600 border-slate-200';
              if (isRejected) tagBg = 'bg-red-50 text-red-600 border-red-100';
              if (isPositive) tagBg = 'bg-emerald-50 text-emerald-700 border-emerald-100';

              const targetJob = jobMap.get(candidate.job_id) || `Requisition #${candidate.job_id}`;

              return (
                <Link key={candidate.id} href={`/candidates/${candidate.id}?from=candidates&page=${page}&limit=${limit}`} className="grid grid-cols-[60px_2.5fr_2fr_1.2fr_1fr_2fr_80px] gap-4 px-8 py-5 items-center hover:bg-slate-50/80 transition-all duration-300 group block">
                  <div className="flex justify-center">
                    <span className="bg-slate-50 text-slate-400 rounded-lg px-2 py-1 font-bold text-xs ring-1 ring-slate-200 shadow-sm">
                      {rank}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xl uppercase shadow-sm ring-2 ring-white">
                        {(candidate.candidate_name || 'A').charAt(0)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-[15px] group-hover:text-primary transition-colors capitalize">{(candidate.candidate_name || 'Applicant').toLowerCase()}</h3>
                      <p className="text-[11px] text-slate-400 font-medium line-clamp-1">{title}</p>
                    </div>
                  </div>
                  <div className="pr-2">
                    <p className="text-[12px] font-bold text-slate-700 line-clamp-2 leading-tight">{targetJob}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5 tracking-wider">REQ-{candidate.job_id}</p>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-xl font-extrabold ${score >= 80 ? 'text-tertiary-fixed-dim' : score >= 50 ? 'text-amber-500' : 'text-slate-500'}`}>{score}%</span>
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
              <div className="text-center py-12 text-slate-500 col-span-6 flex flex-col items-center justify-center w-full">
                <Search className="w-8 h-8 text-slate-300 mb-3" />
                No candidates found matching '{query}'.
              </div>
            )}
          </div>
            </div>
          </div>
          
          {/* Footer Stats & Pagination */}
          <div className="bg-slate-50/50 px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Showing {paginatedCandidates.length} of {totalFiltered} records</p>
            <PaginationControls totalPages={totalPages} currentPage={page} currentLimit={limit} totalItems={totalFiltered} />
          </div>
        </div>
      </div>
    </div>
  );
}
