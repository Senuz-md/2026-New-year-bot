const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const schedule = require('node-schedule');
const fs = require('fs');

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './sessions' }),
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
    console.log('--- NEW QR RECEIVED ---');
    console.log(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=300x300`);
});

client.on('ready', () => {
    console.log('✅ BOT IS ACTIVE AND READY FOR MIDNIGHT!');
});

// හරියටම රෑ 12:00:00 ට (Jan 1, 2026)
schedule.scheduleJob('0 0 0 1 0 *', async function(){ 
    console.log('🎆 STARTING NEW YEAR MESSAGE BLAST...');
    try {
        const photo = await MessageMedia.fromUrl('https://files.catbox.moe/ngqrvh.jpg');
        const audio = await MessageMedia.fromUrl('https://files.catbox.moe/g3qj7y.mp3');
        const captionText = `*ලැබුවාවූ 2026 නව වසර ඔබ සැමට සාමය, සතුට සහ සෞභාග්‍යය පිරි සුබ අලුත් අවුරුද්දක් වේවා!* ✨🌸\n\n*Wishing you a Happy New Year 2026 filled with peace, happiness, and prosperity!* 🎆🎊\n\n> ᴘᴏᴡᴇʀᴅ ʙʏ┋© ꜱᴇɴᴜᴢ ⑉〆`;

        if (fs.existsSync('numbers.txt')) {
            const numbers = fs.readFileSync('numbers.txt', 'utf-8').split(/\r?\n/).filter(n => n.trim() !== "");
            for (let num of numbers) {
                let chatId = num.trim().replace('+', '').replace(/\s/g, '') + "@c.us";
                try {
                    // 1. පින්තූරය සහ Caption එක යවනවා
                    await client.sendMessage(chatId, photo, { caption: captionText });
                    
                    // 2. Audio එක VOICE NOTE (PTT) එකක් විදිහට යවනවා
                    await client.sendMessage(chatId, audio, { sendAudioAsVoice: true });
                    
                    console.log(`✅ Message & Voice Note sent to: ${num}`);
                    
                    // තත්පර 5ක විවේකයක් (Ban නොවී ඉන්න)
                    await new Promise(r => setTimeout(r, 5000)); 
                } catch (e) { console.log(`Error sending to ${num}: ${e.message}`); }
            }
        }
    } catch (error) { console.error('CRITICAL ERROR:', error); }
});

client.initialize();
