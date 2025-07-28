/**
 * User Isolation Debugger Component
 * 
 * This component is only shown in development mode and provides
 * tools to test and debug user isolation functionality.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useAuthStore from "@/stores/authStore";
import { useMessagesStore } from "@/stores/messagesStore";
import { runUserIsolationTests, testCurrentMessagesIsolation } from "@/utils/user-isolation-test";
import { getCurrentUserId } from "@/utils/user-isolation-utils";

export default function UserIsolationDebugger() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  
  const userData = useAuthStore((state) => state.userData);
  const messages = useMessagesStore((state) => state.messages);
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const runTests = () => {
    const results: string[] = [];
    
    // Capture console output
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.log = (...args) => {
      results.push(`LOG: ${args.join(' ')}`);
      originalLog(...args);
    };
    
    console.error = (...args) => {
      results.push(`ERROR: ${args.join(' ')}`);
      originalError(...args);
    };
    
    console.warn = (...args) => {
      results.push(`WARN: ${args.join(' ')}`);
      originalWarn(...args);
    };
    
    try {
      // Run isolation tests
      runUserIsolationTests();
      
      // Test current messages
      testCurrentMessagesIsolation(messages);
      
    } finally {
      // Restore console
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }
    
    setTestResults(results);
  };
  
  const clearResults = () => {
    setTestResults([]);
  };
  
  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
        >
          🔒 Debug User Isolation
        </Button>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="border-yellow-300 bg-yellow-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-yellow-800">
              🔒 User Isolation Debugger
            </CardTitle>
            <Button 
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800"
            >
              ×
            </Button>
          </div>
          <CardDescription className="text-xs text-yellow-700">
            Development tool to test user data isolation
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Current User Info */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-yellow-800">Current User:</div>
            <div className="text-xs text-yellow-700">
              ID: {userData?.id || 'Not logged in'}
            </div>
            <div className="text-xs text-yellow-700">
              Username: {userData?.username || 'N/A'}
            </div>
          </div>
          
          {/* Messages Info */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-yellow-800">Messages in Store:</div>
            <div className="text-xs text-yellow-700">
              Total: {messages.length}
            </div>
            <div className="text-xs text-yellow-700">
              With user_id: {messages.filter(m => m.user_id).length}
            </div>
            <div className="text-xs text-yellow-700">
              Without user_id: {messages.filter(m => !m.user_id).length}
            </div>
          </div>
          
          {/* Test Controls */}
          <div className="flex gap-2">
            <Button 
              onClick={runTests}
              size="sm"
              className="flex-1 h-8 text-xs"
            >
              Run Tests
            </Button>
            <Button 
              onClick={clearResults}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
            >
              Clear
            </Button>
          </div>
          
          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-yellow-800">Test Results:</div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-xs p-1 rounded bg-white/50">
                    {result.startsWith('ERROR:') && (
                      <Badge variant="destructive" className="mr-1 text-xs">ERROR</Badge>
                    )}
                    {result.startsWith('WARN:') && (
                      <Badge variant="secondary" className="mr-1 text-xs">WARN</Badge>
                    )}
                    {result.startsWith('LOG:') && (
                      <Badge variant="outline" className="mr-1 text-xs">LOG</Badge>
                    )}
                    <span className="text-yellow-800">
                      {result.replace(/^(ERROR:|WARN:|LOG:)\s*/, '')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
