const pluginConfig = {
    name: 'readmore',
    alias: ['selengkapnya', 'spoiler'],
    category: 'tools',
    description: 'Crea texto de leer más (spoiler)',
    usage: '.readmore <text_awal>|<text_akhir>',
    example: '.readmore Hai|Este es un mensaje secreto',
    isGroup: false,
    isBotAdmin: false,
    isAdmin: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
};

function handler(m, { sock }) {
    const text = m.text;
    
    if (!text) {
        return m.reply(`⚠️ Ingresa texto!\nEjemplo: \`${m.prefix}${m.command} Hola|Este es texto oculto\``);
    }
    
    let [l, r] = text.split('|');
    if (!l) l = '';
    if (!r) r = '';
    
    const readmore = String.fromCharCode(8206).repeat(4001);
    
    m.reply(l + readmore + r);
}

export { pluginConfig as config, handler }