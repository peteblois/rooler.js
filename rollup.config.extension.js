import typescript from '@rollup/plugin-typescript';
import image from '@rollup/plugin-image';
import postcss from 'rollup-plugin-postcss'


export default {
  input: 'src/extension/page_extension.ts',
  output: {
    dir: 'built/extension',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    image(),
    typescript(),
    postcss({
      plugins: [],
      inject: false,
    }),
  ],
};
