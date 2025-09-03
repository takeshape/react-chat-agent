import { AiChatWidget, AiProvider, TakeShapeProvider } from '../src/index.ts';
import './app.css';

const App = () => {
  const { VITE_TS_API_ENDPOINT, VITE_TS_API_KEY } = import.meta.env;
  return (
    <TakeShapeProvider endpoint={VITE_TS_API_ENDPOINT} apiKey={VITE_TS_API_KEY}>
      <AiProvider>
        <AiChatWidget />
      </AiProvider>
    </TakeShapeProvider>
  );
};

export default App;
