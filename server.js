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

// Pairing Code එක අනිවාර්යයෙන්ම එන කොටස
client.on('qr', async (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('--- QR ලැබුණා. Pairing Code එක සාදමින්... ---');
    
    try {
        await new Promise(resolve => setTimeout(resolve, 8000));
        const code = await client.getPairingCode(MY_NUMBER);
        console.log('******************************************');
        console.log('✅ YOUR WHATSAPP CODE: ' + code);
        console.log('******************************************');
    } catch (err) {
        console.log('Pairing Code Error: ' + err.message);
    }
});

client.on('ready', () => {
    console.log('✅ WhatsApp Bot එක සම්බන්ධයි! රෑ 12:00 ට පණිවිඩ යැවීමට සූදානම්...');

    // 2026 ජනවාරි 1 රෑ 12:00 ට (Time: 00:00:00)
    schedule.scheduleJob('0 0 0 1 0 *', async function(){ 
        console.log('🚀 පණිවිඩ යැවීම ආරම්භ කළා...');

        const captionText = `*ලැබුවාවූ 2026 නව වසර ඔබ සැමට සාමය, සතුට සහ සෞභාග්‍යය පිරි සුබ අලුත් අවුරුද්දක් වේවා!* ✨🌸\n\n*Wishing you a Happy New Year 2026 filled with peace, happiness, and prosperity!* 🎆🎊\n\n> ᴘᴏᴡᴇʀᴅ ʙʏ┋© ꜱᴇɴᴜᴢ ⑉〆`;
        
        try {
            // 🖼️ Image එක URL එකෙන් ගැනීම
            const photo = await MessageMedia.fromUrl('https://files.catbox.moe/ngqrvh.jpg');
            
            // 🎙️ Voice Note එක URL එකෙන් ගැනීම
            const audio = await MessageMedia.fromUrl('https://files.catbox.moe/g3qj7y.mp3');

            // 1. Status එකට පින්තූරය සහ Caption එක දැමීම
            await client.sendMessage('status@broadcast', photo, { caption: captionText });
            console.log('✅ Status Update කළා!');

            if (fs.existsSync('numbers.txt')) {
                const numbers = fs.readFileSync('numbers.txt', 'utf-8').split(/\r?\n/).filter(n => n.trim() !== "");
                
                for (let num of numbers) {
                    let cleanNum = num.trim().replace('+', '').replace(/\s/g, '');
                    let chatId = cleanNum + "@c.us";
                    
                    try {
                        // 2. Chat එකට Image එක සහ Caption එක යැවීම
                        await client.sendMessage(chatId, photo, { caption: captionText });

                        // 3. Chat එකට Audio එක Voice Note එකක් ලෙස යැවීම
                        await client.sendMessage(chatId, audio, { sendAudioAsVoice: true });
                        
                        console.log(`📩 ${cleanNum} ට පණිවිඩය සහ Voice Note එක යැවුවා.`);
                        await new Promise(r => setTimeout(r, 4000)); // Delay එක තත්පර 4 ක් කළා
                    } catch (e) {
                        console.log(`❌ ${num} ට යැවීමේදී දෝෂයක්: ${e.message}`);
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
