import { existsSync, readdirSync, rmSync, copyFileSync, mkdirSync, statSync } from 'node:fs'
import { resolve, basename } from 'node:path'

/**
 * Verify if a directory exists and is empty
 * @param {String} path - directory path
 * @returns {Boolean=} whether the directory is empty or not
 */
export function isDirEmpty (path) {
  if (!existsSync(path)) return
  return readdirSync(path)?.length === 0
}

/**
 * Delete all files from a directory
 * @param {String} path - directory path
 */
export function emptyDir (path) {
  if (!existsSync(path)) return
  for (const file of readdirSync(path)) {
    rmSync(resolve(path, file), { recursive: true, force: true })
  }
}

/**
 * Copies a directory or file to `dest` path
 * @param {String} src - source path
 * @param {String} dest - destination path
 */
export function copy (src, dest) {
  const stat = statSync(src)

  stat.isDirectory()
    ? copyDir(src, dest)
    : copyFileSync(src, dest)
}

/**
 * Transforms a `Project Name` into a valid NPM package name
 * @param {String} rawProjectName - any given string for projects name
 * @returns {Sring} NPM valid package name
 */
export function getPackageName (rawProjectName) {
  const projectName = rawProjectName === '.'
    ? basename(process.cwd())
    : rawProjectName

  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z\d\-~]+/g, '-')
}

function copyDir (srcDir, destDir) {
  mkdirSync(destDir, { recursive: true })

  for (const file of readdirSync(srcDir)) {
    copy(
      resolve(srcDir, file),
      resolve(destDir, file)
    )
  }
}
