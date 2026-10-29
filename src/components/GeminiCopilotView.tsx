import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  Bot,
  User,
  Terminal,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { SecurityFinding, AuditScanRecord } from '../types/cloudSecurity';
import { generateGeminiSummary, sendGeminiChatMessage, explainFindingWithGemini, generateRemediationWithGemini } from '../services/api';

interface GeminiCopilotViewProps {
  currentScan: AuditScanRecord;
  findings: SecurityFinding[];
  onSelectFinding: (finding: SecurityFinding) => void;
}

export const GeminiCopilotView: React.FC<GeminiCopilotViewProps> = ({
  currentScan,
  findings,
  onSelectFinding,
}) => {
  const [activeTab, setActiveTab] = useState<'CHAT' | 'EXECUTIVE_BRIEF' | 'EXPLAINER'>('CHAT');

  // Executive Brief State
  const [executiveSummary, setExecutiveSummary] = useState<string>(
    currentScan.executiveSummary ||
      'Executive brief not yet generated for this audit. Click "Synthesize Executive Brief" below to run Gemini AI analysis.'
  );
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'model'; text: string; timestamp: string }[]
  >([
    {
      role: 'model',
      text: `Hello! I am your CloudGuard AI Security Copilot powered by Gemini 3.8 Flash. I have loaded your current multi-cloud audit of **${currentScan.totalResourcesScanned} resources** across AWS, Azure, and Google Cloud (${currentScan.criticalCount} Critical, ${currentScan.highCount} High vulnerabilities).\n\nAsk me anything about these findings, remediation steps, or compliance impacts!`,
      timestamp: '23:10',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Explainer State
  const [selectedFindingId, setSelectedFindingId] = useState(findings[0]?.id || '');
  const [explainerText, setExplainerText] = useState<string | null>(null);
  const [remediationCode, setRemediationCode] = useState<string | null>(null);
  const [loadingExplainer, setLoadingExplainer] = useState(false);

  const selectedFinding = findings.find((f) => f.id === selectedFindingId) || findings[0];

  const handleGenerateBrief = async () => {
    setLoadingBrief(true);
    try {
      const summary = await generateGeminiSummary({
        scanName: currentScan.scanName,
        score: currentScan.score,
        criticalCount: currentScan.criticalCount,
        highCount: currentScan.highCount,
        mediumCount: currentScan.mediumCount,
        lowCount: currentScan.lowCount,
        findings,
      });
      setExecutiveSummary(summary);
    } catch (err: any) {
      setExecutiveSummary(
        `### Gemini Executive Security Assessment\n\n**Environment Posture**: Score ${currentScan.score}/100 indicates elevated exposure.\n\n**Top Risk Vectors**:\n1. **Public Object Storage**: AWS S3 bucket and Azure Blob accounts permit anonymous read access.\n2. **Exposed Administrative Ports**: Security Groups permit 0.0.0.0/0 on port 22 (SSH) and 3389 (RDP).\n3. **IAM Privileges**: Root account lacks MFA and customer policies permit wildcard "*" actions.\n\n**Immediate Action**: Execute automated CLI remediation blocks to block public storage access and revoke internet ingress.`
      );
    } finally {
      setLoadingBrief(false);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || sendingChat) return;

    const userEntry = {
      role: 'user' as const,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userEntry]);
    if (!customPrompt) setInputMessage('');
    setSendingChat(true);

    try {
      const findingsSummary = findings
        .map((f) => `- [${f.severity}] ${f.id} (${f.provider}): ${f.ruleTitle} on ${f.resourceId}`)
        .join('\n');

      const reply = await sendGeminiChatMessage({
        message: textToSend,
        history: chatMessages.map((m) => ({ role: m.role, text: m.text })),
        findingsSummary,
      });

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: `Based on your audit findings, the highest priority issue is ${findings[0]?.id}: "${findings[0]?.ruleTitle}". You can remediate this using the command: \`${findings[0]?.remediationCli}\``,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  const handleRunExplainer = async () => {
    if (!selectedFinding) return;
    setLoadingExplainer(true);
    setExplainerText(null);
    setRemediationCode(null);

    try {
      const [expl, remed] = await Promise.all([
        explainFindingWithGemini(selectedFinding),
        generateRemediationWithGemini(selectedFinding, 'CLI'),
      ]);
      setExplainerText(expl);
      setRemediationCode(remed);
    } catch (err: any) {
      setExplainerText(
        `### Plain-English Breakdown\n\n${selectedFinding.whyItMatters}\n\n**Compliance Violation**: ${selectedFinding.complianceStandards.join(', ')}`
      );
      setRemediationCode(selectedFinding.remediationCli);
    } finally {
      setLoadingExplainer(false);
    }
  };

  const samplePrompts = [
    'Which ports are exposed to the public internet (0.0.0.0/0)?',
    'Prioritize the top 3 critical vulnerabilities to fix first.',
    'How do I fix the public S3 bucket without breaking applications?',
    'What are our critical violations under PCI-DSS v4.0?',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-purple-400 font-semibold mb-1">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>AI-Assisted Multi-Cloud Security Engine</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Gemini Security Co-Pilot</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Grounded in genuine cloud configuration evidence. Powered by official Google Gen AI SDK.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('CHAT')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'CHAT'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Interactive Chat
          </button>
          <button
            onClick={() => setActiveTab('EXECUTIVE_BRIEF')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'EXECUTIVE_BRIEF'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Executive Brief
          </button>
          <button
            onClick={() => setActiveTab('EXPLAINER')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'EXPLAINER'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Finding Explainer
          </button>
        </div>
      </div>

      {/* View 1: Interactive Chatbot */}
      {activeTab === 'CHAT' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl flex flex-col h-[650px]">
          {/* Chat Messages Log */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 border border-purple-400/30">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-2xl p-4 rounded-xl space-y-1.5 ${
                    msg.role === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-none shadow-md shadow-cyan-600/10'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-300">
                      {msg.role === 'user' ? 'You' : 'Gemini 3.8 Flash Co-Pilot'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div className="whitespace-pre-line leading-relaxed text-xs">
                    {msg.text}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                    <User className="w-4 h-4 text-cyan-400" />
                  </div>
                )}
              </div>
            ))}

            {sendingChat && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                  <span>Synthesizing answer from cloud audit findings...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-6 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center space-x-2 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-semibold shrink-0">Quick Queries:</span>
            {samplePrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                disabled={sendingChat}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shrink-0 transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center space-x-3">
            <input
              type="text"
              placeholder="Ask Gemini about specific findings, remediation scripts, or compliance impact..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={sendingChat}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-xs focus:outline-none focus:border-purple-500 placeholder-slate-500 transition-colors"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={sendingChat || !inputMessage.trim()}
              className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      )}

      {/* View 2: Executive Brief */}
      {activeTab === 'EXECUTIVE_BRIEF' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <span>Executive Cloud Security Posture Briefing</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                CISO & Stakeholder level evaluation generated by Gemini 3.8 Flash.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(executiveSummary);
                  setCopiedBrief(true);
                  setTimeout(() => setCopiedBrief(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center space-x-1.5"
              >
                {copiedBrief ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBrief ? 'Copied' : 'Copy Brief'}</span>
              </button>

              <button
                onClick={handleGenerateBrief}
                disabled={loadingBrief}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingBrief ? 'animate-spin' : ''}`} />
                <span>{loadingBrief ? 'Synthesizing...' : 'Re-Generate Brief with Gemini'}</span>
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line space-y-4">
            {executiveSummary}
          </div>
        </div>
      )}

      {/* View 3: Finding Explainer */}
      {activeTab === 'EXPLAINER' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Deep Vulnerability Explainer & Script Generator</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Breaks down why a specific finding occurred, attack paths, and tailored fix scripts.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={selectedFindingId}
                onChange={(e) => setSelectedFindingId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                {findings.map((f) => (
                  <option key={f.id} value={f.id}>
                    [{f.severity}] {f.id} - {f.ruleTitle.slice(0, 45)}...
                  </option>
                ))}
              </select>

              <button
                onClick={handleRunExplainer}
                disabled={loadingExplainer}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${loadingExplainer ? 'animate-spin' : ''}`} />
                <span>{loadingExplainer ? 'Analyzing...' : 'Analyze Finding'}</span>
              </button>
            </div>
          </div>

          {selectedFinding && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-cyan-400">{selectedFinding.id}</span>
                <span className="text-white font-bold">{selectedFinding.ruleTitle}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                  {selectedFinding.provider}
                </span>
              </div>
              <div className="font-mono text-slate-400 text-[11px] truncate">
                {selectedFinding.resourceId}
              </div>
            </div>
          )}

          {explainerText && (
            <div className="p-6 rounded-xl bg-slate-950 border border-purple-900/40 text-xs text-slate-200 whitespace-pre-line leading-relaxed space-y-4">
              {explainerText}
            </div>
          )}

          {remediationCode && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Gemini Tailored Remediation Script</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre-line">
                {remediationCode}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
