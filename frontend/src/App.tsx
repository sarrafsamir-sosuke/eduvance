function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100">
          Plataforma de estudos
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
          EduVance
        </h1>

        <p className="mt-5 text-xl font-medium text-cyan-100 sm:text-2xl">
          Aprenda. Evolua. Vença.
        </p>

        <p className="mt-8 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          Uma base limpa, moderna e pronta para crescer com frontend em React e
          backend em Node.js.
        </p>
      </section>
    </main>
  );
}

export default App;
