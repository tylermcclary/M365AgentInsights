import { meetings, clients, getCommunicationsByClient, type SampleMeeting, type SampleClient } from "@/data/sampleData";
import { MeetingAnalysisService, type MeetingAnalysis, type MeetingRecommendations } from "@/services/meeting-analysis";
import { AIProcessingManager } from "@/services/ai-processing-manager";
import { analyzeClientCommunications } from "@/services/ai-insights";
import { triggerAnalysisForClient, triggerAnalysisForMeeting } from "@/services/contextAnalyzer";

export interface TestScenario {
  name: string;
  description: string;
  clientId: string;
  meetingIds: string[];
  expectedInsights: string[];
  testType: "urgent" | "portfolio" | "life_event" | "market_volatility" | "mixed";
}

export interface TestResult {
  scenario: TestScenario;
  passed: boolean;
  errors: string[];
  insights: any;
  processingTime: number;
  aiMode: "mock" | "nlp" | "openai";
}

export class MeetingTestSuite {
  private aiProcessingManager: AIProcessingManager;
  private testResults: TestResult[] = [];

  constructor() {
    this.aiProcessingManager = new AIProcessingManager();
  }

  /**
   * Run comprehensive tests for all AI processing modes
   */
  async runAllTests(): Promise<TestResult[]> {
    console.log("🧪 Starting comprehensive meeting AI system tests...");
    
    const testScenarios = this.generateTestScenarios();
    const aiModes: Array<"mock" | "nlp" | "openai"> = ["mock", "nlp", "openai"];
    
    for (const aiMode of aiModes) {
      console.log(`\n📊 Testing AI Mode: ${aiMode.toUpperCase()}`);
      this.aiProcessingManager = new AIProcessingManager({ mode: aiMode });
      
      for (const scenario of testScenarios) {
        const result = await this.runScenarioTest(scenario, aiMode);
        this.testResults.push(result);
        
        if (result.passed) {
          console.log(`✅ ${scenario.name} - PASSED`);
        } else {
          console.log(`❌ ${scenario.name} - FAILED: ${result.errors.join(", ")}`);
        }
      }
    }
    
    this.generateTestReport();
    return this.testResults;
  }

  /**
   * Test specific meeting scenarios
   */
  async testMeetingScenarios(): Promise<TestResult[]> {
    const scenarios = this.generateMeetingScenarios();
    
    for (const scenario of scenarios) {
      const result = await this.runScenarioTest(scenario, "mock");
      this.testResults.push(result);
    }
    
    return this.testResults;
  }

  /**
   * Test mixed communication types (emails + meetings)
   */
  async testMixedCommunications(): Promise<TestResult[]> {
    console.log("🔄 Testing mixed communication analysis...");
    
    const mixedScenarios = this.generateMixedCommunicationScenarios();
    
    for (const scenario of mixedScenarios) {
      const result = await this.runMixedCommunicationTest(scenario);
      this.testResults.push(result);
    }
    
    return this.testResults;
  }

  /**
   * Test real-time AI insights during meeting scheduling
   */
  async testRealtimeInsights(): Promise<TestResult[]> {
    console.log("⚡ Testing real-time AI insights...");
    
    const realtimeScenarios = this.generateRealtimeScenarios();
    
    for (const scenario of realtimeScenarios) {
      const result = await this.runRealtimeTest(scenario);
      this.testResults.push(result);
    }
    
    return this.testResults;
  }

  /**
   * Test context analyzer triggers for meeting events
   */
  async testContextAnalyzerTriggers(): Promise<TestResult[]> {
    console.log("🎯 Testing context analyzer triggers...");
    
    const triggerScenarios = this.generateTriggerScenarios();
    
    for (const scenario of triggerScenarios) {
      const result = await this.runTriggerTest(scenario);
      this.testResults.push(result);
    }
    
    return this.testResults;
  }

  /**
   * Test meeting completion and follow-up workflows
   */
  async testCompletionWorkflows(): Promise<TestResult[]> {
    console.log("📝 Testing meeting completion workflows...");
    
    const completionScenarios = this.generateCompletionScenarios();
    
    for (const scenario of completionScenarios) {
      const result = await this.runCompletionTest(scenario);
      this.testResults.push(result);
    }
    
    return this.testResults;
  }

  /**
   * Test error handling for edge cases
   */
  async testErrorHandling(): Promise<TestResult[]> {
    console.log("🚨 Testing error handling...");
    
    const errorScenarios = this.generateErrorScenarios();
    
    for (const scenario of errorScenarios) {
      const result = await this.runErrorTest(scenario);
      this.testResults.push(result);
    }
    
    return this.testResults;
  }

  // Private helper methods
  private generateTestScenarios(): TestScenario[] {
    return [
      {
        name: "High-Performing Client",
        description: "Client with excellent portfolio performance and regular meetings",
        clientId: "client-1",
        meetingIds: meetings.filter(m => m.clientId === "client-1").map(m => m.id),
        expectedInsights: ["high performance", "satisfied client", "regular meetings"],
        testType: "portfolio"
      },
      {
        name: "Market Anxiety Client",
        description: "Client with market concerns and urgent consultations",
        clientId: "client-2",
        meetingIds: meetings.filter(m => m.clientId === "client-2").map(m => m.id),
        expectedInsights: ["market anxiety", "urgent consultations", "risk tolerance"],
        testType: "urgent"
      },
      {
        name: "Life Event Client",
        description: "Client going through major life events (wedding, home purchase)",
        clientId: "client-3",
        meetingIds: meetings.filter(m => m.clientId === "client-3").map(m => m.id),
        expectedInsights: ["life events", "goal adjustments", "financial planning"],
        testType: "life_event"
      },
      {
        name: "Market Volatility Client",
        description: "Client experiencing market volatility and recovery",
        clientId: "client-4",
        meetingIds: meetings.filter(m => m.clientId === "client-4").map(m => m.id),
        expectedInsights: ["market volatility", "recovery strategy", "risk management"],
        testType: "market_volatility"
      },
      {
        name: "Business Owner Client",
        description: "Business owner with complex succession planning needs",
        clientId: "client-5",
        meetingIds: meetings.filter(m => m.clientId === "client-5").map(m => m.id),
        expectedInsights: ["business succession", "tax planning", "retirement planning"],
        testType: "mixed"
      }
    ];
  }

  private generateMeetingScenarios(): TestScenario[] {
    return [
      {
        name: "Urgent Market Consultation",
        description: "Urgent consultation for market crash concerns",
        clientId: "client-2",
        meetingIds: meetings.filter(m => m.clientId === "client-2" && m.meetingType === "urgent_consultation").map(m => m.id),
        expectedInsights: ["urgent", "market concerns", "anxiety"],
        testType: "urgent"
      },
      {
        name: "Portfolio Review Meeting",
        description: "Comprehensive portfolio review meeting",
        clientId: "client-1",
        meetingIds: meetings.filter(m => m.clientId === "client-1" && m.meetingType === "portfolio_review").map(m => m.id),
        expectedInsights: ["performance", "rebalancing", "goals"],
        testType: "portfolio"
      },
      {
        name: "Life Event Planning",
        description: "Planning session for major life events",
        clientId: "client-3",
        meetingIds: meetings.filter(m => m.clientId === "client-3" && m.meetingType === "planning_session").map(m => m.id),
        expectedInsights: ["life events", "planning", "adjustments"],
        testType: "life_event"
      }
    ];
  }

  private generateMixedCommunicationScenarios(): TestScenario[] {
    return [
      {
        name: "Email + Meeting Analysis",
        description: "Analysis combining email communications with meeting data",
        clientId: "client-1",
        meetingIds: meetings.filter(m => m.clientId === "client-1").map(m => m.id),
        expectedInsights: ["mixed communications", "comprehensive analysis"],
        testType: "mixed"
      }
    ];
  }

  private generateRealtimeScenarios(): TestScenario[] {
    return [
      {
        name: "Real-time Meeting Scheduling",
        description: "AI insights during meeting scheduling process",
        clientId: "client-1",
        meetingIds: [],
        expectedInsights: ["real-time", "scheduling", "insights"],
        testType: "mixed"
      }
    ];
  }

  private generateTriggerScenarios(): TestScenario[] {
    return [
      {
        name: "Meeting Selection Trigger",
        description: "Context analyzer triggered by meeting selection",
        clientId: "client-1",
        meetingIds: meetings.filter(m => m.clientId === "client-1").slice(0, 1).map(m => m.id),
        expectedInsights: ["trigger", "context", "analysis"],
        testType: "mixed"
      }
    ];
  }

  private generateCompletionScenarios(): TestScenario[] {
    return [
      {
        name: "Meeting Completion Workflow",
        description: "Complete meeting completion and follow-up generation",
        clientId: "client-1",
        meetingIds: meetings.filter(m => m.clientId === "client-1" && m.status === "completed").slice(0, 1).map(m => m.id),
        expectedInsights: ["completion", "follow-up", "workflow"],
        testType: "mixed"
      }
    ];
  }

  private generateErrorScenarios(): TestScenario[] {
    return [
      {
        name: "Invalid Client ID",
        description: "Test with non-existent client ID",
        clientId: "invalid-client-id",
        meetingIds: [],
        expectedInsights: [],
        testType: "mixed"
      },
      {
        name: "Empty Meeting Data",
        description: "Test with empty meeting data",
        clientId: "client-1",
        meetingIds: [],
        expectedInsights: [],
        testType: "mixed"
      }
    ];
  }

  private async runScenarioTest(scenario: TestScenario, aiMode: "mock" | "nlp" | "openai"): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let insights: any = null;

    try {
      // Test meeting analysis
      const meetingRecommendations = MeetingAnalysisService.analyzeClientMeetingPatterns(scenario.clientId);
      const meetingSeries = MeetingAnalysisService.analyzeMeetingSeries(scenario.clientId);
      const meetingTemplates = MeetingAnalysisService.generateMeetingTemplates(scenario.clientId);

      insights = {
        recommendations: meetingRecommendations,
        series: meetingSeries,
        templates: meetingTemplates
      };

      // Validate insights
      if (!meetingRecommendations) {
        errors.push("No meeting recommendations generated");
      }

      if (!meetingSeries || meetingSeries.length === 0) {
        errors.push("No meeting series analysis generated");
      }

      if (!meetingTemplates || meetingTemplates.length === 0) {
        errors.push("No meeting templates generated");
      }

    } catch (error) {
      errors.push(`Analysis error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const processingTime = Date.now() - startTime;
    const passed = errors.length === 0;

    return {
      scenario,
      passed,
      errors,
      insights,
      processingTime,
      aiMode
    };
  }

  private async runMixedCommunicationTest(scenario: TestScenario): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let insights: any = null;

    try {
      const client = clients.find(c => c.id === scenario.clientId);
      if (!client) {
        errors.push("Client not found");
        return {
          scenario,
          passed: false,
          errors,
          insights: null,
          processingTime: Date.now() - startTime,
          aiMode: "mock"
        };
      }

      // Test mixed communication analysis
      const comms = getCommunicationsByClient(client.id);
      const clientCommunications = [
        ...comms.emails.map(m => ({
          id: m.id,
          type: "email" as const,
          from: client.email,
          subject: m.subject,
          body: m.body,
          timestamp: m.receivedDateTime,
        })),
        ...comms.meetings.map(m => ({
          id: m.id,
          type: "meeting" as const,
          from: client.email,
          subject: m.subject,
          body: m.description,
          timestamp: m.startTime,
          meetingType: m.meetingType,
          meetingStatus: m.status,
          meetingDuration: Math.round((new Date(m.endTime).getTime() - new Date(m.startTime).getTime()) / (1000 * 60)),
          meetingLocation: m.location,
          meetingUrl: m.meetingUrl,
          meetingAgenda: m.agenda,
          meetingNotes: m.notes,
          attendees: m.attendees,
          endTime: m.endTime,
        }))
      ];
      
      const communications = await this.aiProcessingManager.processClientCommunications(client.email, clientCommunications);
      insights = communications;

      // Validate mixed analysis
      if (!communications) {
        errors.push("No mixed communication analysis generated");
      }

    } catch (error) {
      errors.push(`Mixed communication error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const processingTime = Date.now() - startTime;
    const passed = errors.length === 0;

    return {
      scenario,
      passed,
      errors,
      insights,
      processingTime,
      aiMode: "mock"
    };
  }

  private async runRealtimeTest(scenario: TestScenario): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let insights: any = null;

    try {
      // Simulate real-time meeting scheduling
      const client = clients.find(c => c.id === scenario.clientId);
      if (!client) {
        errors.push("Client not found");
        return {
          scenario,
          passed: false,
          errors,
          insights: null,
          processingTime: Date.now() - startTime,
          aiMode: "mock"
        };
      }

      // Test real-time analysis
      const comms = getCommunicationsByClient(client.id);
      const clientCommunications = [
        ...comms.emails.map(m => ({
          id: m.id,
          type: "email" as const,
          from: client.email,
          subject: m.subject,
          body: m.body,
          timestamp: m.receivedDateTime,
        })),
        ...comms.meetings.map(m => ({
          id: m.id,
          type: "meeting" as const,
          from: client.email,
          subject: m.subject,
          body: m.description,
          timestamp: m.startTime,
          meetingType: m.meetingType,
          meetingStatus: m.status,
          meetingDuration: Math.round((new Date(m.endTime).getTime() - new Date(m.startTime).getTime()) / (1000 * 60)),
          meetingLocation: m.location,
          meetingUrl: m.meetingUrl,
          meetingAgenda: m.agenda,
          meetingNotes: m.notes,
          attendees: m.attendees,
          endTime: m.endTime,
        }))
      ];
      
      const realtimeInsights = await this.aiProcessingManager.processClientCommunications(client.email, clientCommunications);
      insights = realtimeInsights;

      if (!realtimeInsights) {
        errors.push("No real-time insights generated");
      }

    } catch (error) {
      errors.push(`Real-time test error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const processingTime = Date.now() - startTime;
    const passed = errors.length === 0;

    return {
      scenario,
      passed,
      errors,
      insights,
      processingTime,
      aiMode: "mock"
    };
  }

  private async runTriggerTest(scenario: TestScenario): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let insights: any = null;

    try {
      const client = clients.find(c => c.id === scenario.clientId);
      if (!client) {
        errors.push("Client not found");
        return {
          scenario,
          passed: false,
          errors,
          insights: null,
          processingTime: Date.now() - startTime,
          aiMode: "mock"
        };
      }

      // Test context analyzer trigger
      if (scenario.meetingIds.length > 0) {
        await triggerAnalysisForMeeting(scenario.meetingIds[0], client.email);
      } else {
        await triggerAnalysisForClient(client.email);
      }

      insights = { triggered: true };

    } catch (error) {
      errors.push(`Trigger test error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const processingTime = Date.now() - startTime;
    const passed = errors.length === 0;

    return {
      scenario,
      passed,
      errors,
      insights,
      processingTime,
      aiMode: "mock"
    };
  }

  private async runCompletionTest(scenario: TestScenario): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let insights: any = null;

    try {
      const meeting = meetings.find(m => m.id === scenario.meetingIds[0]);
      if (!meeting) {
        errors.push("Meeting not found");
        return {
          scenario,
          passed: false,
          errors,
          insights: null,
          processingTime: Date.now() - startTime,
          aiMode: "mock"
        };
      }

      // Test meeting completion analysis
      const mockAnalysis: MeetingAnalysis = {
        effectivenessScore: 8,
        clientSatisfaction: "high",
        keyTopics: ["portfolio review", "performance"],
        actionItems: [
          {
            id: "action-1",
            description: "Send updated portfolio allocation",
            priority: "high",
            dueDate: "2024-01-15",
            assignedTo: "advisor",
            status: "pending"
          }
        ],
        followUpNeeded: true,
        nextMeetingSuggested: true,
        relationshipImpact: "positive",
        insights: ["Client showed high engagement", "Portfolio concerns addressed"]
      };

      // Test follow-up generation
      const followUpSuggestions = MeetingAnalysisService.generateFollowUpSuggestions(meeting.id, mockAnalysis);
      insights = { analysis: mockAnalysis, followUps: followUpSuggestions };

      if (!followUpSuggestions || followUpSuggestions.length === 0) {
        errors.push("No follow-up suggestions generated");
      }

    } catch (error) {
      errors.push(`Completion test error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const processingTime = Date.now() - startTime;
    const passed = errors.length === 0;

    return {
      scenario,
      passed,
      errors,
      insights,
      processingTime,
      aiMode: "mock"
    };
  }

  private async runErrorTest(scenario: TestScenario): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let insights: any = null;

    try {
      // Test error handling
      if (scenario.clientId === "invalid-client-id") {
        const invalidRecommendations = MeetingAnalysisService.analyzeClientMeetingPatterns(scenario.clientId);
        insights = invalidRecommendations;
        
        // Should handle gracefully
        if (!invalidRecommendations) {
          errors.push("Should return default recommendations for invalid client");
        }
      }

      if (scenario.meetingIds.length === 0) {
        const emptyRecommendations = MeetingAnalysisService.analyzeClientMeetingPatterns(scenario.clientId);
        insights = emptyRecommendations;
        
        // Should handle gracefully
        if (!emptyRecommendations) {
          errors.push("Should return default recommendations for empty meetings");
        }
      }

    } catch (error) {
      // Expected for error scenarios
      insights = { error: error instanceof Error ? error.message : String(error) };
    }

    const processingTime = Date.now() - startTime;
    const passed = errors.length === 0;

    return {
      scenario,
      passed,
      errors,
      insights,
      processingTime,
      aiMode: "mock"
    };
  }

  private generateTestReport(): void {
    console.log("\n📊 TEST REPORT SUMMARY");
    console.log("=" .repeat(50));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      console.log("\n❌ FAILED TESTS:");
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`- ${r.scenario.name}: ${r.errors.join(", ")}`);
        });
    }
    
    console.log("\n⏱️ PERFORMANCE SUMMARY:");
    const avgProcessingTime = this.testResults.reduce((sum, r) => sum + r.processingTime, 0) / totalTests;
    console.log(`Average Processing Time: ${avgProcessingTime.toFixed(2)}ms`);
    
    const aiModeStats = this.testResults.reduce((stats, r) => {
      stats[r.aiMode] = (stats[r.aiMode] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);
    
    console.log("\n🤖 AI MODE STATISTICS:");
    Object.entries(aiModeStats).forEach(([mode, count]) => {
      console.log(`${mode.toUpperCase()}: ${count} tests`);
    });
  }
}

// Export test utilities
export const runMeetingTests = async (): Promise<TestResult[]> => {
  const testSuite = new MeetingTestSuite();
  return await testSuite.runAllTests();
};

export const runMeetingScenarioTests = async (): Promise<TestResult[]> => {
  const testSuite = new MeetingTestSuite();
  return await testSuite.testMeetingScenarios();
};

export const runMixedCommunicationTests = async (): Promise<TestResult[]> => {
  const testSuite = new MeetingTestSuite();
  return await testSuite.testMixedCommunications();
};

export const runRealtimeInsightTests = async (): Promise<TestResult[]> => {
  const testSuite = new MeetingTestSuite();
  return await testSuite.testRealtimeInsights();
};

export const runContextAnalyzerTests = async (): Promise<TestResult[]> => {
  const testSuite = new MeetingTestSuite();
  return await testSuite.testContextAnalyzerTriggers();
};

export const runCompletionWorkflowTests = async (): Promise<TestResult[]> => {
  const testSuite = new MeetingTestSuite();
  return await testSuite.testCompletionWorkflows();
};

export const runErrorHandlingTests = async (): Promise<TestResult[]> => {
  const testSuite = new MeetingTestSuite();
  return await testSuite.testErrorHandling();
};
