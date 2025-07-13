"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"

export const ConversationSkeleton = () => {
  const widthRanges = [
    { min: 50, max: 100 },
    { min: 80, max: 100 },
    { min: 50, max: 100 },
    { min: 70, max: 100 },
    { min: 60, max: 100 },
    { min: 60, max: 100 },
  ]

  const [currentWidths, setCurrentWidths] = useState(
    widthRanges.map((w) => w.min + Math.random() * (w.max - w.min))
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWidths(
        widthRanges.map((w) => {
          return w.min + Math.random() * (w.max - w.min)
        })
      )
    }, 1300)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div className="relative mx-auto w-full h-full max-w-3xl space-y-3 overflow-hidden px-4 pt-20">
      <div className="bg-accent !mb-4 flex items-center space-x-3 rounded-xl p-3">
        <div className="bg-sidebar size-8 animate-pulse rounded-full" />
        <div className="bg-sidebar h-6 w-full animate-pulse rounded-md" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-end">
          <div
            className="bg-accent h-4 animate-pulse rounded-md transition-all duration-1000 ease-in-out md:h-5"
            style={{ width: `${currentWidths[0]}%` }}
          />
        </div>
        <div className="flex justify-end">
          <div
            className="bg-accent h-2 animate-pulse rounded-md transition-all duration-1000 ease-in-out md:h-2.5"
            style={{ width: `${currentWidths[1]}%` }}
          />
        </div>
        <div className="flex justify-end">
          <div
            className="bg-accent h-2 animate-pulse rounded-md transition-all duration-1000 ease-in-out md:h-2.5"
            style={{ width: `${currentWidths[2]}%` }}
          />
        </div>
        <div className="flex justify-end">
          <div
            className="bg-accent h-2 animate-pulse rounded-md transition-all duration-1000 ease-in-out md:h-2.5"
            style={{ width: `${currentWidths[3]}%` }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex flex-col justify-start">
          <div
            className="bg-accent h-4 animate-pulse rounded-md transition-all duration-1000 ease-in-out md:h-5"
            style={{ width: `${currentWidths[1]}%` }}
          />
        </div>
        <div className="flex flex-col justify-start">
          <div
            className="bg-accent h-2 animate-pulse rounded-md transition-all duration-1000 ease-in-out md:h-2.5"
            style={{ width: `${currentWidths[2]}%` }}
          />
        </div>
        <div className="flex flex-col justify-start">
          <div
            className="bg-accent h-2 animate-pulse rounded-md transition-all duration-1000 ease-in-out md:h-2.5"
            style={{ width: `${currentWidths[3]}%` }}
          />
        </div>
        <div className="flex flex-col justify-start">
          <div
            className="bg-accent h-2 animate-pulse rounded-md transition-all duration-1000 ease-in-out md:h-2.5"
            style={{ width: `${currentWidths[4]}%` }}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <div
          className="bg-accent h-4 animate-pulse rounded-md transition-all duration-1000 ease-in-out md:h-5"
          style={{ width: `${currentWidths[2]}%` }}
        />
      </div>
      <div className="flex flex-col justify-start">
        <div
          className="bg-accent h-4 animate-pulse rounded-md transition-all duration-1000 ease-in-out md:h-5"
          style={{ width: `${currentWidths[3]}%` }}
        />
      </div>
      <div className="from-background absolute -bottom-[20px] h-[300px] w-full bg-gradient-to-t via-transparent to-transparent" />
    </motion.div>
  )
}
