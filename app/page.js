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
  const [currencyInfo, setCurrencyInfo] = useState({});

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

    async function fetchCurrencyInfo() {
      const res = await fetch("/currencies.json");
      const array = await res.json();

      const map = {};
      array.forEach((currency) => {
        map[currency.code] = currency;
      });

      setCurrencyInfo(map);
    }

    fetchCurrencyInfo();
  }, []);

  useEffect(() => {
    const amountNum = amount.replace(/,/g, "");

    setError(null);

    if (!rates) return;

    if (!amountNum || amountNum.trim() === "") {
      setResult(null);
      return;r
    }

    if (isNaN(amountNum) || Number(amountNum) <= 0) {
      setResult(null);
      setError("Invalid amount.");
      return;
    }
    const amountInBase = Number(amountNum) / rates[fromCurrency];
    const converted = (amountInBase * rates[toCurrency]).toFixed(2);
    setResult(converted);
  }, [amount, fromCurrency, toCurrency, rates]);

  function getCurrencyLabel(code) {
    const info = currencyInfo[code];
    if (!info) return code;
    return `${code} - ${info.name}`;
  }

  function formatNumber(value) {
    if (!value) value = 0;
    return Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
        <div className="flex items-center gap-3 mb-4">
          {currencyInfo[fromCurrency] && (
            <img
              src={currencyInfo[fromCurrency].flag}
              alt={fromCurrency}
              className="w-8 h-6 rounded-sm object-cover shrink-0"
            />
          )}
          <select
            value={fromCurrency}
            onChange={(e) => { setFromCurrency(e.target.value); setResult(null); }}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {getCurrencyLabel(c)}
              </option>
            ))}
          </select>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount
        </label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={() => {
            if (!amount || isNaN(amount.replace(/,/g, "")) || Number(amount.replace(/,/g, "")) <= 0) {
              setAmount("1.00");
            } else {
              setAmount(formatNumber(amount.replace(/,/g, "")));
            }
          }}
          onFocus={(e) => {
            const rawValue = amount.replace(/,/g, "");
            setAmount(rawValue);
          }}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && (
          <p className="text-red-500 text-xs mt-[-12px] mb-4 ml-1 italic font-medium">
            {error}
          </p>
        )}

        <button
          onClick={handleSwitch}
          className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 rounded-lg mb-4 transition"
        >
          Switch
        </button>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          To
        </label>
        <div className="flex items-center gap-3 mb-4">
          {currencyInfo[toCurrency] && (
            <img
              src={currencyInfo[toCurrency].flag}
              alt={toCurrency}
              className="w-8 h-6 rounded-sm object-cover shrink-0"
            />
          )}
          <select
            value={toCurrency}
            onChange={(e) => { setToCurrency(e.target.value); setResult(null); }}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {getCurrencyLabel(c)}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="mt-4 text-red-500 text-center">{error}</p>
        )}

        {result && (
          <div className="mt-6 bg-blue-50 rounded-xl p-5 text-center">
            <p className="text-gray-500 text-sm mb-1">Result</p>
            <p className="text-3xl font-bold text-blue-700">
              {formatNumber(result)} {toCurrency}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {amount} {fromCurrency} → {formatNumber(result)} {toCurrency}
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
