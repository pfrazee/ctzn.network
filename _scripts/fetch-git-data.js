const os = require('os')
const path = require('path')
const fs = require('fs')
const { gitlogPromise } = require("gitlog");

const ctznRepoPath = process.env.ctzn_repo || path.join(os.homedir(), 'work', 'ctzn')
const ctznryRepoPath = process.env.ctzn_repo || path.join(os.homedir(), 'work', 'ctznry')

main()
async function main () {
  try {
    console.log('CTZN:', ctznRepoPath)
    let commits = await fetchAllCommits('ctzn', ctznRepoPath)
    console.log('done')
    console.log('CTZNRY:', ctznryRepoPath)
    commits = commits.concat(await fetchAllCommits('ctznry', ctznryRepoPath))
    console.log('done')
    commits.sort((a, b) => a.authorDate.localeCompare(b.authorDate))
    fs.writeFileSync(path.join(__dirname, '..', '_data', 'vlogCommits.json'), JSON.stringify(commits, null, 2))
  } catch (e) {
    console.log(e)
  }
}

async function fetchAllCommits (repo, repoPath) {
  let commits = []
  let before = undefined
  while (true) {
    let page = await gitlogPromise({
      repo: repoPath,
      before,
      number: 100,
      fields: ["hash", "abbrevHash", "subject", "authorName", "authorDate"],
      execOptions: { maxBuffer: 1000 * 1024 },
    })
    if (page.length === 0 || (page.length === 1 && page[0].hash === commits[commits?.length - 1]?.hash)) {
      return commits
    }
    commits = commits.concat(page.map(commit => ({
      repo,
      hash: commit.hash,
      abbrevHash: commit.abbrevHash,
      subject: commit.subject,
      authorName: commit.authorName,
      authorDate: (new Date(commit.authorDate)).toISOString()
    })))
    before = page[page.length - 1].authorDate
  }
}