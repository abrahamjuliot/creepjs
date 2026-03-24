import typescript from '@rollup/plugin-typescript';

const tsconfig = process.env.TSCONFIG_PATH || './tsconfig.json'

export default {
  input: 'src/creep.ts',
  output: {
    dir: 'public',
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    typescript({ tsconfig }),
  ],
};
