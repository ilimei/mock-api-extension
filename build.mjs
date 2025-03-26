import { access, rmdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { build, defineConfig } from 'vite';

const SrcDirname = 'src';
const DistDirname = 'dist';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcPath = resolve(__dirname, SrcDirname);
const distPath = resolve(__dirname, 'public', DistDirname);

const entryPoints = [
  { inputName: 'background', inputPath: resolve(srcPath, 'background/index.ts') },
  { inputName: 'content', inputPath: resolve(srcPath, 'content/index.ts') },
  { inputName: 'interceptor', inputPath: resolve(srcPath, 'content/interceptor.ts') },
  { inputName: 'options', inputPath: resolve(srcPath, 'options/options.html') },
  { inputName: 'popup', inputPath: resolve(srcPath, 'popup/popup.html') },
];

const isWatch = process.argv.some(arg => arg.includes('--watch'));

function createConfig({ inputName, inputPath, outputDirname }) {
  return defineConfig({
    root: resolve(__dirname, 'src'),
    base: '/dist/',
    build: {
      outDir: distPath,
      watch: isWatch,
      // >>>> this is optional hence I do not want to minify/mangle anything
      minify: false,
      terserOptions: {
        compress: false,
        mangle: false,
      },
      // <<<<
      rollupOptions: {
        input: {
          [inputName]: inputPath,
        },
        output: {
          inlineDynamicImports: true,
          entryFileNames: 'assets/[name].js',
        },
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  });
}

async function start() {
  try {
    await access(distPath); // check dist directory exists
    await rmdir(distPath, { recursive: true, force: true }); // if exists clear the whole before all builds
  } catch {} // I don't care about errors here
  for (const entryPoint of entryPoints) {
    await build(createConfig(entryPoint)); // run each build in queue, when `watch: true` promise will be resolved anyway after first build
  }
}

await start();
