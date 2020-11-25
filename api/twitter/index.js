import { botTwit, mainTwit } from '../../bots/twodder'
import { APILogger, LogColors } from '../../helper/logger'
import { TwitterStats } from '../../data/database'

export const postTweet = async (req, res, next) => {
  const acct = req.params.acct
  const { tweet } = req.body

  if(!acct && (acct != "main" || acct != "bot")) {
    res.status(400).send({ message: "No valid account specified!" })
    return
  }

  if(!tweet) {
    res.status(400).send({ message: "No tweet message provided!" })
    return
  }

  if(tweet.length > 240) {
    res.status(400).send({ message: "Tweet length is too long!" })
    return
  }

  var result

  try {
    switch(acct) {
      case "main": {
        result = await mainTwit.postTweet(tweet)
        break;
      }
      case "bot": {
        result = await botTwit.postTweet(tweet)
        break;
      }
    }
  } catch(e) {
    res.status(500).send({ message: e.message })
  }

  res.status(201).send({ message: "Sent tweet!", "twitter-res": result })
  return
}

export const getAllStats = async (req, res, next) => {
  const acct = req.params.acct

  if(!acct && (acct != "main" || acct != "bot")) {
    res.status(400).send({ message: "No valid account specified!" })
    return
  }

  let acct_id

  switch(acct) {
    case "main": {
      acct_id = mainTwit.getSimpleUserInfo().id
      break;
    }
    case "bot": {
      acct_id = botTwit.getSimpleUserInfo().id
      break;
    }
  }

  try {
    const stats = await TwitterStats.findAll({ attributes: [ "collected_at", "follower_count", "following_count" ], where: { TwitterUserId: acct_id } })
    res.status(200).send({ stats })
  } catch(e) {
    res.status(500).send({ message: e.message })
  }

  return
}