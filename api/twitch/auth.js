import { DEBUG, API_PORT } from '../../helper/args'
import keys from '../../keys.json'
import { v4 as uuid } from 'uuid'
import { registerUser } from '../../bots/chat/api'

const SCOPES = ['channel:manage:broadcast', 'channel:edit:commercial', 'channel:manage:predictions',
    'channel:manage:redemptions', 'channel:read:hype_train', 'channel:read:subscriptions',
    'moderation:read', 'user:read:subscriptions', 'moderator:manage:banned_users', 'moderator:read:blocked_terms',
    'moderator:manage:blocked_terms', 'moderator:read:chat_settings', 'moderator:manage:chat_settings']

const REDIRECT_URI = DEBUG ? `http://localhost:${API_PORT}` : `https://${keys.ip_info.prod_ip}`
const REDIRECT = `${REDIRECT_URI}/twitch/redirect_auth`

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

  var url = `https://id.twitch.tv/oauth2/authorize?client_id=${keys.twitch.client.id}&redirect_uri=${REDIRECT}&response_type=code&scope=${SCOPES.join(' ')}&state=${state}`

  res.status(200).send({ redirect_url: encodeURI(url) })
}

export const loginCallback = async (req, res, next) => {
  const { code, state } = req.query

  if(openStates.includes(state))
    removeActiveState(state)
  else{
    res.status(401).send({ message: "Failed to authenticate Twitch. Expired state provided!" })
    return
  }

  registerUser(code, REDIRECT)
  .then(({ registered, message, ...rest }) => res.status(registered ? 201 : 400).send({ message, ...rest }))
  .catch(err => {
    console.error(err)
    res.status(500).send({ message: "An error occurred when retrieving the tokens for Twitch.", error: err })
  })
}