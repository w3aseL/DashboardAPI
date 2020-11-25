import SpotifyWebApi from 'spotify-web-api-node'
import keys from '../../keys.json'
import { args } from "../../helper/args";

export const keyLoc = (args['debug'] && args['debug'] == "true") ? keys.spotify.dev : keys.spotify.prod

export const spotifyAPI = new SpotifyWebApi({
  clientId: keyLoc.client.id,
  clientSecret: keyLoc.client.secret
});

export * from './auth'
export * from './tracking'