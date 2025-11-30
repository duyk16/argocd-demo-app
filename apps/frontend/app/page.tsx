"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [guardrail, setGuardrail] = useState("toxic");
  const [version, setVersion] = useState("cpu");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, guardrail, version }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Guardrail as a Service</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-6 rounded-lg shadow"
        >
          <div>
            <label className="block mb-2 font-medium">Input Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-3 border rounded"
              rows={4}
              placeholder="Enter text to check..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium">Guardrail</label>
              <select
                value={guardrail}
                onChange={(e) => setGuardrail(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="toxic">Toxic Content</option>
                <option value="prompt-injection">Prompt Injection</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Version</label>
              <select
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="cpu">CPU</option>
                <option value="gpu">GPU</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Checking..." : "Check Guardrail"}
          </button>
        </form>

        {result && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Result</h2>
            <div className="space-y-2">
              <p>
                <strong>Guardrail:</strong> {result.guardrail}
              </p>
              <p>
                <strong>Version:</strong> {result.version}
              </p>
              <p>
                <strong>Score:</strong> {result.score}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={result.flagged ? "text-red-600" : "text-green-600"}
                >
                  {result.flagged ? "FLAGGED" : "SAFE"}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
