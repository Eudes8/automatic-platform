
import { Skeleton } from "@/components/shared/Skeleton"

export default function Loading() {
    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
                <div className="space-y-4">
                    <Skeleton className="h-4 w-32" />
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Skeleton className="h-5 w-24 rounded-full" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-16 w-96" />
                    </div>
                </div>
                <div className="flex gap-4">
                    <Skeleton className="h-12 w-32 rounded-xl" />
                    <Skeleton className="h-12 w-32 rounded-xl" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-[2rem] glass-premium" />
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8">
                    <Skeleton className="h-[500px] rounded-[2.5rem] glass-premium" />
                </div>
                <div className="lg:col-span-4">
                    <Skeleton className="h-[500px] rounded-[2.5rem] glass-premium" />
                </div>
            </div>
        </div>
    )
}
