"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Message as MessageType } from "@ai-sdk/react"
import { useKeenSlider } from "keen-slider/react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { ResponseCard } from "./response-card"

type GroupedMessage = {
  userMessage: MessageType
  responses: {
    model: string
    message: MessageType
    isLoading?: boolean
    provider: string
  }[]
  onDelete: (model: string, id: string) => void
  onEdit: (model: string, id: string, newText: string) => void
  onReload: (model: string) => void
}

type ResponsesRowProps = {
  group: GroupedMessage
  responses: GroupedMessage["responses"]
}

function ArrowButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "bg-background hover:bg-muted z-10 flex h-8 w-8 items-center justify-center rounded-full border shadow-md transition-all duration-200 hover:scale-105",
        "disabled:scale-95 disabled:opacity-0"
      )}
    >
      {children}
    </button>
  )
}

export function ResponsesRow({ group, responses }: ResponsesRowProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [loaded, setLoaded] = React.useState(false)
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: false,
    mode: "snap",
    rtl: false,
    slides: {
      perView: 1,
      spacing: 10
    },
    breakpoints: {
      "(min-width: 768px)": {
        slides: {
          perView: 1.2,
          spacing: 16
        },
      },
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
    created() {
      setLoaded(true)
    },
  })

  return (
    <div className="group relative flex items-center">
      <div ref={sliderRef} className="keen-slider">
        {responses.map((response, index) => (
          <div
            key={`${response.model}-${response.message?.id || index}`}
            className="keen-slider__slide mb-6 w-full max-w-[350px] min-w-[320px] md:max-w-[500px]"
          >
            <ResponseCard response={response} group={group} />
          </div>
        ))}
      </div>
      {loaded && instanceRef.current && (
        <>
          <div className="absolute left-0 z-20 -translate-x-4 transition-all duration-200">
            <ArrowButton
              onClick={() => instanceRef.current?.prev()}
              disabled={currentSlide === 0}
            >
              <ChevronLeftIcon className="size-4" />
            </ArrowButton>
          </div>
          <div className="absolute right-0 z-20 translate-x-4 transition-all duration-200">
            <ArrowButton
              onClick={() => instanceRef.current?.next()}
              disabled={
                currentSlide >= (instanceRef.current?.track?.details?.slides?.length ?? 1) - 1
              }
            >
              <ChevronRightIcon className="size-4" />
            </ArrowButton>
          </div>
        </>
      )}
    </div>
  )
}
