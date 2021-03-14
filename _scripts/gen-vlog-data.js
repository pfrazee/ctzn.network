const path = require('path')
const fs = require('fs')


const commits = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '_data', 'vlogCommits.json')))
const videos = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '_data', 'vlogVideos.json')))
const interestingCommits = fs.readFileSync(path.join(__dirname, '..', '_data', 'vlogInterestingCommits.txt'), 'utf8').split('\n').filter(Boolean)

for (let commit of commits) {
  const ts = new Date(commit.authorDate)
  commit.interesting = interestingCommits.includes(commit.abbrevHash)
  const match = findMatchingVid(ts)
  if (match) {
    commit.videoId = match.videoId
    commit.videoUrl = `https://youtu.be/${match.videoId}`
    commit.videoQP = `?t=${match.offset}`
  }
}
commits.reverse()

fs.writeFileSync(path.join(__dirname, '..', '_data', 'vlog.json'), JSON.stringify(commits, null, 2))
console.log('done')

function findMatchingVid (ts) {
  for (let vid of videos) {
    const start = new Date(vid.liveStreamingDetails.actualStartTime)
    const end = new Date(vid.liveStreamingDetails.actualEndTime)
    if (ts >= start && ts <= end) {
      return {
        videoId: vid.videoId,
        offset: (((ts - start)/1000)|0) - 10
      }
    }
  }
}