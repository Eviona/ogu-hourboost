const steamClientFactory = require('./accountHandler.js');
var configsArray = require('../config/accounts.js');
const infolog = require('./infolog.js');
var botArray = [];

console.clear();
infolog.info(`| [Eviona] | Script |: Yapılandırma dosyasında ${configsArray.length} adet hesap bulundu.`);

for (i = 0; i < configsArray.length; i++) {
	var config = configsArray[i];
	var bot = steamClientFactory.buildBot(config);
	bot.doLogin();
	botArray.push(bot);
};

infolog.info(`| [Eviona] | Script |: ${botArray.length} adet hesapta hourboosta başlanıyor.`);