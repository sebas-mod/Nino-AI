import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
  name: 'custompayment',
  alias: ['setpayment', 'setpaytext'],
  category: 'owner',
  description: 'Configurar texto personalizado para .payment con placeholders',
  usage: '.custompayment <texto> / .custompayment reset',
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true
}

async function handler(m) {
  const db = getDatabase()
  const input = m.text?.trim()
  const current = db.setting('customPaymentText') || ''

  if (!input) {
    return m.reply(
      `📝 *CUSTOM PAYMENT TEXT*\n\n` +
      `Texto actual:\n${current || '_(aun no configurado, usa el valor por defecto)_'}\n\n` +
      `*PLACEHOLDERS DISPONIBLES:*\n` +
      `• \`{botname}\` — Nama bot\n` +
      `• \`{owner}\` — Nama owner\n` +
      `• \`{methods}\` — Lista de e-wallets\n` +
      `• \`{banks}\` — Lista de bancos\n` +
      `• \`{qris}\` — Status QRIS\n\n` +
      `*CONTOH:*\n` +
      `> \`${m.prefix}custompayment Hola! Bayar ke {methods}\`\n\n` +
      `> \`${m.prefix}custompayment reset\` — Kembalikan ke default`
    )
  }

  if (input.toLowerCase() === 'reset') {
    db.setting('customPaymentText', '')
    return m.reply('✅ Texto custom payment direset ke default.')
  }

  db.setting('customPaymentText', input)
  return m.reply(`✅ Texto custom payment disimpan!\n\nPreview:\n${input}`)
}

export { pluginConfig as config, handler }
