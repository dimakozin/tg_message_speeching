import TelegramBot from 'node-telegram-bot-api';
import voicekit from './tinkoff-voicekit/index.mjs'

import * as settings from './settings.json' assert {type: 'json'}

const SAMPLE_RATE = 48000
const VOICE = "alyona"
const TIMEOUT = 2000

const token = settings.default.token;
const voicekitCredentials = settings.default.voicekit
const bot = new TelegramBot(token, {polling: true});

const admins = [356559570]

const getCurrentDateString = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();
    
    return mm + '-' + dd + '-' + yyyy;
}

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if(admins.includes(chatId)){
        const filename = getCurrentDateString() + ".wav"

        try {
            let result = voicekit.textToSpeechSynthesize({
                text: msg.text,
                sampleRate: SAMPLE_RATE,
                voice: VOICE,
                fileName: filename
            }, voicekitCredentials)
    
            if(result) {
                setTimeout(() => {
                    bot.sendAudio(chatId, filename)
                }, TIMEOUT)
            }
        } catch (e) { console.error(e) }

    } else {
        bot.sendMessage(chatId, "Вы не являетесь администратором данного бота")
    }

});
