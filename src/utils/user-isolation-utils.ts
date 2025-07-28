/**
 * User Isolation Utilities
 * 
 * This module provides utilities to ensure proper user isolation in the frontend.
 * These are safety measures to prevent data leakage even if the backend fails
 * to properly filter user data.
 */

import useAuthStore from "@/stores/authStore";
import type { Message } from "@/types/messages";

/**
 * Get the current authenticated user's ID
 */
export const getCurrentUserId = (): string | null => {
  const userData = useAuthStore.getState().userData;
  return userData?.id || null;
};

/**
 * Check if a message belongs to the current user
 */
export const isMessageOwnedByCurrentUser = (message: Message): boolean => {
  const currentUserId = getCurrentUserId();
  
  if (!currentUserId) {
    // No user logged in, don't show any messages
    return false;
  }
  
  // If message has user_id field, check if it matches current user
  if (message.user_id) {
    return message.user_id === currentUserId;
  }
  
  // If no user_id field, log warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('Message without user_id detected:', {
      messageId: message.id,
      sessionId: message.session_id,
      flowId: message.flow_id
    });
  }
  
  // For backward compatibility, allow messages without user_id
  // but this indicates a backend issue that should be fixed
  return true;
};

/**
 * Filter an array of messages to only include those owned by the current user
 */
export const filterMessagesByCurrentUser = (messages: Message[]): Message[] => {
  const currentUserId = getCurrentUserId();
  
  if (!currentUserId) {
    return []; // No user logged in, return empty array
  }
  
  const filteredMessages = messages.filter(isMessageOwnedByCurrentUser);
  
  // Log warning if messages were filtered out (indicates backend issue)
  if (messages.length !== filteredMessages.length && process.env.NODE_ENV === 'development') {
    console.warn(`User isolation: Filtered out ${messages.length - filteredMessages.length} messages that don't belong to current user (${currentUserId})`);
  }
  
  return filteredMessages;
};

/**
 * Validate that all messages in an array belong to the current user
 * Returns true if all messages are valid, false otherwise
 */
export const validateMessagesUserIsolation = (messages: Message[]): boolean => {
  const currentUserId = getCurrentUserId();
  
  if (!currentUserId) {
    return messages.length === 0; // Should have no messages if no user
  }
  
  return messages.every(isMessageOwnedByCurrentUser);
};

/**
 * Log user isolation violation for debugging
 */
export const logUserIsolationViolation = (
  context: string, 
  messageId: string, 
  expectedUserId: string | null, 
  actualUserId?: string
): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error('USER ISOLATION VIOLATION:', {
      context,
      messageId,
      expectedUserId,
      actualUserId,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Create user-specific request parameters for API calls
 */
export const createUserSpecificParams = (baseParams: Record<string, any> = {}): Record<string, any> => {
  const currentUserId = getCurrentUserId();
  
  if (currentUserId) {
    return {
      ...baseParams,
      user_id: currentUserId
    };
  }
  
  return baseParams;
};
