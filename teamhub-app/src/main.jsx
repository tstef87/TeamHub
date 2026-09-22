import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import "./firebase";
import './index.css'
import App from './App.jsx'
import { useSystemAppearance } from './hooks/useSystemAppearance'

function Root() {
  const appearance = useSystemAppearance();

  return (
    <Theme accentColor="red" grayColor="gray" appearance={appearance} radius="medium">
      <App />
    </Theme>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)