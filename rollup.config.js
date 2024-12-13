import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/creep.ts',
    output: {
      dir: 'public',
      format: 'iife',
      sourcemap: true,
    },
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
    ],
  },
  {
    input: 'src/lib.ts',
    output: {
      dir: 'public',
      format: 'iife',
      sourcemap: false,
    },
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
    ],
  },
]
