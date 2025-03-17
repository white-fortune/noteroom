import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import UserAuthProvider from './context/UserAuthContext.tsx'

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <UserAuthProvider>
        <App />
      </UserAuthProvider>
    </BrowserRouter>
)
