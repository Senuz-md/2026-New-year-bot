const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const schedule = require('node-schedule');
const fs = require('fs');

// --- ඔයාගේ අංකය මෙතන තියෙනවා ---
const MY_NUMBER = '94782932976'; 

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './sessions'
    }),
    puppeteer: {
        headless: true,
        executablePath: '/app/.chrome-for-testing/chrome-linux64/chrome',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
    }
});

// Pairing Code ලබාගැනීමේ නිවැරදි Logic එක
let pairingCodeRequested = false;

client.on('qr', async (qr) => {
    // QR එක පෙන්වීම (බැරි වෙලාවත් Code එක ආවේ නැතිනම් Scan කරන්න)
    qrcode.generate(qr, {small: true});
    console.log('--- QR ලැබුණා. Pairing Code එක සාදමින්... ---');

    if (!pairingCodeRequested) {
        pairingCodeRequested = true;
        try {
            // තත්පර 5ක් ඇතුළත කෝඩ් එක ජෙනරේට් කරයි
            setTimeout(async () => {
                try {
                    const code = await client.getPairingCode(MY_NUMBER);
                    console.log('==========================================');
                    console.log('✅ YOUR WHATSAPP CODE: ' + code);
                    console.log('==========================================');
                } catch (err) {
                    console.log('Pairing Code Error: ', err.message);
                }
            }, 5000);
        } catch (e) {
            console.log('Code generation failed.');
        }
    }
});

client.on('ready', () => {
    console.log('✅ WhatsApp සම්බන්ධ විය! පණිවිඩ යැවීමට සූදානම්...');

    // 2026 ජනවාරි 1 රෑ 12:00 (මාසය 0 = ජනවාරි)
    schedule.scheduleJob('0 0 0 1 0 *', async function(){ 
        console.log('🚀 පණිවිඩ යැවීම ආරම්භ කළා...');

        const captionText = `*ලැබුවාවූ 2026 නව වසර ඔබ සැමට සාමය, සතුට සහ සෞභාග්‍යය පිරි සුබ අලුත් අවුරුද්දක් වේවා!* ✨🌸\n\n*Wishing you a Happy New Year 2026 filled with peace, happiness, and prosperity!* 🎆🎊\n\n> ᴘᴏᴡᴇʀᴅ ʙʏ┋© ꜱᴇɴᴜᴢ ⑉〆`;
        
        try {
            const photo = await MessageMedia.fromUrl('https://files.catbox.moe/ngqrvh.jpg');
            const audio = await MessageMedia.fromUrl('https://files.catbox.moe/g3qj7y.mp3');

            // 1. Status Update
            await client.sendMessage('status@broadcast', photo, { caption: captionText });
            console.log('✅ Status Update කළා!');

            // 2. Numbers වලට පණිවිඩ යැවීම
            if (fs.existsSync('numbers.txt')) {
                const data = fs.readFileSync('numbers.txt', 'utf-8');
                const numbers = data.split(/\r?\n/).filter(line => line.trim() !== "");

                for (let num of numbers) {
                    let cleanNum = num.trim().replace('+', '').replace(/\s/g, '');
                    let chatId = cleanNum + "@c.us";
                    
                    try {
                        // පින්තූරය + Caption
                        await client.sendMessage(chatId, photo, { caption: captionText });

                        // Voice Note එකක් (PTT) ලෙස
                        await client.sendMessage(chatId, audio, { sendAudioAsVoice: true });
                        
                        console.log(`📩 ${cleanNum} ට යැවුවා.`);
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    } catch (e) {
                        console.log(`❌ ${num} error:`, e.message);
                    }
                }
            }
            console.log('✨ වැඩේ ඉවරයි!');
        } catch (error) {
            console.error('Critical Error:', error);
        }
    });
});

client.initialize().catch(err => console.error('Init error:', err));
