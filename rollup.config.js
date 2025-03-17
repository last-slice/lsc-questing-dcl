import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const packageJson = require('./package.json');
const PROD = !!process.env.CI;

export default {
  input: 'src/index.ts',
  context: 'globalThis',
  external: ["@dcl/sdk", "@dcl/js-runtime"], // ✅ Ensure DCL SDK is external
  output: [
    {
      file: packageJson.main,
      format: 'esm',  // ✅ Use ESM instead of AMD
      sourcemap: true,  // ✅ Fix sourcemap issue
    },
  ],
  plugins: [
    resolve({
      preferBuiltins: false,
      browser: true
    }),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: true, // ✅ Explicitly allow source maps
    }),
    commonjs({
      exclude: 'node_modules',
      ignoreGlobal: true,
    }),
    PROD && terser({ format: { comments: false } }),
  ],
};
