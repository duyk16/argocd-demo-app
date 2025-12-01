"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [guardrail, setGuardrail] = useState("toxic");
  const [version, setVersion] = useState("cpu");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, guardrail, version }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to check text");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Guardrail as a Service
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Test your AI guardrails with CPU and GPU accelerated models.
          </p>
        </div>

        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="text"
                  className="block text-sm font-medium text-gray-700"
                >
                  Input Text
                </label>
                <div className="mt-1">
                  <textarea
                    id="text"
                    rows={5}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3 border"
                    placeholder="Enter text to analyze..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="guardrail"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Guardrail Type
                  </label>
                  <select
                    id="guardrail"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                    value={guardrail}
                    onChange={(e) => setGuardrail(e.target.value)}
                  >
                    <option value="toxic">Toxic Content Detection</option>
                    <option value="prompt-injection">
                      Prompt Injection Detection
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="version"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Hardware Acceleration
                  </label>
                  <select
                    id="version"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                  >
                    <option value="cpu">CPU (Standard)</option>
                    <option value="gpu">GPU (Accelerated)</option>
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Analyze Text"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-6 bg-white shadow sm:rounded-lg overflow-hidden border-t-4 border-indigo-500">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Analysis Result
              </h3>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Score
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {result.score}
                  </dd>
                </div>

                <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Status
                  </dt>
                  <dd
                    className={`mt-1 text-3xl font-semibold ${
                      result.flagged ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {result.flagged ? "FLAGGED" : "SAFE"}
                  </dd>
                </div>

                <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Model Used
                  </dt>
                  <dd className="mt-1 text-xl font-semibold text-gray-900 break-all">
                    {result.details.model}
                  </dd>
                </div>
              </div>

              <div className="mt-5">
                <h4 className="text-sm font-medium text-gray-500">
                  Raw Details
                </h4>
                <pre className="mt-2 bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto text-xs">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
