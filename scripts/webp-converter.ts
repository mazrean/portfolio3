import path from 'path'
import fs from 'fs'
import sharp from 'sharp'

const input_dir = './original'
const output_dir = './public'
const exts = ['.jpg', '.png']

const readdirRecursively = (dir: string, files: string[] = []) => {
  const dirents = fs.readdirSync(dir, { withFileTypes: true })

  const dirs = []
  for (const dirent of dirents) {
    if (dirent.isDirectory()) dirs.push(`${dir}/${dirent.name}`)
    if (dirent.isFile() && exts.includes(path.extname(dirent.name)))
      files.push(`${dir}/${dirent.name}`)
  }
  for (const d of dirs) {
    files = readdirRecursively(d, files)
  }
  return files
}

for (const image of readdirRecursively(input_dir)) {
  const webp = path.format({
    dir: path.join(output_dir, path.relative(input_dir, path.dirname(image))),
    name: path.basename(image, path.extname(image)),
    ext: '.webp'
  })
  fs.mkdirSync(path.dirname(webp), { recursive: true })
  if (fs.existsSync(webp)) continue
  sharp(image)
    .resize(350, 150, {
      fit: 'outside'
    })
    .webp()
    .toFile(webp)
}
