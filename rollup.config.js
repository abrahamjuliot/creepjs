import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/creep.ts',
  output: {
    dir: 'public',
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
  ],
};
