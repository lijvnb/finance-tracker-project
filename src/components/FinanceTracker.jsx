import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  Wallet, TrendingUp, TrendingDown, PieChart, Plus, Trash2,
  DollarSign, Calendar, Tag, Moon, Sun, RefreshCw, PiggyBank, Settings
} from 'lucide-react';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// ---------------------------------------------
// FIREBASE CONFIG
// ---------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyBVvuOWR8kBjPotdqF-MwU4Kd-6KJbBZdc",
  authDomain: "finance-tracker-59179.firebaseapp.com",
  projectId: "finance-tracker-59179",
  storageBucket: "finance-tracker-59179.firebasestorage.app",
  messagingSenderId: "1011636086610",
  appId: "1:1011636086610:web:4292bd482af5f230ea7c8b",
  measurementId: "G-HR1SKR95N2"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

// ---------------------------------------------
// AUTH CONTEXT
// ---------------------------------------------
const AuthContext = createContext();
function useAuth() { return useContext(AuthContext); }

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    return auth.onAuthStateChanged(u => {
      setUser(u);
      setInitializing(false);
    });
  }, []);

  if (initializing) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={user}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------
// LOGIN / REGISTER SCREEN
// ---------------------------------------------
function AuthGate({ children }) {
  const user = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async () => {
    try {
      await auth.signInWithEmailAndPassword(email, password);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleRegister = async () => {
    try {
      await auth.createUserWithEmailAndPassword(email, password);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleLogout = async () => auth.signOut();

  if (user) {
    return (
      <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900">
        <div className="w-full py-6 px-6 flex justify-end bg-gray-100 dark:bg-gray-900">

              <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Log out
          </button>
        </div>

        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* LEFT PANEL (LOGIN FORM) */}
      <div className="flex flex-col justify-center flex-1 p-10">
        {/* Finance Tracker Title */}
    <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
        Finance Tracker
    </h1>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md mx-auto">

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            {isRegistering ? "Register" : "Login"}
          </h2>

          {error && <p className="text-red-500 mb-3">{error}</p>}

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 mb-4 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-gray-100"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 mb-4 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-gray-100"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button
            onClick={isRegistering ? handleRegister : handleSignIn}
            className="w-full py-2 mb-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            {isRegistering ? "Register" : "Login"}
          </button>

          <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
            {isRegistering ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-indigo-600 hover:underline ml-1"
            >
              {isRegistering ? "Login" : "Register"}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------
// MAIN APP
// ---------------------------------------------
function FinanceTracker() {
  const user = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState('expense');

  const [budget, setBudget] = useState(2000);
  const [showBudgetInput, setShowBudgetInput] = useState(false);

  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(1);

  const [savings, setSavings] = useState(0);
  const [showSavingsInput, setShowSavingsInput] = useState(false);

  const [resetDay, setResetDay] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const [lastResetDate, setLastResetDate] = useState(new Date().toISOString());

  const currencies = {
    USD: { symbol: '$', rate: 1 },
    EUR: { symbol: '€', rate: 0.92 },
    GBP: { symbol: '£', rate: 0.79 },
    JPY: { symbol: '¥', rate: 149.5 },
    CHF: { symbol: 'CHF', rate: 0.88 },
    CAD: { symbol: 'C$', rate: 1.36 },
    AUD: { symbol: 'A$', rate: 1.53 }
  };

  const categories = {
    expense: ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Healthcare", "Other"],
    income: ["Salary", "Freelance", "Investment", "Gift", "Other"]
  };

  const categoryColors = {
    Food: "bg-orange-500",
    Transport: "bg-blue-500",
    Shopping: "bg-pink-500",
    Entertainment: "bg-purple-500",
    Bills: "bg-red-500",
    Healthcare: "bg-green-500",
    Salary: "bg-emerald-500",
    Freelance: "bg-cyan-500",
    Investment: "bg-indigo-500",
    Gift: "bg-yellow-500",
    Other: "bg-gray-500"
  };

  // Load user data
  useEffect(() => {
    if (!user) return;

    const userDoc = firestore.collection("users").doc(user.uid);

    return userDoc.onSnapshot(doc => {
      if (doc.exists) {
        const data = doc.data();
        setTransactions(data.transactions || []);
        setBudget(data.budget ?? 2000);
        setSavings(data.savings ?? 0);
        setCurrency(data.currency ?? "USD");
        setResetDay(data.resetDay ?? 1);
        setLastResetDate(data.lastResetDate || new Date().toISOString());
        setDarkMode(data.darkMode ?? false);
      } else {
        userDoc.set({
          transactions: [],
          budget: 2000,
          savings: 0,
          currency: "USD",
          resetDay: 1,
          lastResetDate: new Date().toISOString(),
          darkMode: false
        });
      }
    });
  }, [user]);

  // Auto-save to Firestore on change
  useEffect(() => {
    if (!user) return;
    firestore.collection("users").doc(user.uid).set({
      transactions,
      budget,
      savings,
      currency,
      resetDay,
      lastResetDate,
      darkMode
    }, { merge: true });
  }, [transactions, budget, savings, currency, resetDay, lastResetDate, darkMode]);

  // Auto-reset budget every month
  useEffect(() => {
    const checkReset = () => {
      const now = new Date();
      const last = new Date(lastResetDate);

      if (now.getDate() === resetDay &&
         (now.getMonth() !== last.getMonth() ||
          now.getFullYear() !== last.getFullYear())) 
      {
        handleResetBudget();
      }
    };

    checkReset();
    const interval = setInterval(checkReset, 3600 * 1000);
    return () => clearInterval(interval);
  }, [resetDay, lastResetDate]);

  const handleResetBudget = () => {
    if (!window.confirm("Reset budget? This clears expense history.")) return;
    setTransactions(transactions.filter(t => t.type === "income"));
    setLastResetDate(new Date().toISOString());
  };

  const addTransaction = () => {
    if (!description || !amount || parseFloat(amount) <= 0) {
      alert("Enter valid description & amount");
      return;
    }

    const newTx = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      category,
      type,
      date: new Date().toISOString()
    };

    setTransactions([newTx, ...transactions]);
    setDescription('');
    setAmount('');
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const totalIncome = transactions.filter(t => t.type === "income").reduce((a,b)=>a+b.amount,0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((a,b)=>a+b.amount,0);
  const balance = totalIncome - totalExpenses;
  const budgetRemaining = budget - totalExpenses;
  const budgetPercent = Math.min(100, (totalExpenses / budget) * 100);
  const totalWealth = balance + savings;

  const catTotals = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const sortedCategories = Object.entries(catTotals).sort((a,b)=>b[1]-a[1]);

  const getSymbol = () => currencies[currency].symbol;
  const convert = (amt) => (amt * currencies[currency].rate).toFixed(2);

  // STYLING
  const bg = darkMode ? "bg-gray-900" : "bg-gray-100";
  const card = darkMode ? "bg-gray-800" : "bg-white";
  const text = darkMode ? "text-white" : "text-gray-800";
  const subtle = darkMode ? "text-gray-400" : "text-gray-600";
  const hover = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100";
  const input = darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300";

  // BUTTON HELPER
  const getButtonClass = (type="primary") => {
    const base = "px-4 py-2 rounded-lg font-semibold transition";
    if (type==="primary") return `${base} ${darkMode?"bg-indigo-600 text-white hover:bg-indigo-700":"bg-indigo-400 text-white hover:bg-indigo-500"}`;
    if (type==="secondary") return `${base} ${darkMode?"bg-gray-700 text-white hover:bg-gray-600":"bg-gray-200 text-gray-800 hover:bg-gray-300"}`;
    if (type==="warning") return `${base} ${darkMode?"bg-orange-500 text-white hover:bg-orange-600":"bg-orange-400 text-white hover:bg-orange-500"}`;
    if (type==="success") return `${base} ${darkMode?"bg-green-500 text-white hover:bg-green-600":"bg-green-400 text-white hover:bg-green-500"}`;
    return base;
  };

  // UI
  return (
    <div className={`min-h-screen p-6 md:p-10 ${bg} transition`}>
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1 text-center">
            <h1 className={`text-4xl font-bold ${text} flex items-center justify-center gap-3`}>
              <Wallet className="w-10 h-10 text-indigo-600" />
              Personal Finance Tracker
            </h1>
            <p className={subtle}>Track and control your money</p>
          </div>

          <div className="flex gap-3">

            {/* SETTINGS */}
            <button
              onClick={() => setShowSettings(v => !v)}
              className={`${getButtonClass("secondary")} p-3 rounded-lg shadow`}
            >
              <Settings className={`w-6 h-6 ${text}`} />
            </button>

            {/* DARK MODE */}
            <button
              onClick={() => setDarkMode(v => !v)}
              className={`${getButtonClass("secondary")} p-3 rounded-lg shadow`}
            >
              {darkMode
                ? <Sun className="w-6 h-6 text-yellow-400"/>
                : <Moon className="w-6 h-6 text-indigo-600"/>
              }
            </button>
          </div>
        </div>

        {/* SETTINGS PANEL */}
        {showSettings && (
          <div className={`${card} p-6 rounded-xl shadow-lg mb-6`}>
            <h2 className={`text-xl font-bold ${text} mb-4`}>Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Currency */}
              <div>
                <label className={`block text-sm font-semibold ${subtle}`}>Currency</label>
                <select
                  value={currency}
                  onChange={e=>setCurrency(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg ${input} ${text} focus:ring-2 focus:ring-indigo-500`}
                >
                  {Object.keys(currencies).map(c=>(
                    <option key={c} value={c}>{c} ({currencies[c].symbol})</option>
                  ))}
                </select>
              </div>

              {/* Reset day */}
              <div>
                <label className={`block text-sm font-semibold ${subtle}`}>Budget Reset Day</label>
                <input
                  type="number"
                  min="1" max="28"
                  value={resetDay}
                  onChange={e=>setResetDay(Math.max(1, Math.min(28, parseInt(e.target.value)||1)))}
                  className={`w-full px-4 py-2 rounded-lg ${input} ${text} focus:ring-2 focus:ring-indigo-500`}
                />
              </div>

            </div>
          </div>
        )}

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

          {/* Income */}
          <div className={`${card} p-6 rounded-xl border-l-4 border-green-500 shadow`}>
            <p className={`${subtle} text-sm`}>Total Income</p>
            <div className="flex justify-between items-center mt-1">
              <span className="text-3xl font-bold text-green-600">
                {getSymbol()}{convert(totalIncome)}
              </span>
              <TrendingUp className="w-10 h-10 text-green-500"/>
            </div>
          </div>

          {/* Expenses */}
          <div className={`${card} p-6 rounded-xl border-l-4 border-red-500 shadow`}>
            <p className={`${subtle} text-sm`}>Total Expenses</p>
            <div className="flex justify-between items-center mt-1">
              <span className="text-3xl font-bold text-red-600">
                {getSymbol()}{convert(totalExpenses)}
              </span>
              <TrendingDown className="w-10 h-10 text-red-500"/>
            </div>
          </div>

          {/* Balance */}
          <div className={`${card} p-6 rounded-xl border-l-4 ${balance>=0?"border-blue-500":"border-orange-500"} shadow`}>
            <p className={`${subtle} text-sm`}>Balance</p>
            <div className="flex justify-between items-center mt-1">
              <span className={`text-3xl font-bold ${balance>=0?"text-blue-600":"text-orange-600"}`}>
                {getSymbol()}{convert(balance)}
              </span>
              <DollarSign className={`w-10 h-10 ${balance>=0?"text-blue-500":"text-orange-500"}`}/>
            </div>
          </div>

          {/* Wealth */}
          <div className={`${card} p-6 rounded-xl border-l-4 border-purple-500 shadow`}>
            <p className={`${subtle} text-sm`}>Total Wealth</p>
            <div className="flex justify-between items-center mt-1">
              <span className="text-3xl font-bold text-purple-600">
                {getSymbol()}{convert(totalWealth)}
              </span>
              <PiggyBank className="w-10 h-10 text-purple-500"/>
            </div>
          </div>

        </div>

        {/* SAVINGS */}
        <div className={`${card} p-6 rounded-xl shadow-lg mb-8`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold ${text} flex items-center gap-2`}>
              <PiggyBank className="w-5 h-5 text-purple-600"/>
              Savings Account
            </h2>

            <button
              onClick={()=>setShowSavingsInput(v=>!v)}
              className={`${getButtonClass("primary")} text-sm`}
            >
              {showSavingsInput ? "Cancel" : "Update"}
            </button>
          </div>

          {showSavingsInput ? (
            <div className="flex gap-2">
              <input
                value={savings}
                type="number"
                onChange={e=>setSavings(parseFloat(e.target.value)||0)}
                className={`flex-1 px-4 py-2 rounded-lg ${input} ${text}`}
              />
              <button
                onClick={()=>setShowSavingsInput(false)}
                className={getButtonClass("primary")}
              >
                Save
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-600">
                {getSymbol()}{convert(savings)}
              </p>
              <p className={subtle}>Your savings</p>
            </div>
          )}
        </div>

        {/* BUDGET */}
        <div className={`${card} p-6 rounded-xl shadow-lg mb-8`}>
          <div className="flex justify-between items-center mb-4">

            <h2 className={`text-xl font-bold ${text} flex items-center gap-2`}>
              <PieChart className="w-5 h-5 text-indigo-600"/>
              Monthly Budget
            </h2>

            <div className="flex gap-2">

              <button
                onClick={handleResetBudget}
                className={getButtonClass("warning") + " text-sm flex items-center gap-1"}
              >
                <RefreshCw className="w-4 h-4"/> Reset
              </button>

              <button
                onClick={()=>setShowBudgetInput(v=>!v)}
                className={`${getButtonClass("primary")} text-sm`}
              >
                {showBudgetInput ? "Cancel" : "Edit"}
              </button>

            </div>

          </div>

          {showBudgetInput && (
            <div className="flex gap-2 mb-4">
              <input
                value={budget}
                type="number"
                onChange={e=>setBudget(parseFloat(e.target.value)||0)}
                className={`flex-1 px-4 py-2 rounded-lg ${input} ${text}`}
              />
              <button
                className={getButtonClass("primary")}
                onClick={()=>setShowBudgetInput(false)}
              >
                Save
              </button>
            </div>
          )}

          <p className={`${subtle} text-sm`}>
            Spent: {getSymbol()}{convert(totalExpenses)} / {getSymbol()}{convert(budget)}
          </p>

          <div className="w-full bg-gray-300 dark:bg-gray-700 h-4 rounded-full mt-2">
            <div
              className={`h-4 rounded-full ${
                budgetPercent<70 ? "bg-green-500" :
                budgetPercent<90 ? "bg-yellow-500" :
                "bg-red-500"
              }`}
              style={{width: `${budgetPercent}%`}}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ADD TRANSACTION */}
          <div className={`${card} p-6 rounded-xl shadow-lg`}>
            <h2 className={`text-xl font-bold ${text} mb-4 flex items-center gap-2`}>
              <Plus className="w-5 h-5 text-indigo-600"/>
              Add Transaction
            </h2>

            <div className="flex gap-2 mb-4">
              <button
                onClick={()=>setType("expense")}
                className={`flex-1 py-2 rounded-lg font-semibold ${
                  type==="expense" ? getButtonClass("warning") : `${hover} ${subtle}`
                }`}
              >
                Expense
              </button>

              <button
                onClick={()=>setType("income")}
                className={`flex-1 py-2 rounded-lg font-semibold ${
                  type==="income" ? getButtonClass("success") : `${hover} ${subtle}`
                }`}
              >
                Income
              </button>
            </div>

            <input
              placeholder="Description"
              className={`w-full px-4 py-2 mb-3 rounded-lg ${input} ${text}`}
              value={description}
              onChange={e=>setDescription(e.target.value)}
            />

            <input
              type="number"
              placeholder="Amount"
              className={`w-full px-4 py-2 mb-3 rounded-lg ${input} ${text}`}
              value={amount}
              onChange={e=>setAmount(e.target.value)}
            />

            <select
              className={`w-full px-4 py-2 mb-3 rounded-lg ${input} ${text}`}
              value={category}
              onChange={e=>setCategory(e.target.value)}
            >
              {categories[type].map(c=>(
                <option key={c}>{c}</option>
              ))}
            </select>

            <button
              onClick={addTransaction}
              className={getButtonClass("primary") + " w-full py-2"}
            >
              Add Transaction
            </button>
          </div>

          {/* CATEGORY BREAKDOWN */}
          <div className={`${card} p-6 rounded-xl shadow-lg`}>
            <h2 className={`text-xl font-bold ${text} mb-4 flex items-center gap-2`}>
              <Tag className="w-5 h-5 text-indigo-600"/>
              Spending by Category
            </h2>

            {sortedCategories.length===0 ? (
              <p className={`${subtle} text-center`}>No expenses yet</p>
            ) : (
              <div className="space-y-3">
              {sortedCategories.map(([cat, amt])=>{
                const pct = (amt / totalExpenses) * 100;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`font-semibold ${text}`}>{cat}</span>
                      <span className={subtle}>
                        {getSymbol()}{convert(amt)} ({pct.toFixed(0)}%)
                      </span>
                    </div>

                    <div className="w-full bg-gray-300 dark:bg-gray-700 h-2 rounded-full">
                      <div
                        className={`h-2 rounded-full ${categoryColors[cat]}`}
                        style={{width: `${pct}%`}}
                      />
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </div>

        {/* TRANSACTION LIST */}
        <div className={`${card} p-6 rounded-xl shadow-lg mt-8`}>
          <h2 className={`text-xl font-bold ${text} mb-4 flex items-center gap-2`}>
            <Calendar className="w-5 h-5 text-indigo-600"/>
            Transaction History
          </h2>

          {transactions.length===0 ? (
            <p className={`${subtle} text-center`}>No transactions yet.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.map(tx=>(
                <div key={tx.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${hover}
                              ${darkMode?"bg-gray-700":"bg-gray-50"}`}>
                  
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${categoryColors[tx.category]}`}/>
                    <div>
                      <p className={`font-semibold ${text}`}>{tx.description}</p>
                      <p className={`text-sm ${subtle}`}>
                        {tx.category} • {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-lg ${
                      tx.type==="income"?"text-green-600":"text-red-600"
                    }`}>
                      {tx.type==="income" ? "+" : "-"}
                      {getSymbol()}{convert(tx.amount)}
                    </span>

                    <button
                      onClick={()=>deleteTransaction(tx.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5"/>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ---------------------------------------------
// EXPORT APP
// ---------------------------------------------
export default function App() {
  return (
    <AuthProvider>
        <AuthGate>
          <FinanceTracker />
        </AuthGate>
    </AuthProvider>
  );
}
