// Copies the Font Awesome files the blog needs (core CSS + solid font-face
// CSS + the solid webfont) from the app's root assets/ into the built blog
// dist. The blog's HTML links /assets/fontawesome/... so production serves the
// repo-root copy directly; this copy exists so the LOCAL preview server
// (which only serves dist/) renders FA icons too. Run after
// `vitepress build blog-src` and before `gen-sitemap.mjs`.
import { cpSync, mkdirSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'assets', 'fontawesome')
const dist = join(root, 'blog-src', '.vitepress', 'dist', 'assets', 'fontawesome')

const files = [
  'css/fontawesome.min.css',
  'css/solid.min.css',
  'webfonts/fa-solid-900.woff2',
]

mkdirSync(dist, { recursive: true })
for (const rel of files) {
  cpSync(join(src, rel), join(dist, rel))
}
console.log(`copied ${files.length} fontawesome files to ${dist}`)