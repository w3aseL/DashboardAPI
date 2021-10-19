import Twit from "twit"
import keys from "../keys.json"
import { DEBUG } from "../helper/args";
import { TwitterLogger } from "../helper/logger"
import { TwitterUser } from "../data/database"

const TWITTER_COLOR = "735243"    // Signature Weasel brown

class TwodderBot {
  constructor(keys) {
    this.twodderAcct = new Twit({
      consumer_key: keys.consumer.key,
      consumer_secret: keys.consumer.secret,
      access_token: keys.access.key,
      access_token_secret: keys.access.secret
    });

    this.twodderAcct.get('account/verify_credentials', async (err, { id_str, screen_name, ...data }, res) => {
      this.twodderInfo = {
        id: id_str,
        screen_name: screen_name
      }
      
      if (err) {
        TwitterLogger.error(err)
        return
      }

      var user = await TwitterUser.findOne({ where: { id: id_str } })

      if (!user) {
        await TwitterUser.create({ id: id_str, handle: screen_name })
        return
      }

      if (user.handle != screen_name)
        await user.update({ handle: screen_name })
    })
  }

  async postTweet(tweetMsg) {
    return new Promise((resolve, reject) => {
      this.twodderAcct.post('statuses/update', { status: tweetMsg }, function (err, data, response) {
        if (err) reject(err);
        else resolve(response);
      });
    });
  }

  async getFollowers(user) {
    return new Promise((resolve, reject) => {
      this.twodderAcct.get('followers/ids', (user ? { screen_name: user } : {}), function (err, data, response) {
        if (err) reject(err)
        else resolve(data)
      });
    });
  }

  async getFollowing(user) {
    return new Promise((resolve, reject) => {
      this.twodderAcct.get('friends/ids', (user ? { screen_name: user } : {}), function (err, data, response) {
        if (err) reject(err)
        else resolve(data)
      });
    });
  }

  async getUserInfo() {
    return new Promise((resolve, reject) => {
      this.twodderAcct.get('account/verify_credentials', (err, data, res) => {
        if(err) reject(err)
        else resolve(data)
      })
    })
  }

  async updateBio(bio) {
    return new Promise((resolve, reject) => {
      this.twodderAcct.post('account/update_profile', { description: bio }, (err, data, res) => {
        if(err) reject(err)
        else resolve(data)
      })
    })
  }

  async changeColor(color=TWITTER_COLOR) {
    return new Promise((resolve, reject) => {
      this.twodderAcct.post('account/update_profile', { profile_link_color: color }, (err, data, res) => {
        if(err) reject(err)
        else resolve(data)
      })
    })
  }

  getSimpleUserInfo() {
    return this.twodderInfo
  }

  getAccount() {
    return this.twodderAcct
  }

  setupStreams() {

  }
}

const keyLoc = DEBUG ? keys.twodder.dev : keys.twodder.prod

const botTwit = new TwodderBot(keyLoc.bot)
const mainTwit = new TwodderBot(keyLoc.main)

export { botTwit, mainTwit }