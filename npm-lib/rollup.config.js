import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.ts",  // Main library entry file
  output: [
    {
      file: "dist/index.js",
      format: "esm",
      sourcemap: true
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json"
    }),
    terser()  // Minifies output for smaller file size
  ],
  external: ["@dcl/sdk", "@dcl/js-runtime"]  // Avoid bundling Decentraland SDK
};
