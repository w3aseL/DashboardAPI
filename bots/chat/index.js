import tmi from "tmi.js"
import keys from "../../keys.json"
import { DEBUG } from "../../helper/args";
import { processCommandMessage } from "./commands";

const DEFAULT_CHANNEL = keys.twitch.chatbot.default_channel

var options = {
  options: {
    debug: DEBUG
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

var botConnectionStatus = false

var client = new tmi.client(options);

client.on("connected", function (address, port) {
  botConnectionStatus = true

  client.color("Green");
  client.say(DEFAULT_CHANNEL, "Hello, I am Weasel's Personal Bot! I am THE chatbot!");
});

client.on('disconnected', _ => {
  botConnectionStatus = false
})

client.on("chat", function (channel, user, message, self) {
  // Don't listen to my own messages..
  if (self || !message.startsWith("!")) return;

  processCommandMessage(message.slice(1).split(' '), user, msg => {
    client.say(DEFAULT_CHANNEL, msg)
  })

  return

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

export const isBotConnected = () => { 
  return botConnectionStatus
}

export const connectBot = () => {
  client.connect()
}

export const disconnectBot = () => {
  client.disconnect()
}