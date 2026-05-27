const pluginConfig = {
  name: 'stopbcpc',
  alias: ['stopbroadcastpc'],
  category: 'owner',
  description: 'Detener el broadcast privado en curso',
  usage: '.stopbcpc',
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true
}

async function handler(m) {
  if (!global.statusBcpc) {
    return m.reply('❌ No hay broadcast privado en curso.')
  }
  global.stopBcpc = true
  return m.reply('⏹️ Deteniendo broadcast privado...')
}

export { pluginConfig as config, handler }
