import { registerUser } from '../../bots/destiny/index'
import keys from '../../keys.json'
import { v4 as uuid } from 'uuid'

var openStates = []

const AUTH_ENDPOINT = "https://www.bungie.net/en/oauth/authorize"

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

  var url = `${AUTH_ENDPOINT}?client_id=${keys.destiny.client.id}&response_type=code&state=${state}`

  res.status(200).send({ redirect_url: encodeURI(url) })
}

export const loginCallback = async (req, res, next) => {
  const { code, state } = req.query

  if(openStates.includes(state))
    removeActiveState(state)
  else{
    res.status(401).send({ message: "Failed to authenticate Destiny. Expired state provided!" })
    return
  }

  try {
    const { registered, message, ...rest } = await registerUser(code)

    res.status(registered ? 201 : 400).send({ message, ...rest })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "An error occurred when retrieving the tokens for the Destiny API.", error: err })
    return
  }
}