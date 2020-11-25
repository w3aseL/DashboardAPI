import { spotifyAPI, registerUser } from '../../bots/spotify/index'
import { args } from '../../helper/args'
import keys from '../../keys.json'
import { v4 as uuid } from 'uuid'

var scopes = ['user-read-email', 'user-read-playback-state', 'user-read-playback-position', 'user-read-currently-playing', 'user-read-recently-played', 'user-top-read']

spotifyAPI.setRedirectURI(`http://${(args['debug'] && args['debug'] == "true" ? "localhost" : keys.ip_info.prod_ip)}:${args['backend-port']}/spotify/auth`)

var openStates = []

const createNewState = () => {
  const state = uuid()

  openStates.push(state)

  //Deletes state after 5 minutes
  setTimeout(() => {
    removeActiveState(state)
  }, 30000)

  return state
}

const removeActiveState = state => {
  if(openStates.includes(state)) {
    for(let i = 0; i < openStates.length; i++)
      if(openStates[i] === state)
        openStates.splice(i, 1)
  }
}

export const login = (req, res, next) => {
  const state = createNewState()

  var url = spotifyAPI.createAuthorizeURL(scopes, state)

  res.redirect(encodeURI(url))
}

export const loginCallback = async (req, res, next) => {
  const { code, state } = req.query

  if(openStates.includes(state))
    removeActiveState(state)
  else{
    res.status(401).send({ message: "Failed to authenticate Spotify. Expired state provided!" })
    return
  }

  try {
    var result = await spotifyAPI.authorizationCodeGrant(code)

    const { registered, message, ...rest } = await registerUser(result.body)

    res.status(registered ? 201 : 400).send({ message, ...rest })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "An error occurred when retrieving the tokens for Spotify.", error: err })
    return
  }
}