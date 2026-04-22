"use client"

import { useState } from "react";

export default function Home() {
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState("CAD_TO_MXN");
  const [result, setResult] = useState(null);
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fromCurrency = direction === "CAD_TO_MXN" ? "CAD" : "MXN";
  const toCurrency = direction === "CAD_TO_MXN" ? "MXN" : "CAD";

  async function handleConvert() {
    if(!amount || isNaN(amount) || Number(amount) <= 0) {
      setError("Invalid amount.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `/api/exchange-rate?from=${fromCurrency}&to=${toCurrency}`
      );
      const data = await response.json();

      setRate(data.rate);
      setResult((Number(amount) * data.rate).toFixed(2));
    } catch (error) {
      setError("Error. Please try again.")
    } finally {
      setLoading(false);
    }
  }

  function handleSwitch() {
    setDirection(direction === "CAD_TO_MXN" ? "MXN_TO_CAD" : "CAD_TO_MXN");
    setResult(null);
    setRate(null);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Currency Converter
        </h1>
        <p className="text-center text-gray-500 mb-8">
          {fromCurrency} ↔ {toCurrency}
        </p>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          From {fromCurrency}
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleSwitch}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg mb-4 transition"
        >
          Switch: {toCurrency} → {fromCurrency}
        </button>

        <button
          onClick={handleConvert}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-lg transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "Convert"}
        </button>

        {error && (
          <p className="mt-4 text-red-500 text-center">{error}</p>
        )}

        {result && (
          <div className="mt-6 bg-blue-50 rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-blue-700">
              {result} {toCurrency}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              1 {fromCurrency} = {rate} {toCurrency}
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
