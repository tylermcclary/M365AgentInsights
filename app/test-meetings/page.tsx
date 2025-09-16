"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Users,
  Calendar,
  Brain,
  Zap,
  Cpu,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { 
  runMeetingTests,
  runMeetingScenarioTests,
  runMixedCommunicationTests,
  runRealtimeInsightTests,
  runContextAnalyzerTests,
  runCompletionWorkflowTests,
  runErrorHandlingTests,
  type TestResult
} from "@/services/meeting-test-utils";
import MeetingErrorBoundary, { MeetingLoadingState, MeetingErrorDisplay } from "@/components/calendar/MeetingErrorBoundary";

export default function TestMeetingsPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>("");
  const [error, setError] = useState<Error | null>(null);
  const [selectedTestSuite, setSelectedTestSuite] = useState<string>("all");

  const testSuites = [
    { id: "all", name: "All Tests", icon: Play, description: "Run comprehensive test suite" },
    { id: "scenarios", name: "Meeting Scenarios", icon: Calendar, description: "Test different meeting types" },
    { id: "mixed", name: "Mixed Communications", icon: Users, description: "Test email + meeting analysis" },
    { id: "realtime", name: "Real-time Insights", icon: Zap, description: "Test real-time AI insights" },
    { id: "triggers", name: "Context Triggers", icon: Brain, description: "Test context analyzer triggers" },
    { id: "completion", name: "Completion Workflows", icon: CheckCircle, description: "Test meeting completion" },
    { id: "errors", name: "Error Handling", icon: AlertTriangle, description: "Test error scenarios" },
  ];

  const runTests = async (suiteId: string) => {
    setIsRunning(true);
    setError(null);
    setTestResults([]);
    setSelectedTestSuite(suiteId);

    try {
      let results: TestResult[] = [];

      switch (suiteId) {
        case "all":
          setCurrentTest("Running comprehensive test suite...");
          results = await runMeetingTests();
          break;
        case "scenarios":
          setCurrentTest("Testing meeting scenarios...");
          results = await runMeetingScenarioTests();
          break;
        case "mixed":
          setCurrentTest("Testing mixed communications...");
          results = await runMixedCommunicationTests();
          break;
        case "realtime":
          setCurrentTest("Testing real-time insights...");
          results = await runRealtimeInsightTests();
          break;
        case "triggers":
          setCurrentTest("Testing context triggers...");
          results = await runContextAnalyzerTests();
          break;
        case "completion":
          setCurrentTest("Testing completion workflows...");
          results = await runCompletionWorkflowTests();
          break;
        case "errors":
          setCurrentTest("Testing error handling...");
          results = await runErrorHandlingTests();
          break;
        default:
          throw new Error(`Unknown test suite: ${suiteId}`);
      }

      setTestResults(results);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsRunning(false);
      setCurrentTest("");
    }
  };

  const getTestStats = () => {
    const total = testResults.length;
    const passed = testResults.filter(r => r.passed).length;
    const failed = total - passed;
    const avgTime = total > 0 ? testResults.reduce((sum, r) => sum + r.processingTime, 0) / total : 0;

    return { total, passed, failed, avgTime };
  };

  const getAIStats = () => {
    const stats = testResults.reduce((acc, result) => {
      acc[result.aiMode] = (acc[result.aiMode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return stats;
  };

  const stats = getTestStats();
  const aiStats = getAIStats();

  return (
    <MeetingErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Meeting AI System Test Suite
            </h1>
            <p className="text-gray-600">
              Comprehensive testing for calendar meeting AI analysis, insights, and workflows
            </p>
          </div>

          {/* Test Suites */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {testSuites.map((suite) => {
              const Icon = suite.icon;
              const isSelected = selectedTestSuite === suite.id;
              const isRunningThisSuite = isRunning && selectedTestSuite === suite.id;

              return (
                <button
                  key={suite.id}
                  onClick={() => runTests(suite.id)}
                  disabled={isRunning}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  } ${isRunning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center mb-2">
                    <Icon className={`h-5 w-5 mr-2 ${isSelected ? "text-blue-600" : "text-gray-600"}`} />
                    <h3 className={`font-medium ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                      {suite.name}
                    </h3>
                  </div>
                  <p className={`text-sm ${isSelected ? "text-blue-700" : "text-gray-600"}`}>
                    {suite.description}
                  </p>
                  {isRunningThisSuite && (
                    <div className="mt-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Current Test Status */}
          {isRunning && (
            <div className="mb-8">
              <MeetingLoadingState 
                message={currentTest}
                showProgress={true}
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-8">
              <MeetingErrorDisplay 
                error={error}
                onRetry={() => runTests(selectedTestSuite)}
                onDismiss={() => setError(null)}
              />
            </div>
          )}

          {/* Test Results Summary */}
          {testResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Tests</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Passed</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.passed}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Failed</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.failed}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Avg Time</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.avgTime.toFixed(0)}ms</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Mode Statistics */}
          {Object.keys(aiStats).length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">AI Mode Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(aiStats).map(([mode, count]) => {
                  const Icon = mode === "mock" ? Cpu : mode === "local-nlp" ? Brain : Zap;
                  const modeResults = testResults.filter(r => r.aiMode === mode);
                  const modePassed = modeResults.filter(r => r.passed).length;
                  const successRate = modeResults.length > 0 ? (modePassed / modeResults.length) * 100 : 0;

                  return (
                    <div key={mode} className="bg-white p-4 rounded-lg shadow">
                      <div className="flex items-center mb-2">
                        <Icon className="h-5 w-5 text-gray-600 mr-2" />
                        <span className="font-medium text-gray-900">{mode.toUpperCase()}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Tests: {count}</p>
                        <p>Success Rate: {successRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detailed Test Results */}
          {testResults.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Test Results</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {testResults.map((result, index) => (
                  <div key={index} className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {result.passed ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mr-2" />
                        )}
                        <h4 className="font-medium text-gray-900">{result.scenario.name}</h4>
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {result.aiMode.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {result.processingTime}ms
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{result.scenario.description}</p>
                    
                    {result.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
                        <h5 className="text-sm font-medium text-red-800 mb-1">Errors:</h5>
                        <ul className="text-sm text-red-700 list-disc list-inside">
                          {result.errors.map((error, errorIndex) => (
                            <li key={errorIndex}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.insights && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                          View Insights
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-100 rounded-md overflow-auto text-xs">
                          {JSON.stringify(result.insights, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Scenarios Overview */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Test Scenarios Overview</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Meeting Types Tested</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Urgent consultations for market concerns</li>
                    <li>• Portfolio review meetings</li>
                    <li>• Life event planning sessions</li>
                    <li>• Market volatility response meetings</li>
                    <li>• Business succession planning</li>
                    <li>• Career growth financial planning</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">AI Capabilities Tested</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Real-time meeting analysis</li>
                    <li>• Mixed communication processing</li>
                    <li>• Context analyzer triggers</li>
                    <li>• Follow-up generation</li>
                    <li>• Error handling and recovery</li>
                    <li>• Performance optimization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MeetingErrorBoundary>
  );
}
