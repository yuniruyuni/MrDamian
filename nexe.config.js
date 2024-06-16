import { compile } from 'nexe';

await compile({
  input: './dist/main.js',
  build: true,
  resources: [
    "package.json",
    "./dist/main.js",
  ],
})
