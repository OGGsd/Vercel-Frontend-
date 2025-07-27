import { Cookies } from "react-cookie";
import { IS_AUTO_LOGIN, LANGFLOW_REFRESH_TOKEN } from "@/constants/constants";
import useAuthStore from "@/stores/authStore";
import type { useMutationFunctionType } from "@/types/api";
import { api } from "../../api";
import { getURL } from "../../helpers/constants";
import { UseRequestProcessor } from "../../services/request-processor";

interface IRefreshAccessToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export const useRefreshAccessToken: useMutationFunctionType<
  undefined,
  undefined | void,
  IRefreshAccessToken
> = (options?) => {
  const { mutate } = UseRequestProcessor();
  const cookies = new Cookies();
  const autoLogin = useAuthStore((state) => state.autoLogin);

  async function refreshAccess(): Promise<IRefreshAccessToken> {
    const res = await api.post<IRefreshAccessToken>(`${getURL("REFRESH")}`);
    cookies.set(LANGFLOW_REFRESH_TOKEN, res.data.refresh_token, { path: "/" });

    return res.data;
  }

  const mutation = mutate(["useRefreshAccessToken"], refreshAccess, {
    ...options,
    retry: 0, // Don't retry refresh attempts to prevent spam
    retryDelay: 5000, // Wait 5 seconds between attempts if retry is enabled
  });

  return mutation;
};
