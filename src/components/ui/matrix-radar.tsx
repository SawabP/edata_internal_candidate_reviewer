'use client';

import { ResponsiveRadar } from '@nivo/radar';

interface MatrixData {
  name: string;
  score: number;
  benchmark: number;
  fullMark?: number;
}

export function MatrixRadar({ matrices }: { matrices: MatrixData[] }) {
  // Map and truncate long names for the Axis labels so it doesn't overlap excessively 
  const data = matrices.map(m => ({
    subject: m.name.length > 25 ? m.name.substring(0, 22) + '...' : m.name,
    originalName: m.name,
    Benchmark: m.benchmark,
    Candidate: m.score,
  }));

  if(!data || data.length === 0) {
    return <div className="w-full flex items-center justify-center text-slate-400 h-64 text-sm font-medium italic bg-slate-50 rounded-xl">No competency matrices found.</div>
  }

  return (
    <div className="w-full aspect-square max-h-[450px]">
      <ResponsiveRadar
        data={data}
        keys={['Benchmark', 'Candidate']}
        indexBy="subject"
        maxValue={10}
        margin={{ top: 60, right: 60, bottom: 60, left: 60 }}
        curve="linearClosed"
        borderWidth={1.5}
        borderColor={{ from: 'color' }}
        gridLevels={5}
        gridShape="circular"
        gridLabelOffset={16}
        enableDots={true}
        dotSize={5}
        dotColor={{ theme: 'background' }}
        dotBorderWidth={1.5}
        dotBorderColor={{ from: 'color' }}
        enableDotLabel={false}
        colors={['#93c5fd', '#10b981']}
        fillOpacity={0.15}
        blendMode="normal"
        animate={true}
        theme={{
          grid: {
            line: {
              stroke: '#f1f5f9',
              strokeWidth: 1,
            }
          },
          crosshair: {
            line: {
              stroke: 'transparent',
              strokeWidth: 0,
              strokeOpacity: 0
            }
          },
          labels: {
            text: {
              fontSize: 12,
              fill: '#64748b',
              fontWeight: 600
            }
          }
        }}
        sliceTooltip={({ index, data }: any) => {
          // Nivo passes an array of objects per slice: 
          // e.g. [{ id: 'Candidate', formattedValue: 10 }, { id: 'Benchmark', formattedValue: 10 }]
          const getVal = (key: string) => {
            const found = Array.isArray(data) ? data.find((d: any) => d.id === key) : null;
            return found ? found.formattedValue : 0;
          };

          return (
            <div className="bg-white p-4 rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 text-sm text-slate-600 flex flex-col gap-1.5 z-50 relative pointer-events-none min-w-[200px]">
              <strong className="text-slate-900 mb-1 block truncate">{index}</strong>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="font-semibold">Candidate: <span className="font-black text-emerald-700">{getVal('Candidate')}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="font-semibold text-slate-500">Benchmark: <span className="font-black">{getVal('Benchmark')}</span></span>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
