import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import UserDetails from './pages/UserDetails';
import BankDetails from './pages/BankDetails';
import PaymentHistory from './pages/PaymentHistory';
import UpcomingPayments from './pages/UpcomingPayments';
import PandC from './pages/PandC';
import MovingHouse from './pages/MovingHouse';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="text-zinc-700 font-sans bg-network selection:bg-orange-100 selection:text-orange-700 relative min-h-screen flex flex-col">
      {!isLoginPage && (
        <>
          {/* Background Effects */}
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <svg className="absolute w-full h-full opacity-[0.03]" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="#f97316" strokeWidth="0.5" className="animate-dash" strokeDasharray="5,5"></path>
              <path d="M0,30 Q25,80 50,30 T100,80" fill="none" stroke="#ea580c" strokeWidth="0.5" className="animate-dash" strokeDasharray="10,10"></path>
            </svg>
            <div className="absolute top-20 right-20 w-64 h-64 bg-orange-400/5 rounded-full blur-3xl animate-pulse-glow"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
          </div>

          <Header />
        </>
      )}

      <main className={!isLoginPage ? "flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10 pb-20" : "flex-1"}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/details" element={<UserDetails />} />
          <Route path="/bank" element={<BankDetails />} />
          <Route path="/history" element={<PaymentHistory />} />
          <Route path="/upcoming" element={<UpcomingPayments />} />
          <Route path="/pandc" element={<PandC />} />
          <Route path="/moving" element={<MovingHouse />} />
        </Routes>
      </main>

      {!isLoginPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
