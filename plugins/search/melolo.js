import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";
import ourinApi from "../../src/lib/ourin-apimanager.js";

const pluginConfig = {
  name: "melolo",
  alias: ["melolodrama", "dramamelolo"],
  category: "search",
  description: "Buscar listas de dramas cortos por categoría en Melolo",
  usage: ".melolo <categoría>",
  example: ".melolo fantasy",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 8,
  energi: 1,
  isEnabled: true,
};

function trimText(text, max = 90) {
  const value = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!value) return "-";
  if (value.length <= max) return value;
  return value.slice(0, max) + "...";
}

function normalizeResults(data) {
  const groups = [];

  for (const [section, items] of Object.entries(data || {})) {
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      groups.push({
        section,
        title: item?.title || "-",
        url: item?.url || "-",
        image: item?.image || "",
        rating: item?.rating || "-",
        episodes: item?.episodes || "-",
      });
    }
  }

  return groups;
}

async function fetchMelolo(category) {
  const data = await ourinApi.covenant.meloloCategory(category, {
    timeout: 30000,
  });

  if (!data?.status || !data?.data) {
    throw new Error(data?.message || "No se encontraron resultados de Melolo");
  }

  return data;
}

async function handler(m, { sock }) {
  const category = m.text?.trim();

  if (!category) {
    return m.reply(
      `🎭 *MELOLO DRAMA*\n\n> Ejemplo:\n\`${m.prefix}melolo fantasy\``,
    );
  }

  if (!config.APIkey?.covenant) {
    return m.reply("❌ La API key de covenant no está configurada.");
  }

  m.react("🔍");

  try {
    const result = await fetchMelolo(category);
    const items = normalizeResults(result.data).slice(0, 10);

    if (items.length === 0) {
      m.react("❌");
      return m.reply(
        `❌ No se encontraron resultados de Melolo para la categoría: ${category}`,
      );
    }

    let caption = "🎭 *MELOLO DRAMA*\n\n";
    caption += `🌿 *Categoría:* ${category}\n`;
    caption += `📦 *Total:* ${items.length}\n`;
    caption += `💳 *Costo:* ${result?.usage?.cost ?? "-"}\n`;
    caption += `🔋 *Crédito restante:* ${result?.usage?.remaining ?? "-"}\n\n`;

    items.forEach((item, index) => {
      caption += `*${index + 1}.* ${trimText(item.title, 70)}\n`;
      caption += `   ├ 📂 ${trimText(item.section, 32)}\n`;
      caption += `   ├ ⭐ ${item.rating || "-"}\n`;
      caption += `   ├ 📝 ${trimText(item.episodes, 110)}\n`;
      caption += `   └ ${item.url}\n\n`;
    });

    const cover = items.find((item) => item.image)?.image;
    if (cover) {
      await sock.sendMedia(m.chat, cover, caption.trim(), m, {
        type: "image",
      });
    } else {
      await m.reply(caption.trim());
    }

    m.react("✅");
  } catch (error) {
    m.react("☢");
    const message = error?.response?.data?.message || error?.message;
    if (message) {
      return m.reply(`❌ ${message}`);
    }
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
