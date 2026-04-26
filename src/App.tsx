import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { QuoteBuilder } from './pages/QuoteBuilder';
import { QuotePreview } from './pages/QuotePreview';
import { createDefaultQuote } from './data/quoteUtils';
import type { QuoteData } from './types/quote';

export default function App() {
  const [quote, setQuote] = useState<QuoteData>(createDefaultQuote);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <QuoteBuilder quote={quote} setQuote={setQuote} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/preview"
            element={
              <ProtectedRoute>
                <QuotePreview quote={quote} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
