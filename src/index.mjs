import prompts from 'prompts'
import { fileURLToPath } from 'node:url'
import { readdirSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { logFinished, logStarted, PromptConfig } from './prompts.mjs'
import { copy, emptyDir, getPackageName } from './utils.mjs'
import { getLatestPackageVersion } from './npm.mjs'

export function create () {
  prompts(PromptConfig, {
    onCancel: () => {
      throw new Error('Creation cancelled')
    }
  })
    .then(createProject)
    .catch(error => console.log(error.message))
}

async function createProject (config) {
  config.packageName = config.packageName ?? getPackageName(config.project)
  config.fullPath = join(process.cwd(), !config.cwd ? config.packageName : '')
  config.templateDir = resolve(fileURLToPath(import.meta.url), '../..', 'src/template')

  console.log(config.templateDir)

  try {
    config.version = await getLatestPackageVersion('cam-baker')
  } catch (err) {
    config.version = 'latest'
  }

  if (!config.cwd && !config.overwrite) mkdirSync(config.fullPath, { recursive: true })
  if (config.overwrite) emptyDir(config.fullPath)

  logStarted(config)
  createTemplateCopy(config)
  createPackageJson(config)
  logFinished(config)
}

function createTemplateCopy ({ templateDir, fullPath }) {
  const files = readdirSync(templateDir)
    .filter(name => name !== 'package.json')

  files.forEach(filename =>
    copy(
      join(templateDir, filename),
      join(fullPath, filename.replace('_gitignore', '.gitignore'))
    )
  )
}

function createPackageJson ({ templateDir, packageName, version, fullPath }) {
  const isFallbackVersion = version === 'latest'
  const packageVersion = isFallbackVersion ? version : `^${version}`
  const packageJson = JSON.parse(
    readFileSync(join(templateDir, 'package.json'), 'utf-8')
  )

  packageJson.name = packageName
  packageJson.devDependencies['cam-baker'] = packageVersion

  writeFileSync(
    join(fullPath, 'package.json'),
    JSON.stringify(packageJson, null, 2) + '\n'
  )
}
