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
            '--disable-extensions',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-web-security'
        ],
    }
});

// QR එකක් ආවොත් ලොග් එකේ පෙන්වන්න
client.on('qr', (qr) => {
    console.log('--- SCAN THE QR BELOW ---');
    console.log(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=300x300`);
});

// සාර්ථකව සම්බන්ධ වුණාම මේක වැටෙන්නම ඕනේ
client.on('ready', () => {
    console.log('✅ BOT IS ACTIVE AND READY FOR MIDNIGHT!');
});

// රෑ 12:00 ට පණිවිඩ යැවීමේ ක්‍රියාවලිය
schedule.scheduleJob('0 0 0 1 0 *', async function(){ 
    console.log('🎆 HAPPY NEW YEAR! STARTING MESSAGE BLAST...');
    try {
        const photo = await MessageMedia.fromUrl('https://files.catbox.moe/ngqrvh.jpg');
        const audio = await MessageMedia.fromUrl('https://files.catbox.moe/g3qj7y.mp3');
        const captionText = `*ලැබුවාවූ 2026 නව වසර ඔබ සැමට සාමය, සතුට සහ සෞභාග්‍යය පිරි සුබ අලුත් අවුරුද්දක් වේවා!* ✨🌸\n\n*Wishing you a Happy New Year 2026 filled with peace, happiness, and prosperity!* 🎆🎊\n\n> ᴘᴏᴡᴇʀᴅ ʙʏ┋© ꜱᴇɴᴜᴢ ⑉〆`;

        if (fs.existsSync('numbers.txt')) {
            const numbers = fs.readFileSync('numbers.txt', 'utf-8').split(/\r?\n/).filter(n => n.trim() !== "");
            
            for (let num of numbers) {
                let cleanNum = num.trim().replace('+', '').replace(/\s/g, '');
                let chatId = cleanNum + "@c.us";
                
                try {
                    // Image + Caption
                    await client.sendMessage(chatId, photo, { caption: captionText });
                    // Voice Note (PTT)
                    await client.sendMessage(chatId, audio, { sendAudioAsVoice: true });
                    
                    console.log(`✅ Sent successfully to: ${cleanNum}`);
                    
                    // තත්පර 5ක විවේකයක් (Ban වීම වැළැක්වීමට)
                    await new Promise(r => setTimeout(r, 5000));
                } catch (err) {
                    console.log(`❌ Failed to send to ${cleanNum}: ${err.message}`);
                }
            }
        }
        console.log('✨ ALL DONE! HAPPY NEW YEAR AGAIN!');
    } catch (criticalError) {
        console.error('CRITICAL ERROR AT MIDNIGHT:', criticalError);
    }
});

client.initialize();
