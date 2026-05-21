const pluginConfig = {
    name: 'close',
    alias: ['tutup', 'closegroup', 'tutupgroup'],
    category: 'group',
    description: 'Cierra el grupo para que solo los admins puedan escribir',
    usage: '.close',
    example: '.close',
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
        
        if (groupMeta.announce) {
            await m.reply(
                `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
                `> Grupo ya en keadaan \`tertutup\`.\n` +
                `> Solo admins pueden enviar mensajes.`
            );
            return;
        }
        
        await sock.groupSettingUpdate(m.chat, 'announcement');
        
        const senderNum = m.sender.split('@')[0];
        
        const successMsg = `✅ @${senderNum} cerro este grupo`;
        
        await m.reply(successMsg, {mentions: [m.sender]})
        
    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> No se pudo cerrar el grupo.\n` +
            `> _${error.message}_`
        );
    }
}

export { pluginConfig as config, handler }