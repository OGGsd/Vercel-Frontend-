import type { UseMutationResult } from "@tanstack/react-query";
import type { ColDef, ColGroupDef } from "ag-grid-community";
import { useEffect, useRef } from "react";
import useAuthStore from "@/stores/authStore";
import { useMessagesStore } from "@/stores/messagesStore";
import {
  extractColumnsFromRows,
  prepareSessionIdForAPI,
} from "../../../../utils/utils";
import {
  createUserSpecificParams,
  filterMessagesByCurrentUser
} from "../../../../utils/user-isolation-utils";
import { api } from "../../api";
import { getURL } from "../../helpers/constants";
import { UseRequestProcessor } from "../../services/request-processor";

interface MessagesQueryParams {
  id?: string;
  mode: "intersection" | "union";
  excludedFields?: string[];
  params?: object;
  onSuccess?: (data: MessagesResponse) => void;
  stopPollingOn?: (data: MessagesResponse) => boolean;
  session_id?: string;
}

interface MessagesResponse {
  rows: Array<object>;
  columns: Array<ColDef | ColGroupDef>;
}

interface PollingItem {
  interval: NodeJS.Timeout;
  timestamp: number;
  id: string;
  callback: () => Promise<void>;
}

const MessagesPollingManager = {
  pollingQueue: new Map<string, PollingItem[]>(),
  activePolls: new Map<string, PollingItem>(),

  enqueuePolling(id: string, pollingItem: PollingItem) {
    this.stopAll();

    this.pollingQueue.clear();
    this.pollingQueue.set(id, [pollingItem]);

    this.startNextPolling(id);
  },

  startNextPolling(id: string) {
    const queue = this.pollingQueue.get(id) || [];
    if (queue.length === 0) {
      this.activePolls.delete(id);
      return;
    }

    const nextPoll = queue[0];
    this.activePolls.set(id, nextPoll);
    nextPoll.callback();
  },

  stopPoll(id: string) {
    const activePoll = this.activePolls.get(id);
    if (activePoll) {
      clearInterval(activePoll.interval);
      this.activePolls.delete(id);
      this.pollingQueue.delete(id);
    }
  },

  stopAll() {
    this.activePolls.forEach((poll) => clearInterval(poll.interval));
    this.activePolls.clear();
    this.pollingQueue.clear();
  },

  removeFromQueue(id: string, timestamp: number) {
    this.pollingQueue.delete(id);
  },
};

export const useGetMessagesPollingMutation = (
  options?: any,
): UseMutationResult<
  MessagesResponse,
  unknown,
  MessagesQueryParams,
  unknown
> => {
  const { mutate } = UseRequestProcessor();
  const requestIdRef = useRef<string | null>(null);
  const requestInProgressRef = useRef<Record<string, boolean>>({});

  // Default polling interval of 5 seconds (5000ms)
  const POLLING_INTERVAL = 5000;

  const getMessagesFn = async (
    payload: MessagesQueryParams,
  ): Promise<MessagesResponse> => {
    const requestId = payload.id || "default";
    const _sessionId = payload.session_id;

    if (requestInProgressRef.current[requestId]) {
      return Promise.reject("Request already in progress");
    }

    try {
      requestInProgressRef.current[requestId] = true;
      const { id, mode, excludedFields, params } = payload;
      const config = {};

      if (id) {
        config["params"] = { flow_id: id };
      }

      if (params) {
        // Process params to ensure session_id is properly encoded
        const processedParams = { ...params } as any;
        if (processedParams.session_id) {
          processedParams.session_id = prepareSessionIdForAPI(
            processedParams.session_id,
          );
        }
        config["params"] = { ...config["params"], ...processedParams };
      }

      // Add user context to help backend filter messages properly
      config["params"] = createUserSpecificParams(config["params"]);

      const data = await api.get<any>(`${getURL("MESSAGES")}`, config);

      // Additional frontend safety check - filter messages by user
      if (data.data && Array.isArray(data.data)) {
        data.data = filterMessagesByCurrentUser(data.data);
      }

      const columns = extractColumnsFromRows(data.data, mode, excludedFields);
      useMessagesStore.getState().setMessages(data.data);

      return { rows: data.data, columns };
    } finally {
      requestInProgressRef.current[requestId] = false;
    }
  };

  const startPolling = (payload: MessagesQueryParams) => {
    const requestId = payload.id || "default";

    if (requestInProgressRef.current[requestId]) {
      return Promise.reject("Request already in progress");
    }

    if (MessagesPollingManager.activePolls.has(requestId)) {
      MessagesPollingManager.stopPoll(requestId);
    }

    if (
      requestIdRef.current === requestId &&
      MessagesPollingManager.activePolls.has(requestId)
    ) {
      return Promise.resolve({ rows: [], columns: [] });
    }

    requestIdRef.current = requestId;

    const timestamp = Date.now();
    const pollCallback = async () => {
      const data = await getMessagesFn(payload);
      payload.onSuccess?.(data);

      if (payload.stopPollingOn?.(data)) {
        MessagesPollingManager.stopPoll(requestId);
      }
    };

    const intervalId = setInterval(pollCallback, POLLING_INTERVAL);

    const pollingItem: PollingItem = {
      interval: intervalId,
      timestamp,
      id: requestId,
      callback: pollCallback,
    };

    MessagesPollingManager.enqueuePolling(requestId, pollingItem);

    return getMessagesFn(payload).then((data) => {
      payload.onSuccess?.(data);
      if (payload.stopPollingOn?.(data)) {
        MessagesPollingManager.stopPoll(requestId);
      }
      return data;
    });
  };

  useEffect(() => {
    return () => {
      if (requestIdRef.current) {
        MessagesPollingManager.stopPoll(requestIdRef.current);
        MessagesPollingManager.removeFromQueue(
          requestIdRef.current,
          Date.now(),
        );
        requestIdRef.current = null;
      }
    };
  }, []);

  const mutation = mutate(
    ["useGetMessagesMutation"],
    (payload: MessagesQueryParams) =>
      startPolling(payload) ?? Promise.reject("Failed to start polling"),
    options,
  ) as UseMutationResult<
    MessagesResponse,
    unknown,
    MessagesQueryParams,
    unknown
  >;

  return mutation;
};

export { MessagesPollingManager };
