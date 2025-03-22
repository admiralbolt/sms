/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly __HOST__: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __HOST__: string;