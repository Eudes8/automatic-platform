/** Squelette de chargement de l'espace client : même rythme que les pages. */
export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="h-9 w-64 rounded-[10px] bg-primary/[0.06]" />
        <div className="h-4 w-80 rounded-[8px] bg-primary/[0.04]" />
      </div>

      <div className="space-y-3">
        <div className="h-3 w-40 rounded-full bg-primary/[0.05]" />
        <div className="surface divide-y divide-border">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-center gap-4 px-5 py-4">
              <div className="h-10 w-10 rounded-[10px] bg-primary/[0.06]" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/3 rounded-full bg-primary/[0.06]" />
                <div className="h-3 w-1/2 rounded-full bg-primary/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="h-3 w-32 rounded-full bg-primary/[0.05]" />
        <div className="surface h-32" />
      </div>
    </div>
  );
}
