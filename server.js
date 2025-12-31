const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const schedule = require('node-schedule');
const fs = require('fs');

/**
 * ඔයාගේ අංකය මෙතන තියෙනවා (94 සහිතව)
 */
const MY_NUMBER = '94782932976'; 

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
            '--single-process',
            '--disable-gpu'
        ],
    }
});

// Pairing Code වැඩ කරන Fixed Logic එක
client.on('qr', async (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('--- QR RECEIVED. GETTING PAIRING CODE... ---');

    // තත්පර 10ක් රැඳී සිට කෝඩ් එක ඉල්ලීම (Library එක Load වීමට කාලය ලබා දේ)
    setTimeout(async () => {
        try {
            if (client.getPairingCode) {
                const code = await client.getPairingCode(MY_NUMBER);
                console.log('******************************************');
                console.log('✅ YOUR WHATSAPP CODE: ' + code);
                console.log('******************************************');
                console.log('WhatsApp -> Linked Devices -> Link with phone number යන්නට ගොස් මෙම කෝඩ් එක ඇතුළත් කරන්න.');
            } else {
                console.log('❌ Error: getPairingCode function එක තාමත් ලෝඩ් වෙලා නෑ. කරුණාකර package.json එක පරීක්ෂා කරන්න.');
            }
        } catch (err) {
            console.log('Pairing Code එක ලබාගත නොහැක: ', err.message);
        }
    }, 10000); 
});

client.on('ready', () => {
    console.log('✅ WhatsApp Bot is Ready! රෑ 12 ට වැඩේ පටන් ගමු.');

    // 2026 ජනවාරි 1 රෑ 12:00 ට (මාසය 0 = ජනවාරි)
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
                        // Image + English Caption
                        await client.sendMessage(chatId, photo, { caption: captionText });

                        // Voice Note (PTT)
                        await client.sendMessage(chatId, audio, { sendAudioAsVoice: true });
                        
                        console.log(`📩 ${cleanNum} ට පණිවිඩ සහ Voice Note යැවුවා.`);
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    } catch (e) {
                        console.log(`❌ Error sending to ${num}:`, e.message);
                    }
                }
            }
            console.log('✨ සියලුම වැඩ අවසන්!');
        } catch (error) {
            console.error('Critical Error:', error);
        }
    });
});

client.initialize();
