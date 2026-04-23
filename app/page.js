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
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCurrencies = currencies.filter((c) => {
    const label = getCurrencyLabel(c).toLowerCase();
    return label.includes(searchQuery.toLowerCase());
  });

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
      return;
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

        <div className="relative mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>

          <div
            onClick={() => setIsFromOpen(!isFromOpen)}
            className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 cursor-pointer bg-white hover:border-green-500 transition"
          >
            {currencyInfo[fromCurrency] && (
              <img src={currencyInfo[fromCurrency].flag} alt="{fromCurrency}" className="w-8 h-6 rounded-sm object-cover" />
            )}
            <span className="flex-1">{getCurrencyLabel(fromCurrency)}</span>
            <span className="text-gray-400">▼</span>
          </div>

          {isFromOpen && (
            <div 
              className="fixed inset-0 z-40 bg-transparent" 
              onClick={() => {
                setIsFromOpen(false);
                setSearchQuery("");
              }}
            />
          )}

          {isFromOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-hidden flex flex-col">
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="p-3 border-b border-gray-100 focus:outline-none sticky top-0 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className="overflow-y-auto">
                {filteredCurrencies.map((c) => (
                  <div
                    key={c}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 cursor-pointer transition"
                    onClick={() => {
                      setFromCurrency(c);
                      setIsFromOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    {currencyInfo[c] && <img src={currencyInfo[c].flag} alt={c} className="w-6 h-4 rounded-sm" />}
                    <span className={fromCurrency === c ? "font-bold text-green-700" : ""}>
                      {getCurrencyLabel(c)}
                    </span>
                  </div>
                ))}
                {filteredCurrencies.length === 0 && (
                  <div className="p-4 text-gray-500 text-sm">No currencies found...</div>
                )}
              </div>
            </div>
          )}
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

        <div className="relative mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>

          <div
            onClick={() => setIsToOpen(!isToOpen)}
            className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 cursor-pointer bg-white hover:border-green-500 transition"
          >
            {currencyInfo[toCurrency] && (
              <img src={currencyInfo[toCurrency].flag} alt="{toCurrency}" className="w-8 h-6 rounded-sm object-cover" />
            )}
            <span className="flex-1">{getCurrencyLabel(toCurrency)}</span>
            <span className="text-gray-400">▼</span>
          </div>

          {isToOpen && (
            <div 
              className="fixed inset-0 z-40 bg-transparent" 
              onClick={() => {
                setIsToOpen(false);
                setSearchQuery("");
              }}
            />
          )}

          {isToOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-hidden flex flex-col">
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="p-3 border-b border-gray-100 focus:outline-none sticky top-0 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className="overflow-y-auto">
                {filteredCurrencies.map((c) => (
                  <div
                    key={c}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 cursor-pointer transition"
                    onClick={() => {
                      setToCurrency(c);
                      setIsToOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    {currencyInfo[c] && <img src={currencyInfo[c].flag} alt={c} className="w-6 h-4 rounded-sm" />}
                    <span className={toCurrency === c ? "font-bold text-green-700" : ""}>
                      {getCurrencyLabel(c)}
                    </span>
                  </div>
                ))}
                {filteredCurrencies.length === 0 && (
                  <div className="p-4 text-gray-500 text-sm">No currencies found...</div>
                )}
              </div>
            </div>
          )}
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
              {amount} {toCurrency} → {formatNumber(result)} {toCurrency}
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
