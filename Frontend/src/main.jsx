import { MotionConfig } from 'motion/react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import './index.css';
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppProvider>
      <MotionConfig viewport={{once:true}}>
      <App />
      </MotionConfig>
    </AppProvider>
  </BrowserRouter>
);
