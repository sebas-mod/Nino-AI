const pluginConfig = {
    name: 'open',
    alias: ['buka', 'opengroup', 'bukagroup'],
    category: 'group',
    description: 'Abre el grupo para que todos los miembros puedan escribir',
    usage: '.open',
    example: '.open',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
};

async function handler(m, { sock }) {
    try {
        const groupMeta = m.groupMetadata;
        
        if (!groupMeta.announce) {
            await m.reply(
                `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
                `> Grupo ya en keadaan \`terbuka\`.\n` +
                `> Todos miembro ya bisa enviar mensaje.`
            );
            return;
        }
        
        await sock.groupSettingUpdate(m.chat, 'not_announcement');
        
        const senderNum = m.sender.split('@')[0];
        
        const successMsg = `✅ @${senderNum} telah membuka grupo ini\n_Sekarang kalian bisa enviar mensaje_`;
        
        await m.reply(successMsg, { mentions: [m.sender] });
        
    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> Fallido membuka grupo.\n` +
            `> _${error.message}_`
        );
    }
}

export { pluginConfig as config, handler }