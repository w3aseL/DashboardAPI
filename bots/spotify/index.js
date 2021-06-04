import SpotifyWebApi from 'spotify-web-api-node'
import keys from '../../keys.json'
import { DEBUG } from "../../helper/args";

export const keyLoc = DEBUG ? keys.spotify.dev : keys.spotify.prod

export const spotifyAPI = new SpotifyWebApi({
  clientId: keyLoc.client.id,
  clientSecret: keyLoc.client.secret
});

export * from './auth'
export * from './tracking'