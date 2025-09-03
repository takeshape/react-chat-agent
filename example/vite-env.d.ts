/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_TS_API_ENDPOINT: string;
  readonly VITE_TS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
