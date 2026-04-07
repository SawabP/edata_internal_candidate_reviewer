'use client';

import { useState } from 'react';
import { updateCandidateStatus } from './actions';

export function ScheduleInterviewButton({ 
  candidateId, 
  email, 
  candidateName 
}: { 
  candidateId: string, 
  email: string, 
  candidateName: string 
}) {
  const [isPending, setIsPending] = useState(false);

  const handleSchedule = async () => {
    setIsPending(true);
    try {
      // Trigger the mailto link to open Outlook or default mail client
      window.location.href = `mailto:${email}?subject=Interview Schedule: ${candidateName}`;
      // Update the database status to 'interview scheduled'
      await updateCandidateStatus(candidateId, 'interview scheduled');
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button 
      onClick={handleSchedule}
      disabled={isPending}
      className={`px-5 py-2 rounded-lg bg-gradient-to-br from-primary to-primary-container text-white font-semibold text-xs shadow-md hover:opacity-90 active:scale-95 transition-all outline-none ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {isPending ? 'Scheduling...' : 'Schedule Interview'}
    </button>
  );
}
