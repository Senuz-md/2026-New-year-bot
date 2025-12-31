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
            '--single-process', // RAM ඉතිරි කිරීමට
            '--no-zygote',
            '--no-first-run'
        ],
    }
});

// QR එක ලොග් එකට ගන්නේ නැහැ RAM බේරගන්න
client.on('qr', (qr) => {
    console.log('--- QR ලැබුණා (පරණ Session එක වැඩ නැත්නම් විතරක් ලින්ක් එකෙන් බලන්න) ---');
    console.log(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=300x300`);
});

client.on('ready', () => {
    console.log('✅ BOT IS LIVE! රෑ 12:00 ට පණිවිඩ යැවීමට සූදානම්...');

    schedule.scheduleJob('0 0 0 1 0 *', async function(){ 
        console.log('🚀 පණිවිඩ යැවීම ඇරඹුවා...');

        const captionText = `*ලැබුවාවූ 2026 නව වසර ඔබ සැමට සාමය, සතුට සහ සෞභාග්‍යය පිරි සුබ අලුත් අවුරුද්දක් වේවා!* ✨🌸\n\n*Wishing you a Happy New Year 2026 filled with peace, happiness, and prosperity!* 🎆🎊\n\n> ᴘᴏᴡᴇʀᴅ ʙʏ┋© ꜱᴇɴᴜᴢ ⑉〆`;
        
        try {
            const photo = await MessageMedia.fromUrl('https://files.catbox.moe/ngqrvh.jpg');
            const audio = await MessageMedia.fromUrl('https://files.catbox.moe/g3qj7y.mp3');

            // Status Update
            await client.sendMessage('status@broadcast', photo, { caption: captionText });

            if (fs.existsSync('numbers.txt')) {
                const numbers = fs.readFileSync('numbers.txt', 'utf-8').split(/\r?\n/).filter(n => n.trim() !== "");
                for (let num of numbers) {
                    let chatId = num.trim().replace('+', '').replace(/\s/g, '') + "@c.us";
                    try {
                        // Image + Caption
                        await client.sendMessage(chatId, photo, { caption: captionText });
                        // Voice Note (PTT) - මේක තමයි මචං ෂුවර්ම ක්‍රමය
                        await client.sendMessage(chatId, audio, { sendAudioAsVoice: true });
                        
                        console.log(`📩 Sent to ${num}`);
                        await new Promise(r => setTimeout(r, 5000)); // විවේකයක්
                    } catch (e) { console.log(`Error: ${e.message}`); }
                }
            }
            console.log('✨ වැඩේ ඉවරයි!');
        } catch (error) { console.error('Error:', error); }
    });
});

client.initialize();
