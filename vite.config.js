import { defineConfig } from 'vite';
import { writeFileSync } from 'node:fs';

// base './' => relative asset paths, deployable at any URL
// (GitHub Pages project sites, Netlify, nginx subfolder...)
export default defineConfig({
  base: './',
  build: {
    target: 'es2020'
  },
  plugins: [
    {
      // dev-only helper: POST a dataURL to /__save?f=name.png to dump it to disk
      name: 'dev-screenshot-dump',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use('/__save', (req, res) => {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', () => {
            const name = (new URL(req.url, 'http://x').searchParams.get('f') || 'shot.png').replace(/[^\w.-]/g, '');
            const b64 = body.replace(/^data:image\/png;base64,/, '');
            writeFileSync(`.dev-shots-${name}`, Buffer.from(b64, 'base64'));
            res.end('ok');
          });
        });
      }
    }
  ]
});
