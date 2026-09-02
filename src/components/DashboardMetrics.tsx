import React, { useState, useRef } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Scale,
  CreditCard,
  Edit2,
  Check,
  Building2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { SavedTransaction } from "../types";

interface DashboardMetricsProps {
  accounts: string[];
  history: SavedTransaction[];
  startingBalances: Record<string, number>;
  onUpdateStartingBalance: (account: string, amount: number) => void;
}

type TimePeriod = "month" | "quarter" | "year" | "all";

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  accounts,
  history,
  startingBalances,
  onUpdateStartingBalance
}) => {
  const [period, setPeriod] = useState<TimePeriod>("month");
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [tempBalanceInput, setTempBalanceInput] = useState<string>("");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Touch tracking refs for swipe gestures
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const currentQuarter = Math.floor(currentMonth / 3);

  // Filter transactions based on selected period
  const filterByPeriod = (tx: SavedTransaction) => {
    if (period === "all") return true;

    if (!tx.date) return false;
    const [yStr, mStr] = tx.date.split("-");
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10) - 1; // 0-indexed

    if (isNaN(y) || isNaN(m)) return false;

    if (period === "month") {
      return y === currentYear && m === currentMonth;
    }

    if (period === "quarter") {
      const q = Math.floor(m / 3);
      return y === currentYear && q === currentQuarter;
    }

    if (period === "year") {
      return y === currentYear;
    }

    return true;
  };

  const filteredHistory = history.filter(filterByPeriod);

  // Calculate Overall Net Balance across all accounts (Starting balances + all transactions ever)
  const totalStartingBalance = accounts.reduce(
    (acc, accName) => acc + (startingBalances[accName] || 0),
    0
  );

  const totalAllTimeTxSum = history.reduce((acc, tx) => acc + (tx.totalSignedAmount || 0), 0);
  const totalOverallBalance = totalStartingBalance + totalAllTimeTxSum;

  // Calculate Period Income, Expenses, Net
  let periodIncome = 0;
  let periodExpenses = 0;

  filteredHistory.forEach((tx) => {
    const isIncome = tx.type === "Income" || tx.type === "Incom" || tx.totalSignedAmount > 0;
    if (isIncome) {
      periodIncome += Math.abs(tx.totalSignedAmount || 0);
    } else {
      periodExpenses += Math.abs(tx.totalSignedAmount || 0);
    }
  });

  const periodNet = periodIncome - periodExpenses;

  // Calculate per-account metrics
  const getAccountMetrics = (accName: string) => {
    const initial = startingBalances[accName] || 0;

    // All time transactions for account balance calculation
    const accountTxAllTime = history.filter((tx) => tx.account === accName);
    const txSumAllTime = accountTxAllTime.reduce(
      (acc, tx) => acc + (tx.totalSignedAmount || 0),
      0
    );
    const currentBalance = initial + txSumAllTime;

    // Period specific transactions for account
    const periodTx = accountTxAllTime.filter(filterByPeriod);
    let accPeriodIncome = 0;
    let accPeriodExpenses = 0;

    periodTx.forEach((tx) => {
      const isInc = tx.type === "Income" || tx.type === "Incom" || tx.totalSignedAmount > 0;
      if (isInc) accPeriodIncome += Math.abs(tx.totalSignedAmount || 0);
      else accPeriodExpenses += Math.abs(tx.totalSignedAmount || 0);
    });

    return {
      currentBalance,
      periodIncome: accPeriodIncome,
      periodExpenses: accPeriodExpenses,
      periodNet: accPeriodIncome - accPeriodExpenses,
      txCount: periodTx.length
    };
  };

  const handleStartEditBalance = (accName: string) => {
    setEditingAccount(accName);
    setTempBalanceInput((startingBalances[accName] || 0).toString());
  };

  const handleSaveBalance = (accName: string) => {
    const val = parseFloat(tempBalanceInput);
    onUpdateStartingBalance(accName, isNaN(val) ? 0 : val);
    setEditingAccount(null);
  };

  // Helper labels
  const getPeriodLabel = () => {
    if (period === "month") {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return `${monthNames[currentMonth]} ${currentYear}`;
    }
    if (period === "quarter") return `Q${currentQuarter + 1} ${currentYear}`;
    if (period === "year") return `Year ${currentYear}`;
    return "All Time";
  };

  // Carousel Slides Setup
  const totalSlides = 2 + accounts.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Swipe Gesture Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swiped left -> next slide
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> previous slide
      prevSlide();
    }

    // Reset touch coordinates
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 mb-6 relative">
      {/* Header & Period Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-extrabold text-[#121F3E] flex items-center gap-2 font-['Montserrat']">
            <div className="p-1.5 rounded-xl bg-[#008FA5]/15 text-[#008FA5]">
              <Wallet className="w-4 h-4" />
            </div>
            Financial Dashboard & Account Metrics
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time balance tracking, account totals, and summary for <strong className="text-slate-800">{getPeriodLabel()}</strong>
          </p>
        </div>

        {/* Time Period Filter Tabs (Segmented Pills) */}
        <div className="inline-flex rounded-xl border border-slate-200/90 p-1 bg-[#F4F8F8] text-xs font-bold self-start sm:self-auto font-['Montserrat']">
          {(["month", "quarter", "year", "all"] as TimePeriod[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer capitalize ${
                period === p
                  ? "bg-[#121F3E] text-white shadow-xs font-extrabold"
                  : "text-slate-600 hover:text-[#121F3E]"
              }`}
            >
              {p === "all" ? "All Time" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Carousel Navigation Header (Page numbers removed) */}
      <div className="flex items-center justify-between mb-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/60">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#008FA5]"></span>
          <span>
            {currentSlide === 0
              ? "Overall Summary Overview"
              : currentSlide === 1
              ? "Cash Overview"
              : `Account — ${accounts[currentSlide - 2]}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CAROUSEL CONTAINER WITH SWIPE LISTENERS */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="overflow-hidden min-h-[220px] select-none touch-pan-y"
      >
        {/* PAGE 1: OVERVIEW OF TOTAL BALANCE, PERIOD INCOME, EXPENSES, NET CHANGE */}
        {currentSlide === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
            {/* Total Overall Balance Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121F3E] via-[#121F3E] to-[#008FA5] text-white shadow-md border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-28 h-28 bg-[#00D2A0]/15 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between text-slate-300 text-xs font-bold mb-2 font-['Montserrat']">
                <span>Total Balance</span>
                <Wallet className="w-4 h-4 text-[#00D2A0]" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white mb-1">
                €{totalOverallBalance.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                Across {accounts.length} linked account{accounts.length === 1 ? "" : "s"}
              </p>
            </div>

            {/* Period Income Card */}
            <div className="p-5 rounded-2xl bg-[#008FA5]/10 border border-[#008FA5]/20 text-emerald-950 shadow-2xs">
              <div className="flex items-center justify-between text-[#008FA5] text-xs font-bold mb-2 font-['Montserrat']">
                <span>Period Income</span>
                <div className="p-1.5 rounded-lg bg-[#008FA5]/20 text-[#008FA5]">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-[#008FA5] mb-1">
                +€{periodIncome.toFixed(2)}
              </div>
              <p className="text-[11px] text-[#008FA5] font-bold">
                Total incoming revenue
              </p>
            </div>

            {/* Period Expenses Card */}
            <div className="p-5 rounded-2xl bg-rose-50/80 border border-rose-200/80 text-rose-950 shadow-2xs">
              <div className="flex items-center justify-between text-rose-800 text-xs font-bold mb-2 font-['Montserrat']">
                <span>Period Expenses</span>
                <div className="p-1.5 rounded-lg bg-rose-200/60 text-rose-800">
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-rose-700 mb-1">
                -€{periodExpenses.toFixed(2)}
              </div>
              <p className="text-[11px] text-rose-800 font-bold">
                Total costs & purchases
              </p>
            </div>

            {/* Period Net Status Card */}
            <div
              className={`p-5 rounded-2xl border shadow-2xs ${
                periodNet >= 0
                  ? "bg-[#008FA5]/10 border-[#008FA5]/20 text-[#121F3E]"
                  : "bg-amber-50/80 border-amber-200/80 text-amber-950"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-2 font-['Montserrat']">
                <span>Net Period Change</span>
                <div className={`p-1.5 rounded-lg ${periodNet >= 0 ? "bg-[#008FA5]/20 text-[#008FA5]" : "bg-amber-200/60 text-amber-800"}`}>
                  <Scale className="w-3.5 h-3.5" />
                </div>
              </div>
              <div
                className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight mb-1 ${
                  periodNet >= 0 ? "text-[#008FA5]" : "text-amber-700"
                }`}
              >
                {periodNet >= 0 ? "+" : ""}€{periodNet.toFixed(2)}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-md font-['Montserrat'] ${
                    periodNet >= 0
                      ? "bg-[#008FA5] text-white"
                      : "bg-rose-200 text-rose-900"
                  }`}
                >
                  {periodNet >= 0 ? "SURPLUS" : "DEFICIT"}
                </span>
                <span className="text-[11px] text-slate-600 font-medium">{getPeriodLabel()}</span>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 2: CASH OVERVIEW */}
        {currentSlide === 1 && (() => {
          const cashAccName = accounts.find((acc) => acc.toLowerCase().includes("cash") || acc.toLowerCase().includes("hotovost")) || accounts[0] || "Cash";
          const m = getAccountMetrics(cashAccName);
          const isEditing = editingAccount === cashAccName;

          return (
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#008FA5] text-white rounded-2xl p-6 shadow-md border border-slate-800 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md text-[#00D2A0] border border-white/10">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold tracking-tight">Cash Overview ({cashAccName})</h3>
                    <p className="text-xs text-slate-300">Detailed cash flow and physical wallet tracking for {getPeriodLabel()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 self-start sm:self-auto">
                  <span className="text-xs text-slate-300 font-bold">Starting Balance:</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={tempBalanceInput}
                        onChange={(e) => setTempBalanceInput(e.target.value)}
                        className="w-20 px-2 py-1 bg-white text-slate-900 rounded-lg text-xs font-mono font-bold focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveBalance(cashAccName)}
                        className="p-1 bg-emerald-500 text-slate-900 rounded-lg font-bold cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEditBalance(cashAccName)}
                      className="text-xs font-mono font-bold text-[#00D2A0] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>€{(startingBalances[cashAccName] || 0).toFixed(2)}</span>
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-slate-300 font-bold mb-1">Current Cash Balance</p>
                  <p className="text-2xl font-black font-mono text-white">€{m.currentBalance.toFixed(2)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-emerald-300 font-bold mb-1">Period Inflow ({period})</p>
                  <p className="text-2xl font-black font-mono text-emerald-300">+€{m.periodIncome.toFixed(2)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-rose-300 font-bold mb-1">Period Outflow ({period})</p>
                  <p className="text-2xl font-black font-mono text-rose-300">-€{m.periodExpenses.toFixed(2)}</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* PAGES 2+: INDIVIDUAL ACCOUNTS ADDED */}
        {currentSlide >= 2 && (() => {
          const accIndex = currentSlide - 2;
          const accName = accounts[accIndex];
          if (!accName) return null;

          const m = getAccountMetrics(accName);
          const isEditing = editingAccount === accName;

          return (
            <div className="bg-slate-50/90 rounded-2xl border border-slate-200 p-6 animate-fadeIn shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-100 text-blue-700 border border-blue-200">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                      Account #{accIndex + 1}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-1">{accName}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-bold text-slate-600">Starting Balance:</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={tempBalanceInput}
                        onChange={(e) => setTempBalanceInput(e.target.value)}
                        className="w-24 px-2 py-1 bg-white border border-blue-500 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveBalance(accName)}
                        className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEditBalance(accName)}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1.5 cursor-pointer font-mono"
                    >
                      <span>€{(startingBalances[accName] || 0).toFixed(2)}</span>
                      <Edit2 className="w-3 h-3 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
                  <p className="text-xs font-bold text-slate-500 mb-1">Current Balance</p>
                  <p className="text-2xl font-black font-mono text-slate-900">€{m.currentBalance.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
                  <p className="text-xs font-bold text-emerald-700 mb-1">Income ({period})</p>
                  <p className="text-2xl font-black font-mono text-emerald-700">+€{m.periodIncome.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
                  <p className="text-xs font-bold text-rose-700 mb-1">Expenses ({period})</p>
                  <p className="text-2xl font-black font-mono text-rose-700">-€{m.periodExpenses.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
                  <p className="text-xs font-bold text-blue-900 mb-1">Net Change ({period})</p>
                  <p className={`text-2xl font-black font-mono ${m.periodNet >= 0 ? "text-blue-600" : "text-amber-600"}`}>
                    {m.periodNet >= 0 ? "+" : ""}€{m.periodNet.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Carousel Pagination Dots */}
      <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-slate-100">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              currentSlide === idx ? "w-8 bg-[#008FA5]" : "w-2 bg-slate-200 hover:bg-slate-300"
            }`}
            title={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};