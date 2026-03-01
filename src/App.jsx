import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import History from './pages/History';
import Analysis from './pages/Analysis';
import Builder from './pages/Builder';

function App() {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/analysis/:id" element={<Analysis />} />
          <Route path="/builder/:id" element={<Builder />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
