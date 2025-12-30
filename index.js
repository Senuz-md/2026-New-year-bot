const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const schedule = require('node-schedule');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ],
    }
});

client.on('qr', (qr) => {
    console.log('--- QR CODE එක Scan කරන්න ---');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('WhatsApp සම්බන්ධ විය! රෑ 12 වෙනකම් Script එක Run වෙමින් පවතියි...');

    // ලංකාවේ වෙලාවෙන් 2026 ජනවාරි 1 වනදා 00:00:00 (රෑ 12:00)
    // Format: Second, Minute, Hour, Day of Month, Month, Day of Week
    const job = schedule.scheduleJob('0 0 0 1 0 *', async function(){ 
        console.log('සුබ අලුත් අවුරුද්දක්! පණිවිඩ යැවීම ආරම්භ කළා...');

        const caption = `ලැබුවාවූ 2026 නව වසර ඔබ සැමට සාමය, සතුට සහ සෞභාග්‍යය පිරි සුබ අලුත් අවුරුද්දක් වේවා! ✨🌸\n\nWishing you a Happy New Year 2026 filled with peace, happiness, and prosperity! 🎆🎊\n\n> ᴘᴏᴡᴇʀᴅ ʙʏ┋© ꜱᴇɴᴜᴢ ⑉〆`;
        
        try {
            const photo = await MessageMedia.fromUrl('https://files.catbox.moe/ngqrvh.jpg');
            const audio = await MessageMedia.fromUrl('https://files.catbox.moe/g3qj7y.mp3');

            // 1. WhatsApp Status එක දැමීම
            await client.sendMessage('status@broadcast', photo, { caption: caption });
            console.log('Status එක Update කළා!');

            // 2. Contacts වලට යැවීම
            // පහත List එකට ඔයාගේ අංක ටික 947XXXXXXXX@c.us විදිහට ඇතුළත් කරන්න
            const myContacts = [
                '947XXXXXXXX@c.us', 
                '947YYYYYYYY@c.us'
            ];

            for (const contact of myContacts) {
                await client.sendMessage(contact, photo, { caption: caption });
                await client.sendMessage(contact, audio, { sendAudioAsVoice: true });
                console.log(`${contact} ට යැව්වා.`);
            }
            
            console.log('සියලුම සුබපැතුම් යවා අවසන්!');

        } catch (error) {
            console.error('වැඩේ කරද්දී පොඩි අවුලක් වුණා:', error);
        }
    });
});

client.initialize();
