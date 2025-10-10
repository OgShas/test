// assets/app.js
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/app.css';

// start Stimulus
import './bootstrap';

// register React components
import { registerReactControllerComponents } from '@symfony/ux-react';

// automatically register all React components in controllers folder
registerReactControllerComponents(
    require.context('./react/controllers', true, /\.([jt])sx?$/)
);

console.log('App.js loaded ✅');
console.log('Registering React components...');
console.log('Context keys:', require.context('./react/controllers', true, /\.([jt])sx?$/).keys());
