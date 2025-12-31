const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const schedule = require('node-schedule');
const fs = require('fs');

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './sessions' }),
    puppeteer: {
        headless: true,
        executablePath: '/app/.chrome-for-testing/chrome-linux64/chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

// QR එක Link එකක් විදිහට පෙන්වන්න
client.on('qr', (qr) => {
    console.log('--- QR ලැබුණා! ---');
    console.log('පහත ලින්ක් එක Browser එකේ Open කරලා QR එක Scan කරන්න:');
    console.log(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=300x300`);
    console.log('------------------');
});

client.on('ready', () => {
    console.log('✅ WhatsApp Bot එක Ready!');

    schedule.scheduleJob('0 0 0 1 0 *', async function(){ 
        const captionText = `*ලැබුවාවූ 2026 නව වසර ඔබ සැමට සාමය, සතුට සහ සෞභාග්‍යය පිරි සුබ අලුත් අවුරුද්දක් වේවා!* ✨🌸\n\n*Wishing you a Happy New Year 2026 filled with peace, happiness, and prosperity!* 🎆🎊\n\n> ᴘᴏᴡᴇʀᴅ ʙʏ┋© ꜱᴇɴᴜᴢ ⑉〆`;
        
        try {
            const photo = await MessageMedia.fromUrl('https://files.catbox.moe/ngqrvh.jpg');
            const audio = await MessageMedia.fromUrl('https://files.catbox.moe/g3qj7y.mp3');

            await client.sendMessage('status@broadcast', photo, { caption: captionText });

            if (fs.existsSync('numbers.txt')) {
                const numbers = fs.readFileSync('numbers.txt', 'utf-8').split(/\r?\n/).filter(n => n.trim() !== "");
                for (let num of numbers) {
                    let chatId = num.trim().replace('+', '') + "@c.us";
                    try {
                        await client.sendMessage(chatId, photo, { caption: captionText });
                        await client.sendMessage(chatId, audio, { sendAudioAsVoice: true });
                        console.log(`📩 Sent to ${num}`);
                    } catch (e) { console.log(e.message); }
                }
            }
        } catch (error) { console.error(error); }
    });
});

client.initialize();
