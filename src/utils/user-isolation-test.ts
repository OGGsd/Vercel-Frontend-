/**
 * User Isolation Test Utilities
 * 
 * This module provides utilities to test and verify user isolation
 * in the frontend application.
 */

import type { Message } from "@/types/messages";
import { 
  getCurrentUserId, 
  isMessageOwnedByCurrentUser, 
  filterMessagesByCurrentUser,
  validateMessagesUserIsolation 
} from "./user-isolation-utils";

/**
 * Test data for user isolation testing
 */
export const createTestMessage = (
  id: string, 
  userId?: string, 
  sessionId: string = "test-session",
  flowId: string = "test-flow"
): Message => ({
  id,
  flow_id: flowId,
  text: `Test message ${id}`,
  sender: "User",
  sender_name: "Test User",
  session_id: sessionId,
  timestamp: new Date().toISOString(),
  files: [],
  edit: false,
  background_color: "#ffffff",
  text_color: "#000000",
  user_id: userId
});

/**
 * Run user isolation tests
 */
export const runUserIsolationTests = (): boolean => {
  console.log("🔒 Running User Isolation Tests...");
  
  const currentUserId = getCurrentUserId();
  if (!currentUserId) {
    console.error("❌ No user logged in - cannot run isolation tests");
    return false;
  }
  
  console.log(`👤 Current User ID: ${currentUserId}`);
  
  // Test 1: Messages with correct user_id should be allowed
  const ownMessage = createTestMessage("test-1", currentUserId);
  const isOwnMessageValid = isMessageOwnedByCurrentUser(ownMessage);
  console.log(`✅ Own message validation: ${isOwnMessageValid ? "PASS" : "FAIL"}`);
  
  // Test 2: Messages with different user_id should be blocked
  const otherUserMessage = createTestMessage("test-2", "other-user-id");
  const isOtherMessageBlocked = !isMessageOwnedByCurrentUser(otherUserMessage);
  console.log(`🚫 Other user message blocked: ${isOtherMessageBlocked ? "PASS" : "FAIL"}`);
  
  // Test 3: Messages without user_id should be allowed (backward compatibility)
  const legacyMessage = createTestMessage("test-3");
  delete legacyMessage.user_id;
  const isLegacyMessageAllowed = isMessageOwnedByCurrentUser(legacyMessage);
  console.log(`📜 Legacy message allowed: ${isLegacyMessageAllowed ? "PASS" : "FAIL"}`);
  
  // Test 4: Array filtering should work correctly
  const testMessages = [
    createTestMessage("test-4a", currentUserId),
    createTestMessage("test-4b", "other-user-id"),
    createTestMessage("test-4c", currentUserId),
    createTestMessage("test-4d", "another-user-id"),
  ];
  
  const filteredMessages = filterMessagesByCurrentUser(testMessages);
  const expectedCount = 2; // Only messages with current user ID
  const isFilteringCorrect = filteredMessages.length === expectedCount;
  console.log(`🔍 Array filtering (${filteredMessages.length}/${testMessages.length}): ${isFilteringCorrect ? "PASS" : "FAIL"}`);
  
  // Test 5: Validation function should work
  const validMessages = [
    createTestMessage("test-5a", currentUserId),
    createTestMessage("test-5b", currentUserId),
  ];
  const invalidMessages = [
    createTestMessage("test-5c", currentUserId),
    createTestMessage("test-5d", "other-user-id"), // This makes it invalid
  ];
  
  const isValidSetValid = validateMessagesUserIsolation(validMessages);
  const isInvalidSetInvalid = !validateMessagesUserIsolation(invalidMessages);
  console.log(`✅ Valid set validation: ${isValidSetValid ? "PASS" : "FAIL"}`);
  console.log(`❌ Invalid set validation: ${isInvalidSetInvalid ? "PASS" : "FAIL"}`);
  
  const allTestsPassed = 
    isOwnMessageValid && 
    isOtherMessageBlocked && 
    isLegacyMessageAllowed && 
    isFilteringCorrect && 
    isValidSetValid && 
    isInvalidSetInvalid;
  
  console.log(`\n🔒 User Isolation Tests: ${allTestsPassed ? "✅ ALL PASSED" : "❌ SOME FAILED"}`);
  
  return allTestsPassed;
};

/**
 * Test the current messages in the store for user isolation
 */
export const testCurrentMessagesIsolation = (messages: Message[]): boolean => {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) {
    console.warn("No user logged in - cannot test message isolation");
    return false;
  }
  
  const violatingMessages = messages.filter(message => {
    if (message.user_id && message.user_id !== currentUserId) {
      return true; // This is a violation
    }
    return false;
  });
  
  if (violatingMessages.length > 0) {
    console.error(`🚨 USER ISOLATION VIOLATION: Found ${violatingMessages.length} messages from other users:`, 
      violatingMessages.map(m => ({ id: m.id, user_id: m.user_id, session_id: m.session_id }))
    );
    return false;
  }
  
  console.log(`✅ Message isolation check passed: All ${messages.length} messages belong to current user`);
  return true;
};

/**
 * Monitor messages store for isolation violations
 */
export const startUserIsolationMonitoring = () => {
  if (process.env.NODE_ENV !== 'development') {
    return; // Only run in development
  }
  
  console.log("🔍 Starting user isolation monitoring...");
  
  // This would need to be integrated with the messages store
  // to monitor changes and validate isolation
  setInterval(() => {
    // This is a placeholder - in real implementation, 
    // we would hook into the messages store
    const currentUserId = getCurrentUserId();
    if (currentUserId) {
      console.log(`🔒 User isolation monitor active for user: ${currentUserId}`);
    }
  }, 30000); // Check every 30 seconds
};
