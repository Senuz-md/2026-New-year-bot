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
            '--disable-gpu',
            '--mute-audio',
            '--no-first-run'
        ]
    }
});

client.on('ready', () => {
    console.log('✅ BOT IS READY (Light Mode - No Status)');

    // 2026 ජනවාරි 1 රෑ 12:00 ට
    schedule.scheduleJob('0 0 0 1 0 *', async function(){ 
        console.log('🚀 Sending New Year Wishes to 25 Numbers...');
        
        try {
            const photo = await MessageMedia.fromUrl('https://files.catbox.moe/ngqrvh.jpg');
            const audio = await MessageMedia.fromUrl('https://files.catbox.moe/g3qj7y.mp3');
            const captionText = `*ලැබුවාවූ 2026 නව වසර ඔබ සැමට සාමය, සතුට සහ සෞභාග්‍යය පිරි සුබ අලුත් අවුරුද්දක් වේවා!* ✨🌸\n\n*Wishing you a Happy New Year 2026 filled with peace, happiness, and prosperity!* 🎆🎊\n\n> ᴘᴏᴡᴇʀᴅ ʙʏ┋© ꜱᴇɴᴜᴢ ⑉〆`;

            if (fs.existsSync('numbers.txt')) {
                const numbers = fs.readFileSync('numbers.txt', 'utf-8').split(/\r?\n/).filter(n => n.trim() !== "");
                
                for (let num of numbers) {
                    let chatId = num.trim().replace('+', '').replace(/\s/g, '') + "@c.us";
                    try {
                        // Image + Caption
                        await client.sendMessage(chatId, photo, { caption: captionText });
                        // Voice Note (PTT)
                        await client.sendMessage(chatId, audio, { sendAudioAsVoice: true });
                        
                        console.log(`📩 Sent to ${chatId}`);
                        // RAM එක බේරගන්න සහ Ban නොවී ඉන්න තත්පර 5ක විවේකයක්
                        await new Promise(r => setTimeout(r, 5000)); 
                    } catch (e) { console.log(`Error: ${e.message}`); }
                }
            }
            console.log('✨ DONE! All messages sent.');
        } catch (error) { console.error('CRITICAL ERROR:', error); }
    });
});

client.initialize();
