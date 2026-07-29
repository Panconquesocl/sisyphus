export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-[832px] p-6 md:p-10">
      <div className="animate-pulse space-y-8">
        {/* Saludo */}
        <div className="space-y-2">
          <div className="h-7 w-48 rounded bg-muted" />
          <div className="h-4 w-64 rounded bg-muted" />
        </div>
        {/* Sección "Hoy" */}
        <div className="space-y-2">
          <div className="h-4 w-16 rounded bg-muted" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-11 rounded-md bg-muted" />
          ))}
        </div>
        {/* Grillas */}
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </main>
  );
}