import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 🚨 Asegúrate de importar esto
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from './lib/supabase'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <App />
    </SessionContextProvider>
  </StrictMode>
)
