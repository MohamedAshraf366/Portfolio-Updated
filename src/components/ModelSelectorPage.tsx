import React from "react";
import ModelDropdown from "./ModelDropdown";

export default function ModelSelectorPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="mx-auto max-w-xl">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Model Selector</h1>
          <p className="mt-1 text-sm text-gray-500">
            Select a model, then click Edit models… to mark free models as
            <span className="font-medium text-emerald-600"> Can be used</span>.
          </p>
        </header>

        <ModelDropdown />

        {/* status legend */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
          <p className="mb-2 font-medium text-gray-900">Status legend</p>
          <ul className="space-y-1">
            <li className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Free — Can be used (auto-tested or you marked it)
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              Free — Can't be used (service down; retry later)
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              Paid — Can't be used (balance = 0; top up to use)
            </li>
          </ul>
          <p className="mt-3 text-xs text-gray-400">
            Each row shows the API model id, a human label, and a status pill.
            Free providers are editable — click the <span className="font-mono text-gray-700">+</span>
            or <span className="font-mono text-gray-700">✓</span> button on any free row to toggle the mark.
            Your marks are saved to localStorage and shown with <span className="text-gray-400">(you)</span>.
          </p>
        </div>

        {/* send test panel */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-900">Test the selected model</p>
          <p className="mt-1 text-xs text-gray-400">
            Only models marked as Free — Can be used can send. Atria Dawn uses the
            Responses API (returns text); other providers use chat/completions.
          </p>
        </div>

        <footer className="mt-10 border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
          Auto-tests all models on load. Click Refresh models to re-test. Click Edit models… to see your marks.
        </footer>
      </div>
    </main>
  );
}
