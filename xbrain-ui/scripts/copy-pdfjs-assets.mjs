import { promises as fs } from 'fs'
import path from 'path'

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true })
  const entries = await fs.readdir(src, { withFileTypes: true })
  await Promise.all(
    entries.map(async (entry) => {
      const s = path.join(src, entry.name)
      const d = path.join(dest, entry.name)
      if (entry.isDirectory()) {
        await copyDir(s, d)
      } else if (entry.isFile()) {
        await fs.copyFile(s, d)
      }
    }),
  )
}

async function main() {
  const pkgRoot = process.cwd()
  const nm = path.join(pkgRoot, 'node_modules', 'pdfjs-dist')
  const srcCmaps = path.join(nm, 'cmaps')
  const srcFonts = path.join(nm, 'standard_fonts')
  const destRoot = path.join(pkgRoot, 'public', 'pdfjs')
  const destCmaps = path.join(destRoot, 'cmaps')
  const destFonts = path.join(destRoot, 'standard_fonts')

  try {
    await copyDir(srcCmaps, destCmaps)
    await copyDir(srcFonts, destFonts)
    console.log('Copied pdfjs assets to public/pdfjs')
  } catch (err) {
    console.warn('Skipping pdfjs assets copy:', err?.message || err)
  }
}

main()
