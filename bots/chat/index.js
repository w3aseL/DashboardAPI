import tmi from "tmi.js"
import keys from "../../keys.json"
import { DEBUG } from "../../helper/args";
import { processCommandMessage } from "./commands";

export const DEFAULT_CHANNEL = keys.twitch.chatbot.default_channel

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

  processCommandMessage(message.slice(1).split(' '), user, client)

  return
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