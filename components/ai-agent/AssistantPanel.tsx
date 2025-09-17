"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  PanelRightOpen,
  PanelRightClose,
  Loader2,
  Sparkles,
  User,
  Mail,
  History,
  Clock,
  CheckCircle2,
  Star,
  ChevronDown,
  ChevronRight,
  Settings,
} from "lucide-react";
import { 
  analyzeClientCommunications, 
  switchAIMode, 
  getCurrentAIMode
} from "@/services/ai-insights";
import { type ClientInsights, type Communication, type AIProcessingMode, type EnhancedClientInsights } from "@/types";
import { subscribeContext } from "@/services/contextAnalyzer";
import Tooltip from "@/components/ui/Tooltip";
import Button from "@/components/ui/Button";

type EmailContext = {
  id?: string;
  sender?: string;
  senderEmail?: string;
  subject?: string;
  body?: string;
  receivedAt?: string; // ISO
};

type SectionKey =
  | "summary"
  | "history"
  | "lastInteraction"
  | "nextActions"
  | "highlights";

export default function AssistantPanel({
  email,
  defaultOpen = true,
  onCollapse,
  communications,
  clientEmail,
}: {
  email?: EmailContext | null;
  defaultOpen?: boolean;
  onCollapse?: () => void;
  communications?: Communication[];
  clientEmail?: string;
}) {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const [loading, setLoading] = useState<boolean>(false);
  const [sectionsOpen, setSectionsOpen] = useState<Record<SectionKey, boolean>>({
    summary: true,
    history: false,
    lastInteraction: true,
    nextActions: true,
    highlights: false,
  });

  const [insights, setInsights] = useState<EnhancedClientInsights | null>(null);
  const [aiMode, setAIMode] = useState<AIProcessingMode>('mock');
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const clientDisplay = useMemo(() => email?.sender ?? "Client", [email?.sender]);

  // Initialize AI mode
  useEffect(() => {
    const initializeMode = async () => {
      try {
        const currentMode = await getCurrentAIMode();
        setAIMode(currentMode);
      } catch (error) {
        console.error('Failed to get current AI mode:', error);
        setAIMode('mock'); // Fallback to mock mode
      }
    };
    
    initializeMode();
  }, []);

  const analyze = useCallback(async () => {
    console.log('=== Starting new analysis ===');
    console.log('📊 Analysis context:', {
      emailSubject: email?.subject,
      emailSender: email?.senderEmail || email?.sender,
      clientEmail,
      aiMode,
      communicationsCount: communications?.length || 0,
      hasEmail: !!email,
      hasCommunications: !!(communications && communications.length > 0)
    });
    
    setLoading(true);
    
    // Clear previous insights to show fresh analysis
    setInsights(null);
    setProcessingTime(null);
    
    try {
      // Set the AI mode before analysis
      await switchAIMode(aiMode);
      
      // Validate and normalize context data
      const clientEmailToUse = clientEmail ?? email?.senderEmail ?? email?.sender;
      
      if (!clientEmailToUse) {
        console.error('📊 No client email available for analysis');
        throw new Error('No client email available for analysis');
      }
      
      // Always analyze all communications for the client, but preserve email context
      let comms: Communication[] = [];
      
      if (communications && communications.length > 0) {
        console.log('📊 Using provided communications:', communications.length);
        comms = communications;
      } else if (email) {
        console.log('📊 Creating communication from selected email');
        comms = [{
          id: email.id ?? "selected",
          type: "email",
          from: email.senderEmail ?? email.sender ?? "Unknown",
          subject: email.subject || "(No subject)",
          body: email.body || "",
          timestamp: email.receivedAt ?? new Date().toISOString(),
        }];
      } else {
        console.warn('📊 No communications or email available for analysis');
        throw new Error('No communications or email available for analysis');
      }
      
      // Validate communications data
      const validComms = comms.filter(c => 
        c.id && c.type && c.from && c.timestamp && 
        (c.subject || c.body || c.type === 'chat')
      );
      
      if (validComms.length === 0) {
        console.warn('📊 No valid communications after filtering');
        throw new Error('No valid communications available for analysis');
      }
      
      console.log('📊 Starting analysis with mode:', aiMode, 'communications:', validComms.length);
      console.log('📊 Client email:', clientEmailToUse);
      console.log('📊 Valid communications:', validComms.map(c => ({
        id: c.id,
        type: c.type,
        subject: c.subject?.substring(0, 50),
        hasBody: !!c.body
      })));
      
      const insightsResp = await analyzeClientCommunications(
        clientEmailToUse, 
        validComms
      );
      
      console.log('Analysis completed:', insightsResp);
      console.log('📊 Insights structure:', {
        hasSummary: !!insightsResp.summary,
        hasLastInteraction: !!insightsResp.lastInteraction,
        recommendedActionsCount: insightsResp.recommendedActions?.length || 0,
        highlightsCount: insightsResp.highlights?.length || 0,
        aiMethod: insightsResp.aiMethod,
        processingTime: insightsResp.processingMetrics.processingTime
      });
      setInsights(insightsResp);
      setProcessingTime(insightsResp.processingMetrics.processingTime);
    } catch (error) {
      console.error('Analysis failed:', error);
      // Set a fallback error state
      setInsights(null);
    } finally {
      setLoading(false);
      console.log('=== Analysis finished ===');
    }
  }, [communications, email, clientEmail, aiMode]);

  // AI mode change handler
  const handleAIModeChange = useCallback(async (newMode: AIProcessingMode) => {
    try {
      console.log(`🔄 Switching AI mode from ${aiMode} to ${newMode}`);
      
      // Set loading state immediately to prevent UI jumping
      setLoading(true);
      
      // Update mode and switch processing
      setAIMode(newMode);
      await switchAIMode(newMode);
      
      // Only re-analyze if we have data and user wants it
      const hasEmail = email && (email.subject || email.body);
      const hasCommunications = communications && communications.length > 0;
      
      if (hasEmail || hasCommunications) {
        console.log(`🔄 Mode changed to ${newMode}, retriggering analysis...`);
        // Use a more controlled approach - don't clear insights immediately
        await analyzeWithMode(newMode);
      } else {
        console.log(`🔄 Mode changed to ${newMode}, but no data available for analysis`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to switch AI mode:', error);
      // Revert to previous mode on error
      const currentMode = await getCurrentAIMode();
      setAIMode(currentMode);
      setLoading(false);
    }
  }, [aiMode, email, communications]);

  // Separate function for mode-specific analysis that doesn't clear UI immediately
  const analyzeWithMode = useCallback(async (mode: AIProcessingMode) => {
    try {
      console.log('=== Starting mode-specific analysis ===');
      console.log('📊 Analysis context:', {
        emailSubject: email?.subject,
        emailSender: email?.senderEmail || email?.sender,
        clientEmail,
        aiMode: mode,
        communicationsCount: communications?.length || 0,
        hasEmail: !!email,
        hasCommunications: !!(communications && communications.length > 0)
      });
      
      // Validate and normalize context data
      const clientEmailToUse = clientEmail ?? email?.senderEmail ?? email?.sender;
      
      if (!clientEmailToUse) {
        console.error('📊 No client email available for analysis');
        throw new Error('No client email available for analysis');
      }
      
      // Always analyze all communications for the client, but preserve email context
      let comms: Communication[] = [];
      
      if (communications && communications.length > 0) {
        console.log('📊 Using provided communications:', communications.length);
        comms = communications;
      } else if (email) {
        console.log('📊 Creating communication from selected email');
        comms = [{
          id: email.id ?? "selected",
          type: "email",
          from: email.senderEmail ?? email.sender ?? "Unknown",
          subject: email.subject || "(No subject)",
          body: email.body || "",
          timestamp: email.receivedAt ?? new Date().toISOString(),
        }];
      } else {
        console.warn('📊 No communications or email available for analysis');
        throw new Error('No communications or email available for analysis');
      }
      
      // Validate communications data
      const validComms = comms.filter(c => 
        c.id && c.type && c.from && c.timestamp && 
        (c.subject || c.body || c.type === 'chat')
      );
      
      if (validComms.length === 0) {
        console.warn('📊 No valid communications after filtering');
        throw new Error('No valid communications available for analysis');
      }
      
      console.log('📊 Starting analysis with mode:', mode, 'communications:', validComms.length);
      console.log('📊 Client email:', clientEmailToUse);
      
      const insightsResp = await analyzeClientCommunications(
        clientEmailToUse, 
        validComms
      );
      
      console.log('Analysis completed:', insightsResp);
      console.log('📊 Insights structure:', {
        hasSummary: !!insightsResp.summary,
        hasLastInteraction: !!insightsResp.lastInteraction,
        recommendedActionsCount: insightsResp.recommendedActions?.length || 0,
        highlightsCount: insightsResp.highlights?.length || 0,
        aiMethod: insightsResp.aiMethod,
        processingTime: insightsResp.processingMetrics.processingTime
      });
      
      // Update insights smoothly without clearing first
      setInsights(insightsResp);
      setProcessingTime(insightsResp.processingMetrics.processingTime);
    } catch (error) {
      console.error('Mode-specific analysis failed:', error);
      // Set a fallback error state
      setInsights(null);
    } finally {
      setLoading(false);
      console.log('=== Mode-specific analysis finished ===');
    }
  }, [communications, email, clientEmail]);

  // Auto-analyze when email or communications change
  useEffect(() => {
    console.log("📧 AssistantPanel useEffect - email changed:", !!email, "communications:", communications?.length, "clientEmail:", clientEmail);
    
    // Clear previous insights when switching to a new email/client
    if (email || (communications && communications.length > 0)) {
      console.log("📧 Clearing previous insights and starting fresh analysis...");
      setInsights(null);
      setProcessingTime(null);
      
      console.log("📧 Auto-triggering analysis for new email context:", {
        emailSubject: email?.subject,
        emailSender: email?.senderEmail || email?.sender,
        clientEmail,
        communicationsCount: communications?.length || 0
      });
      
      // Small delay to ensure UI updates before starting analysis
      setTimeout(() => {
        analyze();
      }, 50);
    } else {
      console.log("📧 No email or communications available, clearing insights");
      setInsights(null);
      setProcessingTime(null);
    }
  }, [email?.id, email?.sender, email?.senderEmail, clientEmail, communications?.length, analyze, communications, email]);

  // Listen for context analyzer events to auto-update insights
  useEffect(() => {
    const unsub = subscribeContext(e => {
      const key = (clientEmail ?? email?.senderEmail ?? email?.sender ?? "").toLowerCase();
      if (!key || e.clientEmail.toLowerCase() === key) {
        // Convert ClientInsights to EnhancedClientInsights for compatibility
        const enhancedInsights: EnhancedClientInsights = {
          ...e.insights,
          lastInteraction: e.insights.lastInteraction ? {
            when: e.insights.lastInteraction.when,
            type: e.insights.lastInteraction.type,
            subject: e.insights.lastInteraction.subject || "(no subject)",
            snippet: e.insights.lastInteraction.snippet || ""
          } : null,
          processingMetrics: {
            processingTime: 0,
            method: 'mock' as AIProcessingMode,
            confidence: 0.5,
            tokensUsed: 0
          },
          aiMethod: 'mock' as AIProcessingMode
        };
        setInsights(enhancedInsights);
      }
    });
    return () => {
      unsub();
    };
  }, [clientEmail, email?.senderEmail, email?.sender]);

  const history = useMemo(() => {
    // Use communications data for history, but format it properly
    const base: Communication[] = communications ?? [];
    return base
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
      .map(i => ({ 
        when: new Date(i.timestamp).toLocaleDateString(), 
        type: i.type, 
        subject: i.subject ?? "(no subject)" 
      }));
  }, [communications]);

  function toggleSection(key: SectionKey) {
    setSectionsOpen(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex flex-col w-full max-w-md h-full bg-white dark:bg-neutral-950">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-neutral-900 dark:to-neutral-900">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <div className="text-sm font-semibold">AI Assistant</div>
        </div>
        <button
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border hover:bg-white/60"
          onClick={() => {
            if (open) {
              onCollapse?.();
            } else {
              setOpen(true);
            }
          }}
        >
          <PanelRightClose className="h-4 w-4" /> Hide
        </button>
      </div>

      {open ? (
        <div className="overflow-y-auto p-3 pb-6 space-y-3 flex-1" style={{ minHeight: 0 }}>
          {/* Analyze button */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-600">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Analyzing context...</span>
                </div>
              ) : communications && communications.length > 0 ? 
                `Analyze ${communications.length} communications${email ? ` (viewing: "${email.subject?.slice(0, 25)}${email.subject && email.subject.length > 25 ? '...' : ''}")` : ''}` :
                email ? `Analyze: "${email.subject?.slice(0, 30)}${email.subject && email.subject.length > 30 ? '...' : ''}"` :
                "No content to analyze"}
            </div>
            <Tooltip content={communications && communications.length > 0 ? "Analyze all communications for this client" : "Analyze the currently selected email"}>
              <span>
                <Button 
                  onClick={analyze} 
                  disabled={loading || (!email && (!communications || communications.length === 0))} 
                  size="sm" 
                  leftIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                >
                  {loading ? "Analyzing..." : insights ? "Re-run analysis" : "Run analysis"}
                </Button>
              </span>
            </Tooltip>
          </div>

          {/* AI Mode Selector */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-neutral-600" />
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                AI Processing Mode:
              </label>
              {loading && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Switching mode...</span>
                </div>
              )}
            </div>
            <select
              value={aiMode}
              onChange={(e) => {
                const newMode = e.target.value as AIProcessingMode;
                // Prevent rapid changes
                if (newMode !== aiMode && !loading) {
                  handleAIModeChange(newMode);
                }
              }}
              disabled={loading}
              className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
            >
              <option value="mock">Mock AI (Fast, Rule-based)</option>
              <option value="nlp">Enhanced NLP (Local Processing)</option>
              <option value="openai">Advanced AI (GPT-4)</option>
            </select>
            
            {processingTime && (
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                Last analysis: {processingTime}ms ({aiMode} mode)
                {insights?.processingMetrics.confidence && (
                  <span className="ml-2">
                    • {Math.round(insights.processingMetrics.confidence * 100)}% confidence
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Client Summary */}
          <Section
            title="Client Summary"
            icon={<User className="h-4 w-4" />}
            open={sectionsOpen.summary}
            onToggle={() => toggleSection("summary")}
            loading={loading}
          >
            <div className="relative">
              {loading && insights && (
                <div className="absolute inset-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm z-10 flex items-center justify-center rounded">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating analysis...</span>
                  </div>
                </div>
              )}
              <p className="text-sm">{insights?.summary.text ?? "Insights will appear here after analysis."}</p>
            </div>
            {insights?.summary.topics?.length ? (
              <div className="text-xs text-neutral-500 mt-2">Topics: {insights.summary.topics.join(", ")}</div>
            ) : null}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-400 mt-2">
                DEBUG: {insights?.summary ? 'Has summary data' : 'No summary data'}
              </div>
            )}
          </Section>

          {/* Client Highlights */}
          <Section
            title="Client Highlights"
            icon={<Star className="h-4 w-4" />}
            open={sectionsOpen.highlights}
            onToggle={() => toggleSection("highlights")}
            loading={loading}
          >
            <dl className="grid grid-cols-1 gap-2">
              {(insights?.highlights ?? []).map((h, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <dt className="w-36 shrink-0 text-neutral-500">{h.label}</dt>
                  <dd className="text-neutral-800">{h.value}</dd>
                </div>
              ))}
              {(!insights?.highlights || insights.highlights.length === 0) && (
                <div className="text-sm text-neutral-500">No highlights yet.</div>
              )}
            </dl>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-400 mt-2">
                DEBUG: {insights?.highlights?.length || 0} highlights
              </div>
            )}
          </Section>

          {/* Recommended Next Actions */}
          <Section
            title="Recommended Next Actions"
            icon={<CheckCircle2 className="h-4 w-4" />}
            open={sectionsOpen.nextActions}
            onToggle={() => toggleSection("nextActions")}
            loading={loading}
          >
            <ul className="list-disc pl-5 space-y-1">
              {(insights?.recommendedActions ?? []).map(a => (
                <li key={a.id} className="text-sm">
                  <span className="font-medium">{a.title}</span>
                  <span className="text-neutral-500"> — {a.rationale}</span>
                </li>
              ))}
              {(!insights?.recommendedActions || insights.recommendedActions.length === 0) && (
                <li className="text-sm text-neutral-500">No suggestions yet.</li>
              )}
            </ul>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-400 mt-2">
                DEBUG: {insights?.recommendedActions?.length || 0} recommended actions
              </div>
            )}
          </Section>

          {/* Last Interaction Summary */}
          <Section
            title="Last Interaction Summary"
            icon={<Clock className="h-4 w-4" />}
            open={sectionsOpen.lastInteraction}
            onToggle={() => toggleSection("lastInteraction")}
            loading={loading}
          >
            <p className="text-sm">
              {insights?.lastInteraction
                ? `${new Date(insights.lastInteraction.when).toLocaleDateString()} • ${insights.lastInteraction.type} • ${insights.lastInteraction.subject ?? "(no subject)"}`
                : "Awaiting analysis."}
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-400 mt-2">
                DEBUG: {insights?.lastInteraction ? 'Has lastInteraction data' : 'No lastInteraction data'}
              </div>
            )}
          </Section>

          {/* Communication History */}
          <Section
            title="Communication History"
            icon={<History className="h-4 w-4" />}
            open={sectionsOpen.history}
            onToggle={() => toggleSection("history")}
            loading={loading}
          >
            <ul className="space-y-2">
              {history.map((i, idx) => (
                <li key={idx} className="text-sm">
                  <span className="text-neutral-500 mr-2">{i.when}</span>
                  <span className="font-medium mr-2">{i.type}</span>
                  <span className="text-neutral-700">{i.subject}</span>
                </li>
              ))}
              {history.length === 0 && <li className="text-sm text-neutral-500">No items found for this contact.</li>}
            </ul>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-400 mt-2">
                DEBUG: {history.length} items from {communications?.length || 0} communications
              </div>
            )}
          </Section>

        </div>
      ) : null}
    </div>
  );
}

function Section({
  title,
  icon,
  open,
  onToggle,
  loading,
  children,
}: {
  title: string;
  icon: React.ReactElement;
  open: boolean;
  onToggle: () => void;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-md overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border-b"
      >
        <div className="flex items-center gap-2">
          {icon}
          <div className="text-sm font-semibold">{title}</div>
        </div>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {open && (
        <div className="p-3">
          {loading ? (
            <div className="text-xs text-neutral-500 inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}


