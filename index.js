const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const schedule = require('node-schedule');
const fs = require('fs');

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './sessions' }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', qr => qrcode.generate(qr, {small: true}));

client.on('ready', () => {
    console.log('WhatsApp සම්බන්ධයි! රෑ 12:00 ට පණිවිඩ යැවීමට සූදානම්...');

    // ලංකාවේ වෙලාවෙන් 2026 ජනවාරි 1 රෑ 12:00 ට
    const job = schedule.scheduleJob('0 0 0 1 0 *', async function(){
        console.log('සුබ අලුත් අවුරුද්දක්! පණිවිඩ යැවීම ඇරඹුනා...');

        const caption = `ලැබුවාවූ 2026 නව වසර ඔබ සැමට සාමය, සතුට සහ සෞභාග්‍යය පිරි සුබ අලුත් අවුරුද්දක් වේවා! ✨🌸\n\nWishing you a Happy New Year 2026 filled with peace, happiness, and prosperity! 🎆🎊\n\n> ᴘᴏᴡᴇʀᴅ ʙʏ┋© ꜱᴇɴᴜᴢ ⑉〆`;
        
        try {
            const photo = await MessageMedia.fromUrl('https://files.catbox.moe/ngqrvh.jpg');
            const audio = await MessageMedia.fromUrl('https://files.catbox.moe/g3qj7y.mp3');

            // 1. Status එක Update කිරීම
            await client.sendMessage('status@broadcast', photo, { caption: caption });
            console.log('Status Update කළා!');

            // 2. numbers.txt file එකෙන් අංක කියවා පණිවිඩ යැවීම
            const data = fs.readFileSync('numbers.txt', 'utf-8');
            const numbers = data.split(/\r?\n/).filter(line => line.trim() !== "");

            for (let num of numbers) {
                let chatId = num.trim() + "@c.us";
                await client.sendMessage(chatId, photo, { caption: caption });
                await client.sendMessage(chatId, audio, { sendAudioAsVoice: true });
                console.log(`${num} ට යැව්වා.`);
                
                // WhatsApp Block නොවීමට තත්පර 2ක විරාමයක් ලබා දීම
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            console.log('සියලුම වැඩ අවසන්!');

        } catch (err) {
            console.error('වැඩේ අතරමග නතර වුණා:', err);
        }
    });
});

client.initialize();
