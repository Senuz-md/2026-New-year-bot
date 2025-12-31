const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const schedule = require('node-schedule');
const fs = require('fs');

const MY_NUMBER = '94782932976'; 

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './sessions' }),
    puppeteer: {
        headless: true,
        executablePath: '/app/.chrome-for-testing/chrome-linux64/chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

// Pairing Code එක අනිවාර්යයෙන්ම ලබා ගැනීම
client.on('qr', async (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('--- QR RECEIVED. GETTING PAIRING CODE... ---');
    
    // වැදගත්: Library එක load වෙනකම් තත්පර 10ක් ඉමු
    setTimeout(async () => {
        try {
            // මෙතන pairing code එක ඉල්ලනවා
            const code = await client.getPairingCode(MY_NUMBER);
            console.log('******************************************');
            console.log('✅ YOUR CODE: ' + code);
            console.log('******************************************');
        } catch (err) {
            console.log('Pairing Code එක ගන්න බැරි වුණා. QR එක Scan කරන්න.');
        }
    }, 10000);
});

client.on('ready', () => {
    console.log('✅ WhatsApp Bot එක Ready! රෑ 12 ට වැඩේ වෙයි.');

    // 2026 ජනවාරි 1 රෑ 12:00 ට
    schedule.scheduleJob('0 0 0 1 0 *', async function(){ 
        console.log('🚀 පණිවිඩ යැවීම ආරම්භ කළා...');

        const captionText = `*ලැබුවාවූ 2026 නව වසර ඔබ සැමට සාමය, සතුට සහ සෞභාග්‍යය පිරි සුබ අලුත් අවුරුද්දක් වේවා!* ✨🌸\n\n*Wishing you a Happy New Year 2026 filled with peace, happiness, and prosperity!* 🎆🎊\n\n> ᴘᴏᴡᴇʀᴅ ʙʏ┋© ꜱᴇɴᴜᴢ ⑉〆`;
        
        try {
            const photo = await MessageMedia.fromUrl('https://files.catbox.moe/ngqrvh.jpg');
            const audio = await MessageMedia.fromUrl('https://files.catbox.moe/g3qj7y.mp3');

            // Status එකට දැමීම
            await client.sendMessage('status@broadcast', photo, { caption: captionText });

            if (fs.existsSync('numbers.txt')) {
                const numbers = fs.readFileSync('numbers.txt', 'utf-8').split(/\r?\n/).filter(n => n.trim() !== "");
                for (let num of numbers) {
                    let chatId = num.trim().replace('+', '') + "@c.us";
                    try {
                        // පින්තූරය + Caption
                        await client.sendMessage(chatId, photo, { caption: captionText });
                        // Voice Note එක PTT ලෙස
                        await client.sendMessage(chatId, audio, { sendAudioAsVoice: true });
                        
                        console.log(`📩 Sent to ${num}`);
                        await new Promise(r => setTimeout(r, 4000));
                    } catch (e) { console.log(`Error sending to ${num}`); }
                }
            }
        } catch (error) { console.error(error); }
    });
});

client.initialize();
