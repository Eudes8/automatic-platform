
import { Skeleton, SkeletonCard } from "@/components/shared/Skeleton"

export default function Loading() {
    return (
        <div className="space-y-8">
            <header className="mb-10">
                <Skeleton className="h-10 w-64 mb-4" />
                <Skeleton className="h-4 w-48 ml-1" />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        </div>
    )
}
