import fetch from 'node-fetch'

const NPM_API = 'https://registry.npmjs.org'

export function getLatestPackageVersion (packageName) {
  if (!packageName) return
  return fetch(`${NPM_API}/${packageName}`)
    .then(res => res.json())
    .then(data => data['dist-tags'].latest)
}
