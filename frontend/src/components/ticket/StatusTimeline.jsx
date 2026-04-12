import React from 'react';

const StatusTimeline = ({ ticket }) => {
  const steps = [
    { status: 'OPEN', label: 'Reported', date: ticket.createdAt },
    { status: 'IN_PROGRESS', label: 'Acknowledged', date: ticket.firstResponseAt },
    { status: 'RESOLVED', label: 'Resolved', date: ticket.resolvedAt },
    { status: 'CLOSED', label: 'Completed', date: ticket.updatedAt && ticket.status === 'CLOSED' ? ticket.updatedAt : null }
  ];

  const currentStatusIndex = steps.findIndex(s => s.status === ticket.status);

  return (
    <div className="relative">
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
      <div className="space-y-8">
        {steps.map((step, idx) => {
          const isDone = idx <= currentStatusIndex && step.date;
          const isCurrent = ticket.status === step.status;

          return (
            <div key={idx} className="relative flex gap-4 items-start">
              <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-sm ${
                isDone 
                  ? 'bg-indigo-600 border-indigo-600 scale-110' 
                  : 'bg-white border-slate-200'
              }`}>
                {isDone ? (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                )}
              </div>
              
              <div className="flex-grow pt-0.5">
                <p className={`text-xs font-black uppercase tracking-widest ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.label}
                </p>
                {step.date ? (
                  <p className="text-[10px] text-slate-500 font-medium">
                    {new Date(step.date).toLocaleDateString()} at {new Date(step.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-300 italic">Pending...</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
