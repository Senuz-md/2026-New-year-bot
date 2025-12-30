const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const schedule = require('node-schedule');
const fs = require('fs');

/**
 * 1. මෙතන ඔයාගේ WhatsApp අංකය නිවැරදිව තියෙනවා නේද කියලා බලන්න.
 */
const MY_NUMBER = '94782932976'; 

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './sessions'
    }),
    puppeteer: {
        headless: true,
        // Heroku Buildpack එකට ගැලපෙන Path එක
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

// Pairing Code එක ලබා ගැනීම
client.on('qr', async (qr) => {
    qrcode.generate(qr, {small: true});
    
    // මචං ලොග් එකේ මේ පේළිය පේනවා නම් විතරක් කෝඩ් එක ගනින්
    console.log('--- PAIRING CODE GENERATING... ---');
    
    try {
        // සමහර වෙලාවට Library එක Load වෙන්න තත්පර කිහිපයක් යනවා
        setTimeout(async () => {
            try {
                const pairingCode = await client.getPairingCode(MY_NUMBER);
                console.log('******************************************');
                console.log('✅ YOUR CODE: ' + pairingCode);
                console.log('******************************************');
            } catch (e) {
                console.log('Pairing Code එක ගන්න බැරි වුණා, QR එක Scan කරන්න.');
            }
        }, 5000);
    } catch (err) {
        console.error('QR Error:', err);
    }
});

client.on('ready', () => {
    console.log('✅ WhatsApp සම්බන්ධ විය! රෑ 12:00 ට පණිවිඩ යැවීමට සූදානම්...');

    // ලංකාවේ වෙලාවෙන් 2026 ජනවාරි 1 වනදා 00:00:00
    // (මාසය 0 = ජනවාරි)
    schedule.scheduleJob('0 0 0 1 0 *', async function(){ 
        console.log('🚀 සුබ අලුත් අවුරුද්දක්! පණිවිඩ යැවීම ආරම්භ කළා...');

        const captionText = `*ලැබුවාවූ 2026 නව වසර ඔබ සැමට සාමය, සතුට සහ සෞභාග්‍යය පිරි සුබ අලුත් අවුරුද්දක් වේවා!* ✨🌸\n\n*Wishing you a Happy New Year 2026 filled with peace, happiness, and prosperity!* 🎆🎊\n\n> ᴘᴏᴡᴇʀᴅ ʙʏ┋© ꜱᴇɴᴜᴢ ⑉〆`;
        
        try {
            // URL එකෙන් Media ලබා ගැනීම
            const photo = await MessageMedia.fromUrl('https://files.catbox.moe/ngqrvh.jpg');
            const audio = await MessageMedia.fromUrl('https://files.catbox.moe/g3qj7y.mp3');

            // 1. Status Update එක (පින්තූරය + Caption)
            await client.sendMessage('status@broadcast', photo, { caption: captionText });
            console.log('✅ Status Update කළා!');

            // 2. numbers.txt එකේ ඇති අංක වලට යැවීම
            if (fs.existsSync('numbers.txt')) {
                const data = fs.readFileSync('numbers.txt', 'utf-8');
                const numbers = data.split(/\r?\n/).filter(line => line.trim() !== "");

                for (let num of numbers) {
                    // අංකයේ + ලකුණ තිබේ නම් ඉවත් කර chatId සාදා ගැනීම
                    let cleanNum = num.trim().replace('+', '').replace(/\s/g, '');
                    let chatId = cleanNum + "@c.us";
                    
                    try {
                        // පින්තූරය සහ Caption එක යැවීම
                        await client.sendMessage(chatId, photo, { caption: captionText });

                        // 🔴 Voice Note එකක් (PTT) ලෙස යැවීම
                        await client.sendMessage(chatId, audio, { sendAudioAsVoice: true });
                        
                        console.log(`📩 ${cleanNum} අංකයට සාර්ථකව යැවුවා.`);
                        
                        // WhatsApp Block නොවීමට තත්පර 3 ක Delay එකක්
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    } catch (e) {
                        console.log(`❌ ${num} යැවීමේදී දෝෂයක්:`, e.message);
                    }
                }
            }
            console.log('✨ වැඩේ ඉවරයි!');
        } catch (error) {
            console.error('CRITICAL ERROR:', error);
        }
    });
});

client.initialize().catch(err => console.error('Init error:', err));
