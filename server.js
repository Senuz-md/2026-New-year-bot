const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const schedule = require('node-schedule');
const fs = require('fs');

// WhatsApp Client එක සකස් කිරීම
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './sessions'
    }),
    puppeteer: {
        headless: true,
        // Heroku පරිසරය තුළ Google Chrome සොයා ගැනීමට මෙම path එක අත්‍යවශ්‍ය වේ
        executablePath: '/usr/bin/google-chrome-stable',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
    }
});

// QR Code එක Terminal (Logs) වල පෙන්වීම
client.on('qr', (qr) => {
    console.log('--- කරුණාකර පහත QR CODE එක SCAN කරන්න ---');
    qrcode.generate(qr, {small: true});
});

// සම්බන්ධ වූ පසු ලැබෙන පණිවිඩය
client.on('ready', () => {
    console.log('WhatsApp සම්බන්ධ විය! රෑ 12:00 ට පණිවිඩ යැවීමට සූදානම්...');

    // ලංකාවේ වෙලාවෙන් 2026 ජනවාරි 1 වනදා 00:00:00 (රෑ 12:00)
    // වැදගත්: Heroku Config Vars වල TZ = Asia/Colombo තිබිය යුතුය
    const job = schedule.scheduleJob('0 0 0 1 0 *', async function(){ 
        console.log('සුබ අලුත් අවුරුද්දක්! පණිවිඩ යැවීම ආරම්භ කළා...');

        const caption = `*ලැබුවාවූ 2026 නව වසර ඔබ සැමට සාමය, සතුට සහ සෞභාග්‍යය පිරි සුබ අලුත් අවුරුද්දක් වේවා! ✨🌸*\n\nWishing you a Happy New Year 2026 filled with peace, happiness, and prosperity! 🎆🎊\n\n> ᴘᴏᴡᴇʀᴅ ʙʏ┋© ꜱᴇɴᴜᴢ ⑉〆`;
        
        try {
            const photo = await MessageMedia.fromUrl('https://files.catbox.moe/ngqrvh.jpg');
            const audio = await MessageMedia.fromUrl('https://files.catbox.moe/g3qj7y.mp3');

            // 1. WhatsApp Status එක දැමීම
            await client.sendMessage('status@broadcast', photo, { caption: caption });
            console.log('Status එක සාර්ථකව Update කළා!');

            // 2. numbers.txt එකෙන් අංක කියවා පණිවිඩ යැවීම
            if (fs.existsSync('numbers.txt')) {
                const data = fs.readFileSync('numbers.txt', 'utf-8');
                const numbers = data.split(/\r?\n/).filter(line => line.trim() !== "");

                for (let num of numbers) {
                    let chatId = num.trim() + "@c.us";
                    try {
                        await client.sendMessage(chatId, photo, { caption: caption });
                        await client.sendMessage(chatId, audio, { sendAudioAsVoice: true });
                        console.log(`${num} අංකයට පණිවිඩය යැව්වා.`);
                        
                        // WhatsApp Block වීම වැළැක්වීමට තත්පර 3ක විරාමයක්
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    } catch (e) {
                        console.log(`${num} අංකයට යැවීමේදී දෝෂයක්:`, e.message);
                    }
                }
            } else {
                console.log('numbers.txt ගොනුව සොයාගත නොහැක! පණිවිඩ යැවීම නැවතුනි.');
            }
            
            console.log('සියලුම සුබපැතුම් යවා අවසන්!');

        } catch (error) {
            console.error('වැඩේ කරද්දී දෝෂයක් වුණා:', error);
        }
    });
});

// Client ආරම්භ කිරීම සහ Error handling
client.initialize().catch(err => {
    console.error('Bot එක ආරම්භ කිරීමේදී දෝෂයක්:', err);
});
