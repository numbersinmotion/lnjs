import { defineConfig } from 'tsup';

export default defineConfig((options) => {
  return {
    globalName: 'ln',
    entry: { ln: 'src/index.ts' },
    clean: true,
    minify: !options.watch,
    format: ['esm', 'cjs', 'iife'],
    dts: true,
    // async onSuccess() {
    //   // Start some long running task
    //   // Like a server
    // },
  };
});
