import { useState } from 'react';

interface ExpandableCodeProps {
  label: string;
  content: string;
}

export function ExpandableCode({ label, content }: ExpandableCodeProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 border border-border-light dark:border-border-dark rounded overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-[#0d1117] border-b border-border-light dark:border-border-dark">
        <span className="text-xs text-text-muted-light dark:text-text-muted-dark font-mono">{label}</span>
        <button
          className="text-primary hover:text-blue-700 text-xs font-semibold transition-colors"
          onClick={() => setOpen((value) => !value)} type="button">
          {open ? 'Hide' : 'Show'}
        </button>
      </div>
      {open ? (
        <pre className="p-4 text-sm overflow-x-auto bg-code-bg-light dark:bg-code-bg-dark border-t border-border-light dark:border-border-dark">
          <code className="text-gray-800 dark:text-gray-200 block">{content}</code>
        </pre>
      ) : null}
    </div>
  );
}
