const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
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
            '--no-first-run',
            '--no-zygote',
            '--single-process'
        ],
    }
});

// QR එක පැහැදිලිව පෙන්වීමට (Small: false)
client.on('qr', (qr) => {
    console.log('--- පල්ලෙහා QR එක තියෙනවා. ඉක්මනට SCAN කරන්න ---');
    qrcode.generate(qr, {small: false});
});

client.on('ready', () => {
    console.log('✅ WhatsApp Bot එක සම්බන්ධයි! පණිවිඩ යැවීමට සූදානම්...');

    // 2026 ජනවාරි 1 රෑ 12:00 ට (මාසය 0 = ජනවාරි)
    schedule.scheduleJob('0 0 0 1 0 *', async function(){ 
        console.log('🚀 පණිවිඩ යැවීම ආරම්භ කළා...');

        const captionText = `*ලැබුවාවූ 2026 නව වසර ඔබ සැමට සාමය, සතුට සහ සෞභාග්‍යය පිරි සුබ අලුත් අවුරුද්දක් වේවා!* ✨🌸\n\n*Wishing you a Happy New Year 2026 filled with peace, happiness, and prosperity!* 🎆🎊\n\n> ᴘᴏᴡᴇʀᴅ ʙʏ┋© ꜱᴇɴᴜᴢ ⑉〆`;
        
        try {
            const photo = await MessageMedia.fromUrl('https://files.catbox.moe/ngqrvh.jpg');
            const audio = await MessageMedia.fromUrl('https://files.catbox.moe/g3qj7y.mp3');

            // Status Update
            await client.sendMessage('status@broadcast', photo, { caption: captionText });
            console.log('✅ Status Update කළා!');

            // Numbers වලට පණිවිඩ යැවීම
            if (fs.existsSync('numbers.txt')) {
                const data = fs.readFileSync('numbers.txt', 'utf-8');
                const numbers = data.split(/\r?\n/).filter(line => line.trim() !== "");

                for (let num of numbers) {
                    let cleanNum = num.trim().replace('+', '').replace(/\s/g, '');
                    let chatId = cleanNum + "@c.us";
                    
                    try {
                        // Image + English/Sinhala Caption
                        await client.sendMessage(chatId, photo, { caption: captionText });

                        // Voice Note (PTT) - මේකෙන් තමයි නිල් පාට මයික් එක එන්නේ
                        await client.sendMessage(chatId, audio, { sendAudioAsVoice: true });
                        
                        console.log(`📩 ${cleanNum} ට යැවුවා.`);
                        await new Promise(resolve => setTimeout(resolve, 3500));
                    } catch (e) {
                        console.log(`❌ ${num} Error:`, e.message);
                    }
                }
            }
            console.log('✨ වැඩේ සාර්ථකව අවසන් වුණා!');
        } catch (error) {
            console.error('Critical Error:', error);
        }
    });
});

client.initialize();
