// assets/bootstrap.js
import { startStimulusApp } from '@symfony/stimulus-bridge';
import './controllers.json';

const app = startStimulusApp(require.context(
    './controllers', true, /\.js$/
));

export default app;
