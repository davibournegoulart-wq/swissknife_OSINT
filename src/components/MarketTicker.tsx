"use client";

import { useEffect, useRef } from "react";

export function MarketTicker() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear any existing script to prevent duplicates on HMR
    containerRef.current.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
        { proName: "FOREXCOM:NSXUSD", title: "NASDAQ 100" },
        { proName: "FX_IDC:EURUSD", title: "EUR/USD" },
        { proName: "FX_IDC:GBPUSD", title: "GBP/USD" },
        { proName: "FX_IDC:USDJPY", title: "USD/JPY" },
        { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
        { proName: "BITSTAMP:ETHUSD", title: "Ethereum" },
        { description: "Gold", proName: "OANDA:XAUUSD" },
        { description: "Crude Oil", proName: "TVC:USOIL" }
      ],
      showSymbolLogo: true,
      colorTheme: "dark",
      isTransparent: true,
      displayMode: "adaptive",
      locale: "en"
    });

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="h-[46px] shrink-0 bg-[#080810] border-t border-cyan-900/50 flex items-center overflow-hidden">
      <div className="tradingview-widget-container w-full" ref={containerRef}>
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
}
