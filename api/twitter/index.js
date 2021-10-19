import { Router } from "express"

import { verifyAccount } from "../auth"
import { botTwit, mainTwit } from '../../bots/twodder'
import { APILogger, LogColors } from '../../helper/logger'
import { TwitterStats } from '../../data/database'

const getAccountByParam = acct => {
  switch(acct) {
    case "main": {
      return mainTwit
    }
    case "bot": {
      return botTwit
    }
  }

  return null
}

const postTweet = async (req, res, next) => {
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
    result = await getAccountByParam(acct).postTweet(tweet)
  } catch(e) {
    res.status(500).send({ message: e.message })
  }

  res.status(201).send({ message: "Sent tweet!", "twitter-res": result })
  return
}

const getAllStats = async (req, res, next) => {
  const acct = req.params.acct

  if(!acct && (acct != "main" || acct != "bot")) {
    res.status(400).send({ message: "No valid account specified!" })
    return
  }

  try {
    const stats = await TwitterStats.findAll({ attributes: [ "collected_at", "follower_count", "following_count" ], where: { TwitterUserId: getAccountByParam(acct).getSimpleUserInfo().id } })
    res.status(200).send({ stats })
  } catch(e) {
    res.status(500).send({ message: e.message })
  }

  return
}

const changeLinkColor = async (req, res, next) => {
  const { color } = req.body
  const { acct } = req.params

  if(!acct && (acct != "main" || acct != "bot")) {
    res.status(400).send({ message: "No valid account specified!" })
    return
  }

  try {
    var result = await getAccountByParam(acct).changeColor(color)

    res.status(201).send({ message: "Updated color!", "twitter-res": result })
  } catch(e) {
    res.status(500).send({ message: e.message })
  }

  return
}

const changeBio = async (req, res, next) => {
  const { bio } = req.body
  const { acct } = req.params

  if(!acct && (acct != "main" || acct != "bot")) {
    res.status(400).send({ message: "No valid account specified!" })
    return
  }

  if(!bio) {
    res.status(400).send({ message: "No bio message provided!" })
    return
  }

  if(bio.length > 160) {
    res.status(400).send({ message: "Bio length is too long!" })
    return
  }

  try {
    var result = await getAccountByParam(acct).updateBio(bio)

    res.status(201).send({ message: "Updated bio!", "twitter-res": result })
  } catch(e) {
    res.status(500).send({ message: e.message })
  }

  return
}

var twitterRouter = Router()

twitterRouter.post('/:acct/tweet', verifyAccount, postTweet)
twitterRouter.get('/:acct/statistics', verifyAccount, getAllStats)
twitterRouter.post('/:acct/change-color', verifyAccount, changeLinkColor)
twitterRouter.post('/:acct/change-bio', verifyAccount, changeBio)

export { twitterRouter }