const os = require('os')
const path = require('path')
const fs = require('fs')
const { gitlogPromise } = require("gitlog");

const ctznRepoPath = process.env.ctzn_repo || path.join(os.homedir(), 'work', 'ctzn')
const schemasPath = path.join(ctznRepoPath, 'schemas')

const names = fs.readdirSync(schemasPath)
for (let name of names) {
  fs.writeFileSync(path.join(__dirname, '..', '_data', 'schemas', name), fs.readFileSync(path.join(schemasPath, name)))
}
console.log('done')