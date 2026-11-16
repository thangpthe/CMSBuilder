import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import PageListPage from './pages/pages-management/PageListPage';
import PublicPage from './pages/public/PublicPage';
import './App.css';

function RootRoute() {
  const [searchParams] = useSearchParams();
  if (searchParams.get('view') === 'public') {
    return <PublicPage />;
  }
  return <PageListPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/admin/pages/*" element={<PageListPage />} />
        <Route path="/p" element={<PublicPage />} />
        <Route path="/p/*" element={<PublicPage />} />
        <Route path="/public" element={<PublicPage />} />
        <Route path="/public/*" element={<PublicPage />} />
        <Route path="*" element={<RootRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
