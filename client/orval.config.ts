import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: 'http://localhost:3000/doc',
    output: {
      mode: 'tags-split',
      target: './app/api/generated.ts',
      client: 'react-query',
      baseUrl: 'http://localhost:3000',
      override: {
        mutator: {
          path: './app/api/mutator.ts',
          name: 'customFetch',
        },
      },
    }
  }
});
