var request = require('request');
var keys = require('../keys.json');

var TwitchAPI = {};

var isLive = false;

async function requestData(url) {
    const options = {
        url: url,
        headers: {
            'Client-ID': keys.twitch.client.id,
            'Accept': 'application/vnd.twitchtv.v5+json'
        }
    };

    return new Promise((resolve, reject) => {
        request(options, function(error, response, body){
            if(error) reject(error);
            else resolve(body);
        });
    });
}

TwitchAPI.getStreamInfo = async function(username) {
    var id = await userIdFromUsername(username);

    var data = (await streamInfo(id));

    return data;
}

TwitchAPI.isStreamLive = async function(username, callback) {
    var data = await this.getStreamInfo(username);

    if(data.stream === null) {
        if(isLive) isLive = false;
        return false;
    }

    if(!isLive) {
        console.log("w3aseL is live on Twitch! Sending tweet!");

        isLive = true;
        callback(data.stream.game, data.stream.channel.url);
    }
}

async function streamInfo(userId) {
    var data = JSON.parse(await requestData(`https://api.twitch.tv/kraken/streams/${userId}`));

    return data;
}

async function userIdFromUsername(username) {
    var data = JSON.parse(await requestData(`https://api.twitch.tv/kraken/users?login=${username}`));

    if(data._total > 0) return data.users[0]._id;

    return -1;
}

export default TwitchAPI