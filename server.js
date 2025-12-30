const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const schedule = require('node-schedule');
const fs = require('fs');

/**
 * වැදගත්: 
 * 1. මෙතන '94XXXXXXXXX' වෙනුවට ඔයාගේ WhatsApp අංකය 94 සහිතව ඇතුළත් කරන්න. 
 */
const MY_NUMBER = '94782932976'; 

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './sessions'
    }),
    puppeteer: {
        headless: true,
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

// Pairing Code එක ලබා ගැනීම
client.on('qr', async (qr) => {
    qrcode.generate(qr, {small: true});
    try {
        console.log('Pairing Code එක ලබා ගනිමින් පවතියි...');
        const pairingCode = await client.getPairingCode(MY_NUMBER);
        console.log('------------------------------------------');
        console.log('ඔබේ Pairing Code එක: ', pairingCode);
        console.log('------------------------------------------');
    } catch (err) {
        console.error('Pairing Code error:', err);
    }
});

client.on('ready', () => {
    console.log('WhatsApp සම්බන්ධ විය! රෑ 12:00 ට පණිවිඩ යැවීමට සූදානම්...');

    schedule.scheduleJob('0 0 0 1 0 *', async function(){ 
        console.log('සුබ අලුත් අවුරුද්දක්! පණිවිඩ යැවීම ආරම්භ කළා...');

        const caption = `*ලැබුවාවූ 2026 නව වසර ඔබ සැමට සාමය, සතුට සහ සෞභාග්‍යය පිරි සුබ අලුත් අවුරුද්දක් වේවා!* ✨🌸\n\n*Wishing you a Happy New Year 2026 filled with peace, happiness, and prosperity!* 🎆🎊\n\n> ᴘᴏᴡᴇʀᴅ ʙʏ┋© ꜱᴇɴᴜᴢ ⑉〆`;
        
        try {
            const photo = await MessageMedia.fromUrl('https://files.catbox.moe/ngqrvh.jpg');
            const audio = await MessageMedia.fromUrl('https://files.catbox.moe/g3qj7y.mp3');

            // 1. Status Update
            await client.sendMessage('status@broadcast', photo, { caption: caption });
            console.log('Status Update කළා!');

            // 2. Numbers වලට පණිවිඩ යැවීම
            if (fs.existsSync('numbers.txt')) {
                const data = fs.readFileSync('numbers.txt', 'utf-8');
                const numbers = data.split(/\r?\n/).filter(line => line.trim() !== "");

                for (let num of numbers) {
                    let chatId = num.trim() + "@c.us";
                    try {
                        // ෆොටෝ එක සහ කැප්ෂන් එක යැවීම
                        await client.sendMessage(chatId, photo, { caption: caption });
                        
                        // ඕඩියෝ එක VOICE NOTE එකක් විදිහට යැවීම (sendAudioAsVoice: true)
                        await client.sendMessage(chatId, audio, { sendAudioAsVoice: true });
                        
                        console.log(`${num} අංකයට පණිවිඩය සහ Voice Note එක යැව්වා.`);
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    } catch (e) {
                        console.log(`${num} error:`, e.message);
                    }
                }
            }
            console.log('සියලුම වැඩ අවසන්!');
        } catch (error) {
            console.error('Error:', error);
        }
    });
});

client.initialize();
