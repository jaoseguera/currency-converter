"use client"

import { useState, useEffect } from "react";

export default function Home() {
  const [amount, setAmount] = useState("1.0");
  const [currencies, setCurrencies] = useState([]);
  const [fromCurrency, setFromCurrency] = useState("CAD");
  const [toCurrency, setToCurrency] = useState("MXN");
  const [result, setResult] = useState(null);
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nextUpdate, setNextUpdate] = useState(null);

  useEffect(() => {
    async function fetchRates() {
      try {
        const response = await fetch("/api/exchange-rate");
        const data = await response.json();

        if (data.error) throw new Error(data.error);

        setRates(data.rates);
        setSource(data.source);
        setLastUpdated(new Date(data.lastUpdated).toLocaleString());
        setNextUpdate(new Date(data.nextUpdate).toLocaleString());
        setCurrencies(Object.keys(data.rates).sort());
      } catch (error) {
        setError("Fetching rates error.")
      } finally {
        setLoading(false);
      }
    }
    fetchRates();
  }, []);

  async function handleConvert() {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError("Invalid amount.");
      return;
    }

    if (!rates) return;
    setError(null);

    const amountToConvert = Number(amount) / rates[fromCurrency];
    const converted = (amountToConvert * rates[toCurrency]).toFixed(2);
    setResult(converted);
  }

  function handleSwitch() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Currency Converter
        </h1>

        {source && (
          <p className="text-center text-xs text-gray-400 mb-6">source:
            {source === "api" && " internet"}
            {source === "cache" && " cache "}
            {source === "offline-cache" && " offline, last cache used"}
          </p>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-1">
          From
        </label>
        <select
          value={fromCurrency}
          onChange={(e) => { setFromCurrency(e.target.value); setResult(null); }}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {currencies.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="z.B. 100"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleSwitch}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg mb-4 transition"
        >
          Switch
        </button>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          To
        </label>
        <select
          value={toCurrency}
          onChange={(e) => { setToCurrency(e.target.value); setResult(null); }}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {currencies.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <button
          onClick={handleConvert}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-lg transition"
        >
          Convert
        </button>

        {error && (
          <p className="mt-4 text-red-500 text-center">{error}</p>
        )}

        {result && (
          <div className="mt-6 bg-blue-50 rounded-xl p-5 text-center">
            <p className="text-gray-500 text-sm mb-1">Result</p>
            <p className="text-3xl font-bold text-blue-700">
              {result} {toCurrency}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {amount} {fromCurrency} → {result} {toCurrency}
            </p>
          </div>
        )}

        {(lastUpdated || nextUpdate) && (
          <div className="mt-6 border-t border-gray-100 pt-4 text-center text-xs text-gray-400 space-y-1">
            <p>Last update: {lastUpdated}</p>
            <p>Next update: {nextUpdate}</p>
          </div>
        )}
      </div>
    </main>
  );
}
