import { fetchClient } from "@/lib/fetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

type FavoriteChatsResponse = {
  favorite_chats: string[];
};

export function useFavoriteChats() {
  const queryClient = useQueryClient();

  const { data: favoriteChats = [], isLoading } = useQuery<string[]>({
    queryKey: ["favorite-chats"],
    queryFn: async () => {
      const response = await fetchClient(
        "/api/favorite/chats"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch favorite chats");
      }
      const data: FavoriteChatsResponse = await response.json();
      return data.favorite_chats || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const updateFavoriteChatsMutation = useMutation({
    mutationFn: async (favoriteChats: string[]) => {
      const response = await fetchClient(
        "/api/favorite/chats",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            favorite_chats: favoriteChats,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save favorite chats");
      }

      return (await response.json()) as FavoriteChatsResponse;
    },
    onMutate: async (newFavoriteChats) => {
      await queryClient.cancelQueries({ queryKey: ["favorite-chats"] });
      const previousFavoriteChats = queryClient.getQueryData<string[]>([
        "favorite-chats",
      ]);
      queryClient.setQueryData(["favorite-chats"], newFavoriteChats);
      return { previousFavoriteChats };
    },
    onError: (err, newFavoriteChats, context) => {
      if (context?.previousFavoriteChats) {
        queryClient.setQueryData(
          ["favorite-chats"],
          context.previousFavoriteChats
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-chats"] });
    },
  });

  const toggleFavorite = useCallback(
    (chatId: string) => {
      const newFavorites = favoriteChats.includes(chatId)
        ? favoriteChats.filter((id) => id !== chatId)
        : [...favoriteChats, chatId];
      updateFavoriteChatsMutation.mutate(newFavorites);
    },
    [favoriteChats, updateFavoriteChatsMutation]
  );

  return {
    favorites: favoriteChats,
    toggleFavorite,
    isLoading,
  };
}