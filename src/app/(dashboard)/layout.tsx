import NavBar from '@/components/nav-bar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-[100dvh] bg-background flex flex-col w-full overflow-hidden text-foreground relative">

      {/* Sfondo in stile Login Page (Globi luminosi e Grid Pattern) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-40 animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-black/5 dark:bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,black,transparent)] dark:[mask-image:linear-gradient(180deg,white,transparent)] opacity-20 pointer-events-none" />

      {/* Z-index 50 per mantenere la navbar sopra a tutto */}
      <div className="relative z-50">
        <NavBar />
      </div>

      {/* Contenuto principale */}
      <main className="flex-1 w-full flex flex-col max-w-7xl mx-auto pt-24 pb-4 px-2 md:px-6 min-h-0 relative z-10">
        {children}
      </main>

      {/* Footer reso super Glassmorphic */}
      <footer className="h-12 border-t border-border bg-background/40 backdrop-blur-2xl flex items-center justify-center text-muted-foreground text-xs font-medium z-40 shrink-0 relative">
        <p>© {new Date().getFullYear()} Active Recall. Sviluppato per lo studio intelligente.</p>
      </footer>
    </div>
  )
}