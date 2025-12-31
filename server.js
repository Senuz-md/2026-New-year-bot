const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const schedule = require('node-schedule');
const fs = require('fs');

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './sessions' }),
    // RAM එක බේරගන්න මේ කොටස අනිවාර්යයි
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-js/main/dist/wppconnect-wa.js',
    },
    puppeteer: {
        headless: true,
        executablePath: '/app/.chrome-for-testing/chrome-linux64/chrome',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--single-process'
        ],
    }
});

client.on('ready', () => {
    console.log('✅ BOT IS ACTIVE AND READY FOR MIDNIGHT!');
});

// QR එක ආවොත් ලොග් එකේ පෙන්වන්න
client.on('qr', (qr) => {
    console.log('SCAN THIS QUICKLY:');
    console.log(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=300x300`);
});

// මැසේජ් යවන කොටස (රෑ 12:00 ට)
schedule.scheduleJob('0 0 0 1 0 *', async function(){ 
    console.log('🎆 STARTING...');
    try {
        const photo = await MessageMedia.fromUrl('https://files.catbox.moe/ngqrvh.jpg');
        const audio = await MessageMedia.fromUrl('https://files.catbox.moe/g3qj7y.mp3');
        const captionText = `*ලැබුවාවූ 2026 නව වසර ඔබ සැමට සාමය, සතුට සහ සෞභාග්‍යය පිරි සුබ අලුත් අවුරුද්දක් වේවා!* ✨🌸\n\n*Wishing you a Happy New Year 2026 filled with peace, happiness, and prosperity!* 🎆🎊\n\n> ᴘᴏᴡᴇʀᴅ ʙʏ┋© ꜱᴇɴᴜᴢ ⑉〆`;

        if (fs.existsSync('numbers.txt')) {
            const numbers = fs.readFileSync('numbers.txt', 'utf-8').split(/\r?\n/).filter(n => n.trim() !== "");
            for (let num of numbers) {
                let cleanNum = num.trim().replace('+', '').replace(/\s/g, '');
                let chatId = cleanNum + "@c.us";
                await client.sendMessage(chatId, photo, { caption: captionText });
                await client.sendMessage(chatId, audio, { sendAudioAsVoice: true });
                console.log(`✅ Sent to ${cleanNum}`);
                await new Promise(r => setTimeout(r, 4000));
            }
        }
    } catch (err) { console.log(err); }
});

client.initialize();
