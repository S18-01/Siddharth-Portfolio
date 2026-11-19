'use client';
import { useEffect, useState } from 'react';

export default function ResumePopup() {
  const [open, setOpen] = useState(false);
  const resume = '/SiddharthMuragundla_Resume.pdf';
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>(`a[href="${resume}"]`);
      if (!link || link.hasAttribute('download')) return;
      event.preventDefault();
      setOpen(true);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md" onClick={() => setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label="Resume preview" className="flex h-[78vh] w-full max-w-[680px] flex-col overflow-hidden rounded-2xl border border-blue-300/20 bg-[#0b1225] shadow-2xl" onClick={event => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-semibold text-white">Resume</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close resume" className="text-2xl text-white hover:text-blue-300">×</button>
        </div>
        <iframe src={`${resume}#toolbar=0`} title="Siddharth Muragundla Resume" className="min-h-0 w-full flex-1 bg-white" />
        <div className="flex justify-end border-t border-white/10 p-4">
          <a href={resume} download="SiddharthMuragundla_Resume.pdf" className="rounded-lg bg-[#adc3ff] px-5 py-3 font-semibold text-[#071020] hover:bg-white">Download Resume</a>
        </div>
      </div>
    </div>
  );
}
