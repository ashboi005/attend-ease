'use client';

import { useState } from 'react';

interface AiAttendanceSummaryProps {
  classId: string;
}

export default function AiAttendanceSummary({ classId }: AiAttendanceSummaryProps) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateSummary = async () => {
    setLoading(true);
    setError('');
    setSummary('');

    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classId }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 p-4 border rounded-lg" style={{borderColor: '#E8DCC6'}}>
      <h3 className="text-xl font-semibold mb-3" style={{color: '#212842'}}>AI-Powered Attendance Summary</h3>
      <button
        onClick={handleGenerateSummary}
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
        style={{
            backgroundColor: '#212842',
            color: '#F0E7D5'
        }}
      >
        {loading ? 'Generating...' : 'Generate AI Summary'}
      </button>

      {error && <p className="mt-4 text-red-500 text-center">Error: {error}</p>}
      
      {summary && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="whitespace-pre-wrap text-gray-700">{summary}</p>
        </div>
      )}
    </div>
  );
}
