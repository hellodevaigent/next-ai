import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "../fetch";
import { get, set } from "idb-keyval";

export const useWalletIcon = (walletIconId: string | null) => {
  return useQuery({
    queryKey: ['wallet-icon', walletIconId],
    queryFn: async () => {
      if (!walletIconId) return null;

      const cacheKey = `wallet-icon-${walletIconId}`;
      const cachedIcon = await get(cacheKey);
      
      if (cachedIcon) {
        return cachedIcon;
      }

      const response = await fetchClient(`/api/wallet-icon?id=${encodeURIComponent(walletIconId)}`);

      console.log(response)
      
      if (!response.ok) {
        console.error(`Failed to fetch wallet icon: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      const iconBase64 = data.iconBase64;
      
      if (iconBase64) {
        await set(cacheKey, iconBase64);
      }
      
      return iconBase64;
    },
    enabled: !!walletIconId,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
};