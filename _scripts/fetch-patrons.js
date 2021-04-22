const path = require('path')
const fs = require('fs')
const shell = require('shelljs')
const parse = require('csv-parse')

const ENDPOINT = `https://www.patreon.com/api/members.csv?filter\\[campaign_id\\]=5642544&filter\\[membership_type\\]=active_patron&json-api-version=1.0`
const sessionId = fs.readFileSync(require('os').homedir() + '/.patreon-session-id', 'utf8')

console.log('Fetching patreon contributors...')

const res = shell.exec(`curl "${ENDPOINT}" -b "session_id=${sessionId}"`, {silent: true})
if (res.code !== 0) {
  console.error('Failed to fetch patreon contributors')
  console.error(res.stderr)
  process.exit(0)
}

const csvRaw = res.stdout
parse(csvRaw, {}, function(err, data, info){
  if (err) throw err
  let keys = data[0]
  let records = []
  for (let i = 1; i < data.length; i++) {
    records.push(Object.fromEntries(data[i].map((v, j) => ([keys[j], v]))))
  }

  let sponsors = records.filter(r => r['Tier'] === 'Sponsor')
  let superContribs = records.filter(r => r['Tier'] === 'Super Contributor')
  let contribs = records.filter(r => r['Tier'] === 'Contributors')

  fs.writeFileSync(path.join(__dirname, '..', '_data', 'patrons.json'), JSON.stringify({
    sponsors: sponsors.map(c => ({name: c['Name'], twitter: c['Twitter']})),
    superContribs: superContribs.map(c => ({name: c['Name'], twitter: c['Twitter']})),
    contribs: contribs.map(c => ({name: c['Name'], twitter: c['Twitter']}))
  }, null, 2))
  console.log('done')
})


/*console.log(`## Patreon support

CTZN is [generously supported on Patreon](https://www.patreon.com/paul_maf_and_andrew) by the following folks!

### Sponsors ($100/mo)

${sponsors.map(renderWithLink).join('\n')}

### Super Contributors ($10/mo)

${superContribs.map(render).join('\n')}

### Contributors ($5/mo)

${contribs.map(render).join('\n')}
`)
function renderWithLink (record) {
  if (record['Twitter']) {
    return `- [${record['Name']}](https://twitter.com/${record['Twitter']})`
  }
  return render(record)
}

function render (record) {
  return `- ${record['Name']}`
}*/