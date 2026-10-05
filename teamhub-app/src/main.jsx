import { StrictMode, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import { ThemeProvider } from '@mui/material/styles'
import "./firebase";
import './index.css'
import App from './App.jsx'
import { useSystemAppearance } from './hooks/useSystemAppearance'
import { getTheme } from './theme'

function Root() {
  const appearance = useSystemAppearance();
  const muiTheme = useMemo(() => getTheme(appearance), [appearance]);

  return (
    <Theme accentColor="red" grayColor="gray" appearance={appearance} radius="medium">
      <ThemeProvider theme={muiTheme}>
        <App />
      </ThemeProvider>
    </Theme>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)