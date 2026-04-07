import Link from 'next/link';
import { Mail, Phone, Link as LinkIcon, Zap, Download, Users, Home, FileText } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { updateCandidateStatus } from './actions';
import { ScheduleInterviewButton } from './schedule-button';
import { AvatarImage } from '@/components/ui/avatar-image';
import { MatrixRadar } from '@/components/ui/matrix-radar';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export default async function CandidateProfile({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { data: candidate, error } = await supabaseAdmin
    .from('candidate_analysis')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !candidate) {
    return notFound();
  }

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
    console.error("Failed to parse structured_resume_analysis", e);
  }

  const parseJSONList = (rawData: any) => {
    if (!rawData) return [];
    if (Array.isArray(rawData)) return rawData;
    if (typeof rawData === 'string') {
      try {
        let parsed = JSON.parse(rawData);
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
        if (Array.isArray(parsed)) return parsed;
      } catch(e) {}
      // fallback manual extraction
      return rawData.replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/[\[\]"]/g, '').split('","').map(s => s.replace(/^\\|\\$/g, '').trim()).filter(Boolean);
    }
    return [String(rawData)];
  };

  const strengthsList = parseJSONList(candidate.strengths);
  const weaknessesList = parseJSONList(candidate.weaknesses);

  const title = parsedAnalysis.current_title || candidate.current_title || 'Applicant';
  const email = parsedAnalysis.email || candidate.email || 'N/A';
  const phone = parsedAnalysis.phone || candidate.phone || 'N/A';
  const location = parsedAnalysis.location || candidate.location || 'Unknown Location';
  const summary = candidate.resume_summary || parsedAnalysis.professional_summary || 'No summary provided.';
  
  const overallScore = Math.round(candidate.overall_score || 0);
  const aiConfidence = Math.round(candidate.confidence_score || 85);
  const rankTotal = parsedAnalysis.total_experience_years || candidate.total_experience_years || '5+';

  // Extract matrices dynamically up to 10
  const matrices = [];
  for (let i = 1; i <= 10; i++) {
    if (candidate[`matrix${i}_name`]) {
      matrices.push({
        id: i,
        name: candidate[`matrix${i}_name`],
        score: candidate[`matrix${i}_score`] || 0,
        benchmark: candidate[`matrix${i}_benchmark`] || 10,
        evidence: candidate[`matrix${i}_evidence`] || null,
        weight: candidate[`matrix${i}_weight`] || 10,
      });
    }
  }

  let linkedinUsername = null;
  const linkedinUrl = parsedAnalysis.linkedin_url || candidate.linkedin_url;
  if (linkedinUrl) {
    const match = linkedinUrl.match(/linkedin\.com\/in\/([^\/]+)/);
    if (match && match[1]) {
      linkedinUsername = match[1];
    }
  }

  let gravatarUrl = '';
  if (email && email !== 'N/A') {
    const hash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
    gravatarUrl = `https://www.gravatar.com/avatar/${hash}?s=256&d=404`;
  }

  const linkedinAvatarUrl = linkedinUsername ? `https://unavatar.io/linkedin/${linkedinUsername}?fallback=false` : '';
  const uiAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.candidate_name)}&size=256&background=f1f5f9&color=cbd5e1&bold=true&font-size=0.4`;

  const avatarSrcs = [linkedinAvatarUrl, gravatarUrl, uiAvatarUrl];

  return (
    <div className="flex-1 w-full space-y-6">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <nav className="flex items-center text-[10px] text-outline mb-1.5 uppercase tracking-wider font-semibold">
            <Link href="/" className="flex items-center hover:text-primary transition-colors">
              <Home className="w-3 h-3 mr-1" />
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/candidates" className="hover:text-primary transition-colors">
              Candidates
            </Link>
            <span className="mx-2">/</span>
            <span className="text-on-surface capitalize">{candidate.candidate_name.toLowerCase()}</span>
          </nav>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight capitalize">{candidate.candidate_name.toLowerCase()}</h1>
          <p className="text-on-surface-variant text-sm flex flex-wrap items-center gap-2 mt-1 leading-snug">
            <span>{location}</span>
            <span className="text-slate-300 hidden md:inline">•</span>
            <span>{title}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
          {candidate.resume_link && (
            <a href={candidate.resume_link} target="_blank" rel="noopener noreferrer" className="px-5 py-2 rounded-lg border-2 border-primary/20 text-primary font-bold text-xs hover:border-primary hover:bg-primary/5 transition-all uppercase tracking-wider shadow-sm flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              View Resume
            </a>
          )}
          {candidate.status === 'rejected' ? (
            <form action={updateCandidateStatus.bind(null, candidate.id, 'in review')}>
              <button type="submit" className="px-5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 font-bold text-xs hover:bg-slate-100 hover:text-slate-800 transition-colors uppercase tracking-wider shadow-sm">
                Reconsider
              </button>
            </form>
          ) : (
            <form action={updateCandidateStatus.bind(null, candidate.id, 'rejected')}>
              <button type="submit" className="px-5 py-2 rounded-lg border border-outline-variant text-on-surface font-semibold text-xs hover:bg-error hover:border-error hover:text-white transition-colors">
                Reject
              </button>
            </form>
          )}
          <ScheduleInterviewButton 
            candidateId={candidate.id} 
            email={email} 
            candidateName={candidate.candidate_name} 
          />
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        
        {/* Left Sidebar Column */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Profile Card */}
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-slate-100/50">
            <div className="aspect-square w-full rounded-lg overflow-hidden mb-5 bg-slate-100 flex items-center justify-center shadow-inner relative">
               <AvatarImage srcs={avatarSrcs} initials={candidate.candidate_name.charAt(0)} />
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Executive Summary</h3>
                <p className="text-[13px] leading-relaxed text-on-surface-variant">
                  {summary}
                </p>
              </div>
              {parsedAnalysis.skills && parsedAnalysis.skills.length > 0 && (
                <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                  {parsedAnalysis.skills.slice(0, 5).map((skill: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-primary-fixed text-on-primary-fixed text-[10px] font-bold rounded-full uppercase tracking-tighter">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-100/50">
            <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">Contact Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="text-primary w-5 h-5 shrink-0" />
                <span className="text-on-surface-variant break-all">{email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="text-primary w-5 h-5 shrink-0" />
                <span className="text-on-surface-variant">{phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <LinkIcon className="text-primary w-5 h-5 shrink-0" />
                <a className="text-primary hover:underline font-medium break-all" href={parsedAnalysis.linkedin_url || '#'}>
                  {parsedAnalysis.linkedin_url ? 'LinkedIn Profile' : 'No link available'}
                </a>
              </div>
            </div>
          </div>


        </div>

        {/* Right Data Column */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Main Highlight: Competency Radar Mapping */}
          <div className="bg-surface-container-lowest border border-slate-100/50 p-8 rounded-2xl shadow-sm relative overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-2">
              <div>
                <h3 className="text-lg font-bold text-on-surface font-headline flex items-center gap-2 relative z-10 shrink-0">
                  Candidate Competency Mapping
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 font-medium z-10 relative max-w-lg">
                  Visualizing the candidate's exact algorithmic fit shapes across all 10 defined scoring matrices, plotted directly against the requisite benchmark targets.
                </p>
              </div>
            </div>
            <div className="relative z-10 flex-1 w-full flex items-center justify-center">
              <MatrixRadar matrices={matrices} />
            </div>
          </div>

          {/* Top Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-100/50 flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-colors cursor-default relative">
              <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                <svg className="w-full h-full -rotate-90">
                  <circle className="text-surface-container-high" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                  <circle className="text-primary" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset={`${251.2 - (251.2 * overallScore) / 100}`} strokeWidth="8"></circle>
                </svg>
                <span className="absolute text-2xl font-black text-primary font-headline">{overallScore}</span>
              </div>
              <p className="text-xs font-bold text-outline uppercase tracking-widest">Overall Score</p>
            </div>
            
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-100/50 flex flex-col items-center justify-center text-center">
              <div className={`text-xl font-black font-headline mb-2 uppercase tracking-wide ${
                (candidate.recommendation || '').toLowerCase().includes('reject') || (candidate.recommendation || '').toLowerCase().includes('no_fit') ? 'text-rose-600' : 
                (candidate.recommendation || '').toLowerCase().includes('review') || !candidate.recommendation ? 'text-slate-500' : 
                'text-emerald-600'
              }`}>
                {(() => {
                  const val = candidate.recommendation || 'Pending Review';
                  return val.toUpperCase();
                })()}
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">AI Suggestion</p>
            </div>
            
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-100/50 flex flex-col items-center justify-center text-center group hover:border-on-surface/30 transition-colors cursor-default relative">
              <div className="text-4xl font-black text-on-surface font-headline mb-2">{rankTotal}y</div>
              <p className="text-xs font-bold text-outline uppercase tracking-widest">Industry Tenure</p>
            </div>
          </div>

          {/* Skills Matrix */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-slate-100/50">
            <div className="flex justify-between items-end mb-8">
              <h3 className="text-lg font-bold text-on-surface font-headline">Performance Analysis Matrices</h3>
              <div className="flex items-center gap-2 text-[10px] font-bold text-outline uppercase tracking-tighter">
                <span className="w-2 h-2 rounded-full bg-primary"></span> Score
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
              {matrices.length > 0 ? matrices.map((matrix) => {
                const percentScore = (matrix.score / matrix.benchmark) * 100;
                return (
                  <div key={matrix.id} className="space-y-2 group relative">
                    <div className="flex justify-between items-start mb-2 text-base">
                      <div className="flex items-center flex-wrap gap-2 pr-3">
                        <span className="font-semibold text-on-surface group-hover:text-primary transition-colors leading-snug" title={matrix.name}>{matrix.name}</span>
                        {matrix.weight && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500 uppercase tracking-[0.1em] border border-slate-200 shadow-sm align-middle">
                            Weight: {matrix.weight}%
                          </span>
                        )}
                      </div>
                      <span className="text-outline text-sm shrink-0 whitespace-nowrap pt-0.5 font-medium">{matrix.score} <span className="text-slate-300">/</span> {matrix.benchmark}</span>
                    </div>
                    <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden relative my-3">
                      <div className="h-full bg-primary rounded-full relative z-0 transition-all duration-1000" style={{ width: `${percentScore}%` }}></div>
                    </div>
                    {matrix.evidence && (
                      <p className="text-sm text-slate-500 italic leading-relaxed mt-2" title={matrix.evidence}>{matrix.evidence}</p>
                    )}
                  </div>
                );
              }) : (
                <p className="text-sm text-slate-500 italic col-span-2">No detailed matrices available.</p>
              )}
            </div>
          </div>

          {/* AI Evidence Sections */}
          {(strengthsList.length > 0 || weaknessesList.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
              {strengthsList.length > 0 && (
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-100/50">
                  <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4">Core Strengths</h3>
                  <div className="space-y-4">
                    <div className="text-sm text-on-surface-variant leading-relaxed">
                      {strengthsList.map((s: string, i: number) => (
                        <p key={i} className="mb-3 flex items-start"><span className="mr-2 text-emerald-500">•</span> <span>{s}</span></p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {weaknessesList.length > 0 && (
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-100/50">
                  <h3 className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-4">Identified Weaknesses</h3>
                  <div className="space-y-4">
                    <div className="text-sm text-on-surface-variant leading-relaxed">
                      {weaknessesList.map((w: string, i: number) => (
                        <p key={i} className="mb-3 flex items-start"><span className="mr-2 text-rose-500">•</span> <span>{w}</span></p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
