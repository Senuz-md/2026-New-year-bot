const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const schedule = require('node-schedule');
const fs = require('fs');

/**
 * ඔයාගේ අංකය මෙතන තියෙනවා
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

// Pairing Code ලබා ගැනීම
client.on('qr', async (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('--- QR RECEIVED. GENERATING PAIRING CODE... ---');
    try {
        const code = await client.getPairingCode(MY_NUMBER);
        console.log('******************************************');
        console.log('✅ YOUR CODE: ' + code);
        console.log('******************************************');
    } catch (err) {
        console.log('Error getting code:', err.message);
    }
});

client.on('ready', () => {
    console.log('✅ WhatsApp Bot is Ready!');

    // 2026 ජනවාරි 1 රෑ 12:00 ට (මාසය 0 = ජනවාරි)
    schedule.scheduleJob('0 0 0 1 0 *', async function(){ 
        console.log('🚀 පණිවිඩ යැවීම ආරම්භ කළා...');

        // 1. ඔයා ඉල්ලපු විදිහටම සිංහල + ඉංග්‍රීසි Caption එක
        const captionText = `*ලැබුවාවූ 2026 නව වසර ඔබ සැමට සාමය, සතුට සහ සෞභාග්‍යය පිරි සුබ අලුත් අවුරුද්දක් වේවා!* ✨🌸\n\n*Wishing you a Happy New Year 2026 filled with peace, happiness, and prosperity!* 🎆🎊\n\n> ᴘᴏᴡᴇʀᴅ ʙʏ┋© ꜱᴇɴᴜᴢ ⑉〆`;
        
        try {
            // 2. Image එක URL එකෙන් ගැනීම
            const photo = await MessageMedia.fromUrl('https://files.catbox.moe/ngqrvh.jpg');
            
            // 3. Audio එක URL එකෙන් ගැනීම
            const audio = await MessageMedia.fromUrl('https://files.catbox.moe/g3qj7y.mp3');

            // --- Status එක Update කිරීම ---
            await client.sendMessage('status@broadcast', photo, { caption: captionText });
            console.log('✅ Status Update කළා!');

            // --- Numbers වලට පණිවිඩ යැවීම ---
            if (fs.existsSync('numbers.txt')) {
                const data = fs.readFileSync('numbers.txt', 'utf-8');
                const numbers = data.split(/\r?\n/).filter(line => line.trim() !== "");

                for (let num of numbers) {
                    let cleanNum = num.trim().replace('+', '').replace(/\s/g, '');
                    let chatId = cleanNum + "@c.us";
                    
                    try {
                        // Image එක සහ Caption එක එකට යැවීම
                        await client.sendMessage(chatId, photo, { caption: captionText });

                        // Voice Note (PTT) එක වෙනම යැවීම
                        await client.sendMessage(chatId, audio, { sendAudioAsVoice: true });
                        
                        console.log(`📩 ${cleanNum} ට පණිවිඩ සහ Voice Note යැවුවා.`);
                        
                        // Delay එකක් තැබීම
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
