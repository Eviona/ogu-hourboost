require('dotenv').config();
const infolog = require('./infolog.js');
const { clock } = require('../config/global.js');
const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const readlineSync = require('readline-sync');
const fs = require('fs');
const { Timer } = require('easytimer.js');
const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  infolog.correct("| [Eviona] | Sunucu |: Sunucunun kapanmaması için yönlendirme yapıldı.");
  response.sendStatus(200);
});
app.listen(8000);
setInterval(() => {
  http.get(`http://nitro-sniper.eviona.repl.co`);
}, 280000)

require("http").createServer(async (req,res) => { res.statusCode = 200; res.write("Hourboost çalışıyor."); res.end(); }).listen(3000, () => infolog.correct(`| [Sunucu] | Durum |: Sunucu başlatıldı.`));
const timer = new Timer();

var botFactory = {};


botFactory.buildBot = function (config) {

	var bot = new SteamUser({
		promptSteamGuardCode: false,
		singleSentryfile: false
	});

	bot.username = process.env.USERNAME;
	bot.password = process.env.PASSWORD;
	bot.sharedSecret = process.env.SECRET;
	bot.games = config.gamesAndStatus;
	bot.customStatus = config.enableStatus;
	bot.autoMessage = config.replyMessage;
	bot.receiveMessages = config.receiveMessages;
	bot.saveMessages = config.saveMessages;
	bot.messageReceived = {};

	if (bot.saveMessages) {
		try {
			if (!fs.existsSync(`${__dirname}/../messages`)) {
				fs.mkdirSync(`${__dirname}/../messages`);
			};

			if (!fs.existsSync(`${__dirname}/../messages/${bot.username}`)) {
				fs.mkdirSync(`${__dirname}/../messages/${bot.username}`);
			};
		} catch (err) {
			console.log(`[${bot.username}] It seems that you don't have the necessary permissions to save the messages in a file`);
		};
	};

	bot.on('loggedOn', function () {
		infolog.correct(`| [Eviona] | Steam |: ${bot.steamID.getSteam2RenderedID()} numaralı STEAM ID'sine sahip hesaba giriş yapıldı.`);
		if (bot.customStatus) {
			bot.setPersona(SteamUser.EPersonaState.Online);
			bot.gamesPlayed(this.games);
		} else {
			bot.setPersona(SteamUser.EPersonaState.Invisible);
			bot.gamesPlayed(this.games);
		};
	});

	bot.on('error', function (err) {
    infolog.error(`| [Eviona] | Hata |: ${err}.`);
		setTimeout(function () { bot.doLogin(); }, 30 * 60 * 1000);
	});

	bot.doLogin = function () {
		this.logOn({
			'accountName': this.username,
			'password': this.password
		});
	};

	bot.on('steamGuard', function (domain, callback) {
		if (!this.sharedSecret) {
			var authCode = readlineSync.question(`[${this.username}] Steam Guard ${!domain ? `Code (Mobile App): ` : `Code (${domain}): `}`);
			callback(authCode);
		} else {
			var authCode = SteamTotp.generateAuthCode(this.sharedSecret);
      infolog.correct(`| [Eviona] | Auth |: 2FA Kodu istemciden başarıyla alındı.`);
			callback(authCode);
		};
	});

	bot.on('friendMessage', function (steamID, message) {
		if (bot.receiveMessages == true) {
			console.log(`[${this.username}] Message from ${steamID}: ${message}\n`);
		};
		if (bot.saveMessages) {
			var messageFile = `${__dirname}/../messages/${this.username}/${steamID}.log`;
			fs.appendFile(messageFile, `${message}\n`, function (err) {
				if (err) {
					console.log(`[${bot.username}] There was an error saving the message of ${steamID}\n`);
					return;
				};
			});
		};
		if (!this.messageReceived[steamID]) {
			if (bot.autoMessage != '') {
				bot.chatMessage(steamID, bot.autoMessage);
			};
			this.messageReceived[steamID] = true;
		};
	});

	if (clock) {
		timer.start();
		timer.addEventListener('secondsUpdated', function (err) {
			process.stdout.write(`Geçen Süre: ${timer.getTimeValues().toString()}`);
			process.stdout.cursorTo(0);
		});
	};

	return bot;
};

module.exports = botFactory;
