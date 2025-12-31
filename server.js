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
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // RAM එක බේරා ගැනීමට අත්‍යවශ්‍යයි
            '--disable-gpu'
        ],
    }
});

// QR එක Link එකක් විදිහට (Expired නොවී ඉක්මනින් ගන්න)
client.on('qr', (qr) => {
    console.log('--- NEW QR RECEIVED! ---');
    console.log('පහත ලින්ක් එක Browser එකේ Open කරලා ඉක්මනට Scan කරන්න:');
    console.log(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=300x300`);
    console.log('------------------');
});

client.on('ready', () => {
    console.log('✅ BOT IS READY AND CONNECTED!');

    // 2026 ජනවාරි 1 රෑ 12:00 ට
    schedule.scheduleJob('0 0 0 1 0 *', async function(){ 
        console.log('🚀 පණිවිඩ යැවීම ආරම්භ කළා...');

        const captionText = `*ලැබුවාවූ 2026 නව වසර ඔබ සැමට සාමය, සතුට සහ සෞභාග්‍යය පිරි සුබ අලුත් අවුරුද්දක් වේවා!* ✨🌸\n\n*Wishing you a Happy New Year 2026 filled with peace, happiness, and prosperity!* 🎆🎊\n\n> ᴘᴏᴡᴇʀᴅ ʙʏ┋© ꜱᴇɴᴜᴢ ⑉〆`;
        
        try {
            // මෙතන තමයි Media ලින්ක් තියෙන්නේ
            const photo = await MessageMedia.fromUrl('https://files.catbox.moe/ngqrvh.jpg');
            const audio = await MessageMedia.fromUrl('https://files.catbox.moe/g3qj7y.mp3');

            // 1. Status එකට Image + Caption යැවීම
            await client.sendMessage('status@broadcast', photo, { caption: captionText });

            if (fs.existsSync('numbers.txt')) {
                const numbers = fs.readFileSync('numbers.txt', 'utf-8').split(/\r?\n/).filter(n => n.trim() !== "");
                
                for (let num of numbers) {
                    let chatId = num.trim().replace('+', '').replace(/\s/g, '') + "@c.us";
                    try {
                        // 2. Chat එකට Image + Caption යැවීම
                        await client.sendMessage(chatId, photo, { caption: captionText });

                        // 3. Chat එකට VOICE NOTE (PTT) එකක් විදිහට යැවීම
                        // මේ { sendAudioAsVoice: true } කෑල්ල නිසා තමයි ඒක Voice Note එකක් වෙන්නේ
                        await client.sendMessage(chatId, audio, { sendAudioAsVoice: true });
                        
                        console.log(`📩 Sent to ${num}`);
                        
                        // RAM එකට සහ WhatsApp Ban නොවී ඉන්න තත්පර 4ක විවේකයක්
                        await new Promise(r => setTimeout(r, 4000));
                    } catch (e) {
                        console.log(`❌ Error with ${num}: ${e.message}`);
                    }
                }
            }
            console.log('✨ වැඩේ සාර්ථකව අවසන්!');
        } catch (error) {
            console.error('CRITICAL ERROR:', error);
        }
    });
});

client.initialize();
