import config from '../../config.js'
import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
  name: 'buildml',
  alias: [],
  category: 'info',
  description: 'Build de heroe de Mobile Legends',
  usage: '.buildml <hero>',
  example: '.buildml gusion',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 1,
  isEnabled: true
}

async function handler(m, { sock }) {
  let text = m.args?.join(" ")
  if (!text) {
    return m.reply(
      `📚 *BUILD ML*\n\n> Ingresa el nombre del personaje\n\nEjemplo: ${m.prefix}buildml gusion`
    )
  }

  m.react("🕕")

  try {
    const { data } = await axios.get(
      `https://api.apocalypse.web.id/search/buildml?hero=${encodeURIComponent(text)}`
    )

    const heroes = data.builds
    if (!heroes || !heroes.length) {
      return m.reply("❌ Build no encontrada")
    }

    const pickRandom = heroes[Math.floor(Math.random() * heroes.length)]
    const title = pickRandom.title

    const itemnya = pickRandom.items?.map(v => {
      return `*ITEM*
🌿 \`Nombre\`: ${v.name}
🔮 \`Tipo\`: ${v.type}
💵 \`Precio\`: ${v.price}

*ESTADISTICAS*
🚧 \`Poder Magico\`: ${v.stats?.magic_power || "-"}
👻 \`Velocidad de Movimiento\`: ${v.stats?.movement_speed || "-"}
🎗️ \`Penetracion Magica\`: ${v.stats?.magic_penetration || "-"}

*PASIVA*
${v.passive_description || "-"}`
    }).join("\n\n")

    m.reply(`*BUILD ${text.toUpperCase()}*

🍯 *Titulo*
${title}

${itemnya}`)

  } catch (error) {
    console.error('BuildML Error:', error)
    m.reply(te(m.prefix, m.command, m.pushName))
  }
}

export { pluginConfig as config, handler }
