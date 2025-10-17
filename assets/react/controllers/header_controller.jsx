import React from 'react';
import { createRoot } from 'react-dom/client';
import Header from '../components/Header';

const container = document.getElementById('header-react');

if (container) {
    const root = createRoot(container);
    root.render(<Header />);
}
