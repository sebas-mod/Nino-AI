const pluginConfig = {
    name: 'poll',
    alias: ['voting', 'vote', 'survei'],
    category: 'group',
    description: 'Crea una encuesta/votacion en el grupo',
    usage: '.poll <pertanyaan> | <opsi1>, <opsi2>, ...',
    example: '.poll Mse va a apa? | Nasi Goreng, Mie Ayam, Bakso',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 30,
    energi: 1,
    isEnabled: true
};

async function handler(m, { sock }) {
    const text = m.text || '';
    
    if (!text || text.trim() === '') {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `> Format no valido!\n\n` +
            `*Format:*\n` +
            `> \`.poll pertanyaan | opsi1, opsi2\`\n\n` +
            `*Ejemplo:*\n` +
            `> \`.poll Mse va a siang apa? | Nasi Goreng, Mie Ayam\`\n\n` +
            `*Opsi tambahan:*\n` +
            `> \`.poll multi | pertanyaan | opsi1, opsi2, opsi3, dst\`\n` +
            `> (para pilihan ganda)`
        );
        return;
    }
    
    let isMultiple = false;
    let parts = text.split('|').map(p => p.trim());
    
    if (parts[0].toLowerCase() === 'multi') {
        isMultiple = true;
        parts = parts.slice(1);
    }
    
    if (parts.length < 2) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `> Format: \`pertanyaan | opsi1, opsi2, ...\``
        );
        return;
    }
    
    const question = parts[0];
    const options = parts[1].split(',').map(o => o.trim()).filter(o => o);
    
    if (options.length < 2) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `> Minimal 2 opsi pilihan!`
        );
        return;
    }
    
    if (options.length > 12) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `> Maksimal 12 opsi pilihan!`
        );
        return;
    }
    
    if (question.length > 255) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `> Pregunta terlalu panjang!\n` +
            `> Maksimal 255 karakter.`
        );
        return;
    }
    
    try {
        const pollMsg = `✅ Success membuat poll`;
        
        await m.reply(pollMsg, { mentions: [m.sender] });
        
        await sock.sendMessage(m.chat, {
            poll: {
                name: question,
                values: options,
                selectableCount: isMultiple ? options.length : 1
            }
        });
        
    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> Fallido membuat poll.\n` +
            `> _${error.message}_`
        );
    }
}

export { pluginConfig as config, handler }