import { markdownBlock } from '../src/blocks/markdown.tsx';
import { AiChatWidget } from '../src/index.ts';
import './app.css';

const App = () => {
  const { VITE_TS_API_ENDPOINT, VITE_TS_API_KEY } = import.meta.env;
  return (
    <AiChatWidget
      endpoint={VITE_TS_API_ENDPOINT}
      apiKey={VITE_TS_API_KEY}
      welcomeMessage="Welcome! I can help you find products for your vehicle. Just tell me what you need!"
      suggestions={[
        'Help me find engine oil',
        'I need new brake pads',
        'Show me air filters',
        'Looking for spark plugs'
      ]}
      fallbackBlock={markdownBlock}
    />
  );
};

export default App;
