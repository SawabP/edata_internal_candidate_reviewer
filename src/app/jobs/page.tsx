import Link from 'next/link';
import { Filter, PlusCircle, Code, MapPin, Building, Brush, Megaphone, Activity, FilePlus2, ChevronLeft, ChevronRight, DollarSign, Briefcase } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { ComingSoonButton } from '@/components/ui/coming-soon-button';

export const dynamic = 'force-dynamic';

export default async function JobsPage() {
  const { data: jobs } = await supabaseAdmin.from('jobs').select('*').order('created_at', { ascending: false });
  const { data: candidates } = await supabaseAdmin.from('candidate_analysis').select('job_id, candidate_name');

  const getApplicantCount = (jobId: number) => {
    return candidates?.filter(c => c.job_id === jobId).length || 0;
  };

  const getStatusColor = (status: string) => {
    if (status.toLowerCase() === 'active') return 'bg-tertiary-fixed text-on-tertiary-fixed-variant';
    if (status.toLowerCase() === 'closed') return 'bg-slate-200 text-slate-600';
    return 'bg-amber-100 text-amber-700';
  };

  const getStatusDotColor = (status: string) => {
    if (status.toLowerCase() === 'active') return 'bg-tertiary';
    if (status.toLowerCase() === 'closed') return 'bg-slate-400';
    return 'bg-amber-500';
  };

  return (
    <div className="p-8 space-y-8 flex-1 w-full relative z-10">
      {/* Page Header Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">Jobs</h2>
          <p className="text-on-surface-variant font-medium">Manage and monitor current executive searches and technical roles.</p>
        </div>
        <div className="flex items-center gap-3">
          <ComingSoonButton featureName="Filtering features" className="px-5 py-3 rounded-xl border border-outline-variant font-semibold text-on-surface flex items-center gap-2 hover:bg-surface-container-low transition-all">
            <Filter className="w-5 h-5" />
            Filter
          </ComingSoonButton>
          <ComingSoonButton featureName="Job Posting capabilities" className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-lg hover:bg-primary-container hover:shadow-xl active:scale-[0.98] transition-all flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Post New Job
          </ComingSoonButton>
        </div>
      </section>

      {/* Jobs Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {jobs && jobs.map((job) => {
          const applicantCount = getApplicantCount(job.id);
          const isClosed = job.status.toLowerCase() === 'closed';

          return (
            <Link key={job.id} href={`/jobs/${job.id}`} className={`group bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 transition-all duration-300 flex flex-col relative block ${isClosed ? 'opacity-75 grayscale hover:grayscale-0 hover:opacity-100' : 'hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-xl ${isClosed ? 'bg-slate-100 text-slate-500' : 'bg-primary/10 text-primary'} flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300`}>
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(job.status)} flex items-center gap-1.5 capitalize`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(job.status)}`}></span> {job.status}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-on-surface font-headline leading-tight group-hover:text-primary transition-colors pr-2 line-clamp-2" title={job.job_title}>{job.job_title}</h4>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-on-surface-variant text-sm">
                  <div className="flex items-center gap-1.5"><Building className="w-4 h-4 opacity-60" /> Executive</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 opacity-60" /> Remote/GCC</div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-surface-container-low flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">{isClosed ? 'Final Pool' : 'Applicants'}</p>
                  <p className="text-2xl font-black text-on-surface">{applicantCount}</p>
                </div>
                {applicantCount > 0 && (
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-white flex items-center justify-center text-[10px] whitespace-nowrap font-bold">+{applicantCount}</div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}

        {(!jobs || jobs.length === 0) && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-slate-500">
            No jobs found in the database.
          </div>
        )}

        {/* Post New Job Placeholder */}
        <div className="hidden group bg-surface-container-low border-2 border-dashed border-outline-variant/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-white hover:border-primary hover:shadow-lg transition-all duration-300 cursor-pointer">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm text-primary group-hover:scale-110 transition-transform">
            <FilePlus2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-on-surface font-headline">New Job Slot</h4>
          <p className="text-xs text-on-surface-variant max-w-[200px] mt-2 font-medium opacity-80">You have 4 premium slots remaining this month.</p>
        </div>

      </section>

      {/* Pagination / Footer Metadata */}
      <footer className="mt-12 pt-8 flex items-center justify-between border-t border-surface-container-low pb-12">
        <p className="text-sm font-medium text-on-surface-variant">Showing <span className="font-bold text-on-surface">{jobs?.length || 0}</span> jobs</p>
        <div className="flex gap-2">
          <button className="p-2 rounded-xl border border-outline-variant hover:bg-slate-50 transition-colors disabled:opacity-40" disabled>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 px-4 text-sm font-bold text-on-surface">
            Page 1 of 1
          </div>
          <button className="p-2 rounded-xl border border-outline-variant bg-white hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-40" disabled>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
