import React from 'react';
import ReactDOM from 'react-dom';
import Header from '../components/Header';

const root = document.getElementById('header-react');
if (root) {
    ReactDOM.render(<Header />, root);
}
