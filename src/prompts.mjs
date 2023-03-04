import { existsSync } from 'node:fs'
import { basename } from 'node:path'
import { getPackageName, isDirEmpty } from './utils.mjs'
import colors from 'colors'

export const PromptConfig = [{
  type: 'text',
  name: 'project',
  message: 'Choose your project name:',
  initial: 'cam-baker-project',
  format: value => value.trim()
}, {
  type: prev => prev === '.' ? 'confirm' : null,
  name: 'cwd',
  message: () => `You want to use the current directory? ${basename(process.cwd())}`
}, {
  /** abort if previous (cwd) question is not confirmed  */
  type: (prev, { cwd }) => {
    if (cwd === false) throw new Error('Creation cancelled')
    return null
  },
  name: 'cwdChecker'
}, {
  type: (prev, { project }) => existsSync(project) && !isDirEmpty(project) ? 'confirm' : null,
  name: 'overwrite',
  message: `The chosen directory is not empty. Can I ${colors.red.bold('delete(!)')} existing files and continue?`
}, {
  /** abort if previous (overwrite) question is not confirmed  */
  type: (prev, { overwrite }) => {
    if (overwrite === false) throw new Error('Creation cancelled')
    return null
  },
  name: 'overwriteChecker'
}, {
  type: (prev, { project }) => getPackageName(project) !== project ? 'text' : null,
  name: 'packageName',
  message: 'Choose your package name:',
  initial: (prev, { project }) => getPackageName(project)
}]

/**
 * Logs started message
 * @param {String} fullPath - project fullpath destination
 */
export function logStarted ({ fullPath }) {
  console.log(`\nScaffolding project in ${colors.grey(fullPath)}`)
}

/**
 * Logs finished message
 * @param {String} cwd - current working directory
 * @param {String} packageName - project package name
 */
export function logFinished ({ cwd, packageName }) {
  console.log(`${colors.green('Done √')}. Finish installing npm dependencies and run start command.\n`)
  if (!cwd) console.log(`  cd ${packageName}`)
  console.log('  npm install')
  console.log('  npm run dev\n')
}
