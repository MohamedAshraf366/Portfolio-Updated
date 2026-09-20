import React from "react";
import FreeModelSelector from "./FreeModelSelector";

export default function FreeModelSelectorPage() {
  return (
    <main className="min-h-screen bg-dark-900 p-6 text-white">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">
            Free Model Selector
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            free.ai · OpenRouter free-tier. Select any model to test it live.
          </p>
        </header>
        <FreeModelSelector />
        <footer className="mt-10 border-t border-white/5 pt-6 text-center text-[11px] text-gray-600">
          Auto-tests every model on load. Manual marks saved to localStorage.
        </footer>
      </div>
    </main>
  );
}
