import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import History from './pages/History';
import Analysis from './pages/Analysis';

function App() {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/analysis/:id" element={<Analysis />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
