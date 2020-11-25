import tmi from "tmi.js"
import keys from "../../keys.json"
import { getPlaybackState } from "../spotify/tracking"

var isRequestingEnabled = false;

const DEFAULT_CHANNEL = keys.twitch.chatbot.default_channel

var options = {
  options: {
    debug: true
  },
  connection: {
    cluster: "aws",
    reconnect: true
  },
  identity: {
    username: keys.twitch.chatbot.username,
    password: keys.twitch.chatbot.password
  },
  channels: [DEFAULT_CHANNEL]
};

function artistsToStr(artists) {
  var str = ""

  if(artists.length == 1) return artists[0].name

  for(let i = 0; i < artists.length; i++)
    str += `${i+1 == artists.length ? "and " : ""}${artists[i].name}${i-1 < artists.length ? "," : ""} `

  return str
}

var client = new tmi.client(options);

client.on("connected", function (address, port) {
  client.color("Green");
  client.say(DEFAULT_CHANNEL, "Hello, I am Cajun Coonbot! I am THE chatbot! Screw you Nightbot!");
});

client.on("chat", function (channel, user, message, self) {
  // Don't listen to my own messages..
  if (self) return;

  if (message == "!bot") {
    client.say(DEFAULT_CHANNEL, "You want some info on me? I am a chatbot " +
      " working for " + DEFAULT_CHANNEL + " that answers questions (in the form of ! commands) " +
      "and shares information that may need to be shed! I am programmed by Weasel and will be improved " +
      "slowly once Weasel gets better at programming in JavaScript!");
  } else if (message.indexOf("!grenade") > -1) {
    var array = message.split(" ");
    var username = array[1];

    if (message.indexOf(" ") == -1) {
      client.say(DEFAULT_CHANNEL, user.username + " sat on dat grenade like it was a dildo!");
    } else if (username == "Cajun_Coonbot" || username == "Cajun_CoonBot" || username == "cajun_coonbot") {
      client.action(DEFAULT_CHANNEL, "sat on dat grenade like it was a dildo!")
      return;
    } else {
      client.say(DEFAULT_CHANNEL, username + " sat on dat grenade like it was a dildo!")
    }
  } else if (message.indexOf("!music") > -1) {
    var array = message.split(" ");
    var playbackState = getPlaybackState()

    if (array[1] == "nowplaying") {
      if (playbackState.is_playing) {
        client.say(DEFAULT_CHANNEL, playbackState.current_song.name + " by " + artistsToStr(playbackState.current_song.artists) + " is currently being played! https://open.spotify.com/track/" + playbackState.current_song.id);
        return;
      } else {
        client.say(DEFAULT_CHANNEL, "Music is not being played!");
        return;
      }
    } else if (array[1] == "request") {

      if (isRequestingEnabled == false && user.username != DEFAULT_CHANNEL) {
        client.say(DEFAULT_CHANNEL, user.username + ", requesting is not enabled!");
        return;
      }

    } else if (array[1] == "help") {
      console.log("Running music help command!");
      client.say(DEFAULT_CHANNEL, "!music help|request|skip|pause|nowplaying [track] [artist] - Additional parameters only available for request! Surround track and artist in quotation marks!");
    } else if (array[1] == "skip") {
      if (isRequestingEnabled == false && user.username != DEFAULT_CHANNEL) {
        client.say(DEFAULT_CHANNEL, user.username + ", skipping is not enabled!")
        return;
      }

      client.say(DEFAULT_CHANNEL, "Skipping track!")
      return;
    } else if (array[1] == "pause") {
      if (isRequestingEnabled == false && user.username != DEFAULT_CHANNEL) {
        client.say(DEFAULT_CHANNEL, user.username + ", pausing is not enabled!");
        return;
      } else if (user.username == DEFAULT_CHANNEL) {
        client.say(DEFAULT_CHANNEL, "Paused music!");
        return;
      }
    } else if (array[1] == "queue") {
      if (array[2] == "clear") {
        if (isRequestingEnabled == false && user.username != DEFAULT_CHANNEL) {
          client.say(DEFAULT_CHANNEL, user.username + ", clearing the queue is not enabled!");
          return;
        }


      } else {
        client.say(DEFAULT_CHANNEL, "WIP Command");
        return;
      }
    } else if (array[1] == "control") {
      if (user.username == DEFAULT_CHANNEL || user["user-type"] === "mod") {
        if (isRequestingEnabled == false) {
          isRequestingEnabled = true;
          client.say(DEFAULT_CHANNEL, "Enabled chat music controls!");
          return;
        } else {
          isRequestingEnabled = false;
          client.say(DEFAULT_CHANNEL, "Disabled chat music controls!");
          return;
        }
      } else {
        client.say(DEFAULT_CHANNEL, user.username + ", you cannot run this command!");
        return;
      }
    }
  }

  if (user["user-type"] === "mod") {
    if (message === "!clear") {
      client.clear(DEFAULT_CHANNEL);
      client.action(DEFAULT_CHANNEL, "cleared chat clutter!");
    } else if (message === "!hello") {
      client.say(DEFAULT_CHANNEL, "Hi, " + user.username + "!")
    } else if (message === "!commercial") {
      client.commercial(DEFAULT_CHANNEL, 30);
      client.action(DEFAULT_CHANNEL, "is running a 30 second commercial!");
    } else if (message == "!emoteonly") {
      client.action(DEFAULT_CHANNEL, "sets chat to emote only!")
      client.emoteonly(DEFAULT_CHANNEL);
    } else if (message == "!normal") {
      client.action(DEFAULT_CHANNEL, "sets chat to normal!")
      client.emoteonlyoff(DEFAULT_CHANNEL);
      client.subscribersoff(DEFAULT_CHANNEL);
    }
  }

  if (user.username === DEFAULT_CHANNEL) {
    if (message === "!clear") {
      client.clear(DEFAULT_CHANNEL);
      client.action(DEFAULT_CHANNEL, "cleared chat clutter!");
    } else if (message === "!hello") {
      client.say(DEFAULT_CHANNEL, "Hi, " + user.username + "!")
    } else if (message === "!commercial") {
      client.commercial(DEFAULT_CHANNEL, 30);
      client.action(DEFAULT_CHANNEL, "is running a 30 second commercial!");
    } else if (message == "!emoteonly") {
      client.action(DEFAULT_CHANNEL, "sets chat to emote only!")
      client.emoteonly(DEFAULT_CHANNEL);
    } else if (message == "!normal") {
      client.action(DEFAULT_CHANNEL, "sets chat to normal!")
      client.emoteonlyoff(DEFAULT_CHANNEL);
      client.subscribersoff(DEFAULT_CHANNEL);
    }
  }

  if (user.username == "nightbot") {
    client.say(DEFAULT_CHANNEL, "FAK OFF NIGHTBOT!");
  }
});

client.on("join", function (channel, username, self) {

});

export { client };