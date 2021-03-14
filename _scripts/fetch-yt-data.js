var {google} = require('googleapis');
const _chunk = require('lodash.chunk')
const fs = require('fs')
const path = require('path')

const auth = fs.readFileSync(require('os').homedir() + '/.google-api-creds/yt-api-key', 'utf8')
const channelId = 'UCSkcL4my2wgDRFvjQOJzrlg'
const playlistId = 'PLBND3AXbdG40F0KY9dDi5JzFBGceGvu0m'

var service = google.youtube('v3');

main()
async function main () {
  try {
    const videos = await getPlaylistVideos()
    for (let vids of _chunk(videos, 50)) {
      await attachLivestreamDetails(vids)
    }
    fs.writeFileSync(path.join(__dirname, '..', '_data', 'vlogVideos.json'), JSON.stringify(videos, null, 2))
    console.log('done')
  } catch (e) {
    console.log(e)
  }
}

getPlaylistVideos(videos => {
  console.log(videos)
})

function getPlaylistVideos () {
  return new Promise((resolve, reject) => {
    var videos = []
    next()
    function next (nextPageToken = undefined) {
      service.playlistItems.list({
        auth,
        part: 'contentDetails',
        playlistId,
        maxResults: 50,
        pageToken: nextPageToken
      }, function(err, response) {
        if (err) return reject(err)
        videos = videos.concat(response.data.items.map(item => item.contentDetails))
        if (response.data.nextPageToken) {
          next(response.data.nextPageToken)
        } else {
          resolve(videos)
        }
      });
    }
  })
}

function attachLivestreamDetails (videos) {
  return new Promise((resolve, reject) => {
    service.videos.list({
      auth,
      part: 'liveStreamingDetails',
      id: videos.map(v => v.videoId).join(','),
      maxResults: 50
    }, function(err, response) {
      if (err) return reject(err)
      for (let i = 0; i < videos.length; i++) {
        videos[i].liveStreamingDetails = response.data.items[i].liveStreamingDetails
      }
      resolve()
    })
  })
}