import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QuoteBuilder } from './pages/QuoteBuilder';
import { QuotePreview } from './pages/QuotePreview';
import { createDefaultQuote } from './data/quoteUtils';
import type { QuoteData } from './types/quote';

export default function App() {
  const [quote, setQuote] = useState<QuoteData>(createDefaultQuote);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuoteBuilder quote={quote} setQuote={setQuote} />} />
        <Route path="/preview" element={<QuotePreview quote={quote} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
