import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "esm",
      sourcemap: true,
    },
  ],
  external: ["@dcl/sdk", "@dcl/js-runtime", "colyseus"], // ✅ Externalize dependencies
  plugins: [
    resolve({
      browser: true, // ✅ Ensures browser compatibility
      preferBuiltins: false,
    }),
    commonjs({
      include: /node_modules/, // ✅ Fix for `protobufjs/minimal.js`
      requireReturnsDefault: "auto", // ✅ Ensures correct `default` handling
    }),
    typescript({ tsconfig: "./tsconfig.json" }),
    terser(),
  ],
};
