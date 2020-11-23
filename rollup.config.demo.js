import typescript from '@rollup/plugin-typescript';
import image from '@rollup/plugin-image';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/demo/demo.ts',
  output: {
    dir: 'built/demo',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    image({
      extensions: /\.(png)$/,
    }),
    typescript(),
    postcss({
      inject: false,
      plugins: [],
    }),
  ],
};
