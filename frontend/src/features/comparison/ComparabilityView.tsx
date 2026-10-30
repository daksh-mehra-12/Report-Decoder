import React, { useState, useEffect } from 'react';
import { TrendingUp, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Activity, Filter } from 'lucide-react';
import { ApiClient } from '../../lib/api';

export const ComparabilityView: React.FC = () => {
  const [selectedAnalyte, setSelectedAnalyte] = useState('CBC_HEMOGLOBIN');
  const [trendData, setTrendData] = useState<any>(null);
  const [gateEvaluation, setGateEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Interactive Comparability Evaluator State
  const [testA, setTestA] = useState('CBC_HEMOGLOBIN');
  const [unitA, setUnitA] = useState('g/dL');
  const [lowA, setLowA] = useState('12.0');
  const [highA, setHighA] = useState('15.5');
  const [labA, setLabA] = useState('Metropolis Labs');

  const [testB, setTestB] = useState('CBC_HEMOGLOBIN');
  const [unitB, setUnitB] = useState('g/dL');
  const [lowB, setLowB] = useState('11.5');
  const [highB, setHighB] = useState('16.0');
  const [labB, setLabB] = useState('Lal PathLabs');

  const runGateCheck = async () => {
    try {
      const res = await ApiClient.evaluateComparability({
        test_code_a: testA,
        unit_a: unitA,
        range_low_a: parseFloat(lowA) || null,
        range_high_a: parseFloat(highA) || null,
        lab_name_a: labA,
        test_code_b: testB,
        unit_b: unitB,
        range_low_b: parseFloat(lowB) || null,
        range_high_b: parseFloat(highB) || null,
        lab_name_b: labB,
      });
      setGateEvaluation(res);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    runGateCheck();
  }, [testA, unitA, lowA, highA, labA, testB, unitB, lowB, highB, labB]);

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const res = await ApiClient.getHistoricalTrends(selectedAnalyte);
        setTrendData(res);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [selectedAnalyte]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b border-[#A5BEB0]/60 pb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#E5EEE6] border border-[#A5BEB0] text-[#204D3B] text-[11px] font-mono mb-2 font-bold">
          <TrendingUp className="w-3.5 h-3.5 text-[#204D3B]" />
          CROSS-LAB ASSAY STANDARDIZATION
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#25292B] tracking-tight">
          Cross-Lab Comparability Gate & Historical Trends
        </h2>
        <p className="text-xs sm:text-sm text-[#52635B] mt-1 max-w-3xl">
          Never plot misleading trends across incompatible units or disparate assay calibrations. 
          LabLens enforces strict clinical eligibility rules before admitting data into historical trendlines.
        </p>
      </div>

      {/* Part 1: Interactive Comparability Gate Tester */}
      <div className="p-6 rounded-2xl bg-white border border-[#A5BEB0]/60 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#204D3B]" />
            <h3 className="text-base font-bold text-[#25292B]">Interactive Comparability Eligibility Gate</h3>
          </div>
          <span className="text-[11px] font-mono text-[#204D3B] font-bold px-2.5 py-0.5 rounded bg-[#E5EEE6] border border-[#A5BEB0]">
            Rule Gate v1.0
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Specimen A Card */}
          <div className="p-4 rounded-xl bg-[#E5EEE6]/50 border border-[#A5BEB0]/60 space-y-3 text-xs">
            <span className="font-bold text-[#204D3B] block">Specimen A (Prior Baseline)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[#52635B] block mb-0.5 font-semibold">Analyte Code</label>
                <select
                  value={testA}
                  onChange={(e) => setTestA(e.target.value)}
                  className="w-full bg-white border border-[#A5BEB0] rounded-lg p-2 text-xs text-[#25292B] font-medium"
                >
                  <option value="CBC_HEMOGLOBIN">Hemoglobin</option>
                  <option value="METABOLIC_FASTING_GLUCOSE">Fasting Glucose</option>
                  <option value="LIPID_TOTAL_CHOLESTEROL">Total Cholesterol</option>
                  <option value="KIDNEY_CREATININE">Serum Creatinine</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#52635B] block mb-0.5 font-semibold">Reported Unit</label>
                <input
                  type="text"
                  value={unitA}
                  onChange={(e) => setUnitA(e.target.value)}
                  className="w-full bg-white border border-[#A5BEB0] rounded-lg p-2 text-xs text-[#25292B] font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-[#52635B] block mb-0.5 font-semibold">Range Low</label>
                <input
                  type="text"
                  value={lowA}
                  onChange={(e) => setLowA(e.target.value)}
                  className="w-full bg-white border border-[#A5BEB0] rounded-lg p-2 text-xs text-[#25292B] font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#52635B] block mb-0.5 font-semibold">Range High</label>
                <input
                  type="text"
                  value={highA}
                  onChange={(e) => setHighA(e.target.value)}
                  className="w-full bg-white border border-[#A5BEB0] rounded-lg p-2 text-xs text-[#25292B] font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#52635B] block mb-0.5 font-semibold">Facility</label>
                <input
                  type="text"
                  value={labA}
                  onChange={(e) => setLabA(e.target.value)}
                  className="w-full bg-white border border-[#A5BEB0] rounded-lg p-2 text-xs text-[#25292B]"
                />
              </div>
            </div>
          </div>

          {/* Specimen B Card */}
          <div className="p-4 rounded-xl bg-[#E5EEE6]/50 border border-[#A5BEB0]/60 space-y-3 text-xs">
            <span className="font-bold text-[#204D3B] block">Specimen B (Subsequent Test)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[#52635B] block mb-0.5 font-semibold">Analyte Code</label>
                <select
                  value={testB}
                  onChange={(e) => setTestB(e.target.value)}
                  className="w-full bg-white border border-[#A5BEB0] rounded-lg p-2 text-xs text-[#25292B] font-medium"
                >
                  <option value="CBC_HEMOGLOBIN">Hemoglobin</option>
                  <option value="METABOLIC_FASTING_GLUCOSE">Fasting Glucose</option>
                  <option value="LIPID_TOTAL_CHOLESTEROL">Total Cholesterol</option>
                  <option value="KIDNEY_CREATININE">Serum Creatinine</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#52635B] block mb-0.5 font-semibold">Reported Unit</label>
                <input
                  type="text"
                  value={unitB}
                  onChange={(e) => setUnitB(e.target.value)}
                  className="w-full bg-white border border-[#A5BEB0] rounded-lg p-2 text-xs text-[#25292B] font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-[#52635B] block mb-0.5 font-semibold">Range Low</label>
                <input
                  type="text"
                  value={lowB}
                  onChange={(e) => setLowB(e.target.value)}
                  className="w-full bg-white border border-[#A5BEB0] rounded-lg p-2 text-xs text-[#25292B] font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#52635B] block mb-0.5 font-semibold">Range High</label>
                <input
                  type="text"
                  value={highB}
                  onChange={(e) => setHighB(e.target.value)}
                  className="w-full bg-white border border-[#A5BEB0] rounded-lg p-2 text-xs text-[#25292B] font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#52635B] block mb-0.5 font-semibold">Facility</label>
                <input
                  type="text"
                  value={labB}
                  onChange={(e) => setLabB(e.target.value)}
                  className="w-full bg-white border border-[#A5BEB0] rounded-lg p-2 text-xs text-[#25292B]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Gate Outcome Result Display */}
        {gateEvaluation && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 ${
              gateEvaluation.status === 'Comparable'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : gateEvaluation.status === 'Comparable with Caveats'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                {gateEvaluation.is_comparable ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                )}
                <span>Gate Decision: {gateEvaluation.status}</span>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-current">
                Allow Trend Chart: {gateEvaluation.allow_trend_chart ? 'YES' : 'NO (BLOCKED)'}
              </span>
            </div>
            <ul className="space-y-1 pl-6 list-disc">
              {gateEvaluation.reasons.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Part 2: Historical Trends Dashboard */}
      <div className="p-6 rounded-2xl bg-white border border-[#A5BEB0]/60 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#204D3B]" />
            <h3 className="text-base font-bold text-[#25292B]">Historical Biomarker Trajectory</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#52635B] font-semibold">Select Analyte:</span>
            <select
              value={selectedAnalyte}
              onChange={(e) => setSelectedAnalyte(e.target.value)}
              className="bg-white border border-[#A5BEB0] rounded-xl px-3 py-1.5 text-xs text-[#204D3B] font-bold focus:outline-none focus:border-[#204D3B]"
            >
              <option value="CBC_HEMOGLOBIN">Hemoglobin (g/dL)</option>
              <option value="METABOLIC_FASTING_GLUCOSE">Fasting Glucose (mg/dL)</option>
              <option value="LIPID_TOTAL_CHOLESTEROL">Total Cholesterol (mg/dL)</option>
              <option value="KIDNEY_CREATININE">Serum Creatinine (mg/dL)</option>
            </select>
          </div>
        </div>

        {/* Trend Visualization Cards */}
        {loading ? (
          <div className="py-16 text-center text-xs text-[#52635B]">Loading historical data points...</div>
        ) : trendData && trendData.data_points?.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {trendData.data_points.map((pt: any, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-[#E5EEE6]/50 border border-[#A5BEB0]/60 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#52635B]">
                    <span>{pt.report_date}</span>
                    <span className="font-mono text-[#204D3B] font-bold">{pt.lab_name}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-[#25292B] font-mono">{pt.value}</span>
                    <span className="text-xs text-[#204D3B] font-mono font-bold">{pt.unit}</span>
                  </div>
                  <div className="text-[11px] text-[#52635B] flex justify-between">
                    <span>Ref: [{pt.range_low} - {pt.range_high}]</span>
                    <span className={pt.status === 'In Range' ? 'text-emerald-700 font-bold' : 'text-amber-800 font-bold'}>
                      {pt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border border-[#A5BEB0]/40 rounded-xl bg-[#E5EEE6]/30 text-xs text-[#52635B]">
            Upload multiple authentic reports over time to view your historical laboratory trajectory.
          </div>
        )}
      </div>
    </div>
  );
};
