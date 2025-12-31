const { Client, MessageMedia } = require('whatsapp-web.js'); // LocalAuth අයින් කළා
const schedule = require('node-schedule');
const fs = require('fs');

const client = new Client({
    puppeteer: {
        headless: true,
        executablePath: '/app/.chrome-for-testing/chrome-linux64/chrome',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process',
            '--no-zygote',
            '--disable-gpu'
        ],
    }
});

client.on('qr', (qr) => {
    console.log('--- QR RECEIVED! ---');
    console.log(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=300x300`);
    console.log('------------------');
});

client.on('ready', () => {
    console.log('✅ BOT IS READY!');

    schedule.scheduleJob('0 0 0 1 0 *', async function(){ 
        console.log('🚀 Sending...');
        try {
            const photo = await MessageMedia.fromUrl('https://files.catbox.moe/ngqrvh.jpg');
            const audio = await MessageMedia.fromUrl('https://files.catbox.moe/g3qj7y.mp3');
            const captionText = `*ලැබුවාවූ 2026 නව වසර ඔබ සැමට සාමය, සතුට සහ සෞභාග්‍යය පිරි සුබ අලුත් අවුරුද්දක් වේවා!* ✨🌸\n\n*Wishing you a Happy New Year 2026 filled with peace, happiness, and prosperity!* 🎆🎊\n\n> ᴘᴏᴡᴇʀᴅ ʙʏ┋© ꜱᴇɴᴜᴢ ⑉〆`;

            if (fs.existsSync('numbers.txt')) {
                const numbers = fs.readFileSync('numbers.txt', 'utf-8').split(/\r?\n/).filter(n => n.trim() !== "");
                for (let num of numbers) {
                    let chatId = num.trim().replace('+', '').replace(/\s/g, '') + "@c.us";
                    await client.sendMessage(chatId, photo, { caption: captionText });
                    await client.sendMessage(chatId, audio, { sendAudioAsVoice: true });
                    console.log(`📩 Sent to ${chatId}`);
                    await new Promise(r => setTimeout(r, 5000)); 
                }
            }
        } catch (error) { console.error(error); }
    });
});

client.initialize();
