
import { Skeleton } from "@/components/shared/Skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen bg-background p-8 space-y-8">
            <header className="flex justify-between items-end border-b border-border pb-8 mb-8">
                <div>
                    <Skeleton className="h-6 w-32 mb-2 rounded-full" />
                    <Skeleton className="h-12 w-64" />
                </div>
                <div className="flex gap-6">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-xl glass-premium" />
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3">
                    <Skeleton className="h-[400px] rounded-xl glass-premium" />
                </div>
                <div className="lg:col-span-1 space-y-4">
                    <Skeleton className="h-[200px] rounded-xl glass-premium" />
                    <Skeleton className="h-[200px] rounded-xl glass-premium" />
                </div>
            </div>
        </div>
    )
}
