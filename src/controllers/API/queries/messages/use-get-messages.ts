import { keepPreviousData } from "@tanstack/react-query";
import type { ColDef, ColGroupDef } from "ag-grid-community";
import useAuthStore from "@/stores/authStore";
import useFlowStore from "@/stores/flowStore";
import { useMessagesStore } from "@/stores/messagesStore";
import type { useQueryFunctionType } from "../../../../types/api";
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
}

interface MessagesResponse {
  rows: Array<object>;
  columns: Array<ColDef | ColGroupDef>;
}

export const useGetMessagesQuery: useQueryFunctionType<
  MessagesQueryParams,
  MessagesResponse
> = ({ id, mode, excludedFields, params }, options) => {
  const { query } = UseRequestProcessor();

  const getMessagesFn = async (id?: string, params = {}) => {
    const isPlaygroundPage = useFlowStore.getState().playgroundPage;
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

    if (!isPlaygroundPage) {
      const response = await api.get<any>(`${getURL("MESSAGES")}`, config);

      // Additional frontend safety check - filter messages by user
      if (response.data && Array.isArray(response.data)) {
        response.data = filterMessagesByCurrentUser(response.data);
      }

      return response;
    } else {
      return {
        data: JSON.parse(window.sessionStorage.getItem(id ?? "") || "[]"),
      };
    }
  };

  const responseFn = async () => {
    const data = await getMessagesFn(id, params);
    const columns = extractColumnsFromRows(data.data, mode, excludedFields);
    useMessagesStore.getState().setMessages(data.data);
    return { rows: data, columns };
  };

  const queryResult = query(["useGetMessagesQuery", { id }], responseFn, {
    placeholderData: keepPreviousData,
    ...options,
  });

  return queryResult;
};
