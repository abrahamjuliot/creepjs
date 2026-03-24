import typescript from '@rollup/plugin-typescript';

const tsconfig = process.env.TSCONFIG_PATH || './tsconfig.json'

/**
 * @param {string} dir
 */
const createConfig = (dir) => ({
  input: 'src/creep.ts',
  output: {
    file: `${dir}/creep.js`,
    format: 'iife',
    sourcemap: false,
  },
  plugins: [
    typescript({
      tsconfig,
      compilerOptions: {
        outDir: `./${dir}`,
      },
    }),
  ],
})

export default [
  createConfig('public'),
  createConfig('docs'),
]
