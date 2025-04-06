import type { D1Database } from '@cloudflare/workers-types'
declare global {
  interface Env {
    // Add your bindings here:
    DB: D1Database

    // Example for other bindings (if you add them later):
    // MY_KV_NAMESPACE: KVNamespace;
    // MY_R2_BUCKET: R2Bucket;
    // MY_DO_NAMESPACE: DurableObjectNamespace;
    // MY_SERVICE: Fetcher;

    // You might not need to repeat vars/secrets if they are
    // already correctly picked up from worker-configuration.d.ts
    // If you have issues, you can declare them here too.
    // ENV: 'development' | 'production';
    // ALLOWED_ORIGINS: string[];
    // ACCESS_TOKEN_SECRET: string;
    // REFRESH_TOKEN_SECRET: string;
  }
}

// This export {} is important to ensure the file is treated as a module
// and the `declare global` works correctly.
export {}
