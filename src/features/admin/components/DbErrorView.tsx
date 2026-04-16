'use client';

import { AlertCircle, RefreshCcw, Database } from 'lucide-react';

export function DbErrorView({ error }: { error?: any }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-8 max-w-xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center relative">
        <Database className="w-7 h-7 text-red-500" strokeWidth={1.5} />
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <AlertCircle className="w-3 h-3 text-white" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Database Offline</h2>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Could not connect to the database. Check that the server is running and
          your <code className="font-mono text-xs bg-neutral-100 px-1 py-0.5 rounded">.env.local</code> configuration is correct.
        </p>
      </div>

      <div className="w-full bg-neutral-50 rounded-xl p-5 border border-neutral-100 text-left space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400 mb-3">Troubleshooting</p>
        {[
          'Ensure your MySQL / PostgreSQL server is started.',
          'Verify DB_HOST, DB_USER, and DB_NAME in .env.local.',
          'If you added new fields, run the migration script.',
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">
              {i + 1}
            </span>
            <p className="text-sm text-neutral-600 leading-relaxed">{step}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors"
      >
        <RefreshCcw className="w-4 h-4" />
        Retry Connection
      </button>

      {error && (
        <pre className="text-[10px] text-neutral-400 font-mono bg-neutral-50 p-4 rounded-xl border border-neutral-100 overflow-x-auto text-left whitespace-pre-wrap w-full">
          {error.message || JSON.stringify(error, null, 2)}
        </pre>
      )}
    </div>
  );
}
