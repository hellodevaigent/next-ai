"use client"

import ClaudeIcon from "@/components/icons/claude"
import GoogleIcon from "@/components/icons/google"
import MistralIcon from "@/components/icons/mistral"
import OpenAIIcon from "@/components/icons/openai"
import OpenRouterIcon from "@/components/icons/openrouter"
import PerplexityIcon from "@/components/icons/perplexity"
import XaiIcon from "@/components/icons/xai"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { fetchClient } from "@/lib/fetch"
import { useModel } from "@/lib/store/model-store/provider"
import { cn } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Trash2 } from "lucide-react"
import { useState } from "react"

type Provider = {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  placeholder: string
  getKeyUrl: string
  defaultKey: string
}

const PROVIDERS: Provider[] = [
  {
    id: "openrouter",
    name: "OpenRouter",
    icon: OpenRouterIcon,
    placeholder: "sk-or-v1-...",
    getKeyUrl: "https://openrouter.ai/settings/keys",
    defaultKey: "sk-or-v1-............",
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: OpenAIIcon,
    placeholder: "sk-...",
    getKeyUrl: "https://platform.openai.com/api-keys",
    defaultKey: "sk-............",
  },
  {
    id: "mistral",
    name: "Mistral",
    icon: MistralIcon,
    placeholder: "...",
    getKeyUrl: "https://console.mistral.ai/api-keys/",
    defaultKey: "............",
  },
  {
    id: "google",
    name: "Google",
    icon: GoogleIcon,
    placeholder: "AIza...",
    getKeyUrl: "https://ai.google.dev/gemini-api/docs/api-key",
    defaultKey: "AIza............",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    icon: PerplexityIcon,
    placeholder: "pplx-...",
    getKeyUrl: "https://docs.perplexity.ai/guides/getting-started",
    defaultKey: "pplx-............",
  },
  {
    id: "xai",
    name: "XAI",
    icon: XaiIcon,
    placeholder: "xai-...",
    getKeyUrl: "https://console.x.ai/",
    defaultKey: "xai-............",
  },
  {
    id: "anthropic",
    name: "Claude",
    icon: ClaudeIcon,
    placeholder: "sk-ant-...",
    getKeyUrl: "https://console.anthropic.com/settings/keys",
    defaultKey: "sk-ant-............",
  },
]

export function ByokSection() {
  const queryClient = useQueryClient()
  const { userKeyStatus, refreshUserKeyStatus, refreshModels } = useModel()
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [providerToDelete, setProviderToDelete] = useState<string>("")
  // State untuk track loading per provider
  const [loadingProviders, setLoadingProviders] = useState<Set<string>>(new Set())
  const [deletingProviders, setDeletingProviders] = useState<Set<string>>(new Set())

  const getProviderValue = (providerId: string) => {
    const provider = PROVIDERS.find((p) => p.id === providerId)
    if (!provider) return ""

    const hasKey = userKeyStatus[providerId as keyof typeof userKeyStatus]
    const fallbackValue = hasKey ? provider.defaultKey : ""
    return apiKeys[providerId] || fallbackValue
  }

  const saveMutation = useMutation({
    mutationFn: async ({
      provider,
      apiKey,
    }: {
      provider: string
      apiKey: string
    }) => {
      const res = await fetchClient("/api/user-keys", {
        method: "POST",
        body: JSON.stringify({
          provider,
          apiKey,
        }),
      })
      if (!res.ok) throw new Error("Failed to save key")
      return res.json()
    },
    onMutate: ({ provider }) => {
      setLoadingProviders(prev => new Set(prev).add(provider))
    },
    onSuccess: async (response, { provider }) => {
      const providerConfig = PROVIDERS.find((p) => p.id === provider)

      toast({
        title: "API key saved",
        description: response.isNewKey
          ? `Your ${providerConfig?.name} API key has been saved and models have been added to your favorites.`
          : `Your ${providerConfig?.name} API key has been updated.`,
      })

      await Promise.all([refreshUserKeyStatus(), refreshModels()])

      if (response.isNewKey) {
        queryClient.invalidateQueries({ queryKey: ["favorite-models"] })
      }

      setApiKeys((prev) => ({
        ...prev,
        [provider]: providerConfig?.defaultKey || "",
      }))
    },
    onError: (_, { provider }) => {
      const providerConfig = PROVIDERS.find((p) => p.id === provider)
      toast({
        title: "Failed to save API key",
        description: `Failed to save ${providerConfig?.name} API key. Please try again.`,
      })
    },
    onSettled: (_, __, { provider }) => {
      setLoadingProviders(prev => {
        const newSet = new Set(prev)
        newSet.delete(provider)
        return newSet
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (provider: string) => {
      const res = await fetchClient("/api/user-keys", {
        method: "DELETE",
        body: JSON.stringify({
          provider,
        }),
      })
      if (!res.ok) throw new Error("Failed to delete key")
      return res
    },
    onMutate: (provider) => {
      // Set loading state untuk provider yang sedang di-delete
      setDeletingProviders(prev => new Set(prev).add(provider))
    },
    onSuccess: async (_, provider) => {
      const providerConfig = PROVIDERS.find((p) => p.id === provider)
      toast({
        title: "API key deleted",
        description: `Your ${providerConfig?.name} API key has been deleted.`,
      })
      await Promise.all([refreshUserKeyStatus(), refreshModels()])
      setApiKeys((prev) => ({ ...prev, [provider]: "" }))
      setDeleteDialogOpen(false)
      setProviderToDelete("")
    },
    onError: (_, provider) => {
      const providerConfig = PROVIDERS.find((p) => p.id === provider)
      toast({
        title: "Failed to delete API key",
        description: `Failed to delete ${providerConfig?.name} API key. Please try again.`,
      })
      setDeleteDialogOpen(false)
      setProviderToDelete("")
    },
    onSettled: (_, __, provider) => {
      // Remove loading state untuk provider ini
      setDeletingProviders(prev => {
        const newSet = new Set(prev)
        newSet.delete(provider)
        return newSet
      })
    },
  })

  const handleConfirmDelete = () => {
    if (providerToDelete) {
      deleteMutation.mutate(providerToDelete)
    }
  }

  const handleDeleteClick = (providerId: string) => {
    setProviderToDelete(providerId)
    setDeleteDialogOpen(true)
  }

  const handleSave = (providerId: string) => {
    const value = getProviderValue(providerId)
    saveMutation.mutate({ provider: providerId, apiKey: value })
  }

  return (
    <div>
      <h3 className="relative mb-2 inline-flex text-lg font-medium">
        Model Providers{" "}
        <span className="text-muted-foreground absolute top-0 -right-7 text-xs">
          new
        </span>
      </h3>
      <p className="text-muted-foreground text-sm">
        Add your own API keys to unlock access to models.
      </p>
      <p className="text-muted-foreground text-sm mb-4">
        Your keys are stored securely with end-to-end encryption.
      </p>

      <div className="space-y-4 pb-10">
        {PROVIDERS.map((provider) => {
          const isLoading = loadingProviders.has(provider.id)
          const isDeleting = deletingProviders.has(provider.id)
          
          return (
            <div
              key={provider.id}
              className="p-4 rounded-lg border border-border"
            >
              {/* Header dengan Logo, Nama, dan Tombol */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <provider.icon className="size-6 flex-shrink-0" />
                  <div>
                    <Label className="text-sm font-medium">{provider.name}</Label>
                    <a
                      href={provider.getKeyUrl}
                      target="_blank"
                      className="text-muted-foreground block text-xs hover:underline"
                    >
                      Get API key
                    </a>
                  </div>
                </div>
                
                {/* Tombol Save/Delete */}
                <div className="flex items-center gap-2">
                  {userKeyStatus[provider.id as keyof typeof userKeyStatus] && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteClick(provider.id)}
                      disabled={isDeleting || isLoading}
                    >
                      {isDeleting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={() => handleSave(provider.id)}
                    type="button"
                    size="sm"
                    disabled={isLoading || isDeleting}
                  >
                    {isLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>

              {/* Input API Key */}
              <Input
                type="password"
                placeholder={provider.placeholder}
                value={getProviderValue(provider.id)}
                onChange={(e) =>
                  setApiKeys((prev) => ({
                    ...prev,
                    [provider.id]: e.target.value,
                  }))
                }
                disabled={isLoading || isDeleting}
                className="w-full"
              />
            </div>
          )
        })}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your{" "}
              {PROVIDERS.find((p) => p.id === providerToDelete)?.name} API key?
              This action cannot be undone and you will lose access to{" "}
              {PROVIDERS.find((p) => p.id === providerToDelete)?.name} models.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deletingProviders.has(providerToDelete)}
            >
              {deletingProviders.has(providerToDelete) ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}