import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Jobs from './pages/Jobs';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Portal from './pages/Portal';
import Admin from './pages/Admin';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isHomePage && <Header />}
      <main className={isHomePage ? '' : 'flex-grow'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/apply/:type" element={<Portal />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      {!isHomePage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
