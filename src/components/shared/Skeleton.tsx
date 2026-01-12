"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-secondary/20 dark:bg-primary/5",
                className
            )}
            {...props}
        />
    )
}

export function SkeletonCard() {
    return (
        <div className="p-10 rounded-[2rem] glass-premium space-y-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <div className="pt-4 border-t border-border">
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
    )
}
