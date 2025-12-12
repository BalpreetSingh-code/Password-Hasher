import React, { useState } from 'react';
import { analyzePasswordWithAI } from '../services/gemini';
import { calculateEntropy, getStrengthScore } from '../utils/security';

const Analyzer: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{feedback: string, crackTimeEstimate: string, vulnerabilities: string[]} | null>(null);

  const localMetrics = password ? getStrengthScore(password) : null;
  const entropy = password ? calculateEntropy(password) : 0;

  const handleAnalyze = async () => {
    if (!password) return;
    setIsAnalyzing(true);
    const result = await analyzePasswordWithAI(password);
    setAiResult(result);
    setIsAnalyzing(false);
  };

  const handleClear = () => {
    setPassword('');
    setAiResult(null);
  };

  return (
    <div className="p-6 space-y-8">
       <div className="bg-blue-100 border-2 border-black p-4 text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        PRIVACY NOTICE: Analysis happens securely. Your password is sent to our AI for transient analysis but is never logged or stored.
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-bold uppercase">Password to Analyze</label>
        <div className="relative">
            <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                    setAiResult(null); // Clear previous AI result on change
                }}
                className="w-full p-4 border-2 border-black text-lg font-mono focus:outline-none focus:ring-0 rounded-none bg-white"
                placeholder="Enter password..."
            />
            <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase underline"
            >
                {showPassword ? "Hide" : "Show"}
            </button>
        </div>
        
        <div className="flex gap-4">
            <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !password}
                className="flex-1 py-3 bg-black text-white font-bold uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
            >
                {isAnalyzing ? "Analyzing..." : "Analyze Strength"}
            </button>
            <button
                onClick={handleClear}
                className="px-6 py-3 bg-white text-black font-bold uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
            >
                Clear
            </button>
        </div>
      </div>

      {/* Local Metrics Dashboard */}
      {password && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Score Card */}
            <div className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-sm font-bold uppercase mb-4 text-gray-500">Strength Score</h3>
                <div className="flex items-end gap-2">
                    <span className="text-5xl font-black">{localMetrics?.score}</span>
                    <span className="text-xl font-bold text-gray-400">/5</span>
                </div>
                <div className={`mt-2 inline-block px-3 py-1 text-white text-xs font-bold uppercase ${localMetrics?.color}`}>
                    {localMetrics?.label}
                </div>
                <p className="mt-4 text-xs font-mono text-gray-500">Entropy: {entropy} bits</p>
            </div>

            {/* AI Feedback Card */}
            <div className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-sm font-bold uppercase mb-4 text-gray-500">AI Analysis</h3>
                {isAnalyzing ? (
                    <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-gray-200 w-3/4"></div>
                        <div className="h-4 bg-gray-200 w-1/2"></div>
                    </div>
                ) : aiResult ? (
                    <div className="space-y-4">
                        <div>
                            <span className="text-xs font-bold uppercase text-gray-400">Time to Crack</span>
                            <p className="font-bold text-lg">{aiResult.crackTimeEstimate}</p>
                        </div>
                        <div>
                            <span className="text-xs font-bold uppercase text-gray-400">Feedback</span>
                            <p className="text-sm leading-relaxed">{aiResult.feedback}</p>
                        </div>
                         {aiResult.vulnerabilities.length > 0 && (
                            <div>
                                <span className="text-xs font-bold uppercase text-red-500">Vulnerabilities</span>
                                <ul className="list-disc list-inside text-sm mt-1">
                                    {aiResult.vulnerabilities.map((v, i) => (
                                        <li key={i}>{v}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-gray-400 text-sm italic">Run analysis to get detailed insights.</div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Analyzer;
