let state = { is_playing: false }

const pullData = () => {
  fetch("/spotify/playback")
  .then(res => res.json())
  .then(data => {
    updateState(data)
  })
  .catch(err => console.log(err))
}
const organizeArtists = (artists, useUrl=false) => {
  var str = ""

  for(let i = 0; i < artists.length; i++) {
    var artist = artists[i]

    if(useUrl)
      str += `<a href="${artist.url}" target="_blank">${artist.name}</a>`
    else str += artist.name

    if(i < artists.length - 1) str += ", "
  }

  return str
}

const getTime = time => {
  return `${Math.floor(time / 60)}:${(time % 60).toLocaleString("en-US", { minimumIntegerDigits: 2, minimumFractionDigits: 0 })}`
}

function updateState(data) {
  var { position } = state

  position += 1

  state = { ...data, position }

  // console.log(state)

  if(state.is_playing) {
    $("#artwork").attr("src", state.song.artwork_url)
    $("#title").html(state.song.title)
    $("#artists").html(organizeArtists(state.song.artists))
    $("#album").html(state.song.album)
    $("#total-time").html(getTime(state.song.duration))
    $("#pos").css("width", `${parseInt($("#slider").width() - 4) * (state.song.position / state.song.duration)}px`)
    $("#current-time").html(getTime(state.song.position))
  } else {
    $("#artwork").attr("src", "/static/images/blank-album-artwork.png")
    $("#title").html("Not Playing")
    $("#artists").html("N/A")
    $("#album").html("N/A")
    $("#total-time").html(getTime(0))
    $("#pos").css("width", `0px`)
    $("#current-time").html(getTime(0))
  }
}

pullData()

var timeSinceLastCheck = 0

const continueState = () => {
  if(state.is_playing) {
    if(state.song.position < state.song.duration) {
      if (state.song.position % 30 == 0) {
        pullData()
        return
      }

      $("#pos").css("width", `${(parseInt($("#slider").width()) - 4) * (state.song.position / state.song.duration)}px`)
      $("#current-time").html(getTime(state.song.position))
      state.song.position += 1
    } else if(state.song.position == state.song.duration) {
      pullData()
    }
  } else if(!state.is_playing && timeSinceLastCheck < 60) {
    timeSinceLastCheck++
  } else if(!state.is_playing && timeSinceLastCheck >= 60) {
    timeSinceLastCheck = 0
    pullData()
  }
}

continueState()

// Update slider
setInterval(() => {
  continueState()
}, 1000)