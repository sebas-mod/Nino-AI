import te from "../../src/lib/ourin-error.js";
import config from "../../config.js";

const pluginConfig = {
  name: "nikparser",
  alias: ["nik", "ceknik"],
  category: "tools",
  description: "Analiza y valida NIK KTP",
  usage: ".nikparser <16 digit NIK>",
  example: ".nikparser 3517072109020003",
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

const API = "https://api.obscuraworks.org/api/v2/tools/nik";
const KEY = config.APIkey.obscura;

const PROVINSI = {
  11: "Aceh",
  12: "Sumatera Utara",
  13: "Sumatera Barat",
  14: "Riau",
  15: "Jambi",
  16: "Sumatera Selatan",
  17: "Bengkulu",
  18: "Lampung",
  19: "Kepululauan Bangka Belitung",
  21: "Kepulauan Riau",
  31: "DKI Jakarta",
  32: "Jawa Barat",
  33: "Jawa Tengah",
  34: "DI Yogyakarta",
  35: "Jawa Timur",
  36: "Banten",
  51: "Bali",
  52: "Nusa Tenggara Barat",
  53: "Nusa Tenggara Timur",
  61: "Kalimantan Barat",
  62: "Kalimantan Tengah",
  63: "Kalimantan Selatan",
  64: "Kalimantan Timur",
  65: "Kalimantan Utara",
  71: "Sulawesi Utara",
  72: "Sulawesi Tengah",
  73: "Sulawesi Selatan",
  74: "Sulawesi Tenggara",
  75: "Gorontalo",
  76: "Sulawesi Barat",
  81: "Maluku",
  82: "Maluku Utara",
  91: "Papua",
  92: "Papua Barat",
};

async function handler(m, { sock }) {
  const nik = m.text?.replace(/\D/g, "");

  if (!nik || nik.length !== 16) {
    return m.reply(
      `🪪 *ɴɪᴋ ᴘᴀʀꜱᴇʀ*\n\n` +
        `- Analiza y valida NIK KTP 🇮🇩\n` +
        `- Ingresa los 16 dígitos del NIK\n\n` +
        `\`${m.prefix}nikparser 3517072109020003\``,
    );
  }

  m.react("🕕");

  try {
    const r = await fetch(`${API}?nik=${nik}`, {
      headers: {
        Accept: "application/json, image/*, audio/*, video/*",
        Autorization: `Bearer ${KEY}`,
      },
    });

    const data = await r.json();

    if (!data?.valid) {
      m.react("❌");
      return m.reply(
        `🪪 *ɴɪᴋ ᴛɪᴅᴀᴋ ᴠᴀʟɪᴅ*\n\n` +
          `- El NIK que ingresaste no es válido\n` +
          `- Asegúrate de que los 16 dígitos sean correctos`,
      );
    }

    m.react("✅");

    const bDay = new Date(data.birthISO);
    const bFormatted = bDay.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const genderEmoji = data.gender === "pria" ? "♂️" : "♀️";
    const provNama = PROVINSI[data.provinceId] || data.province || "-";

    m.reply(
      `🪪 *ɴɪᴋ ᴘᴀʀꜱᴇʀ*\n\n` +
        `- *NIK* → \`${data.raw}\`\n` +
        `- *Valid* → ✅ Valid\n` +
        `- *Fecha Lahir* → ${bFormatted}\n` +
        `- *Jenis Kelamin* → ${genderEmoji} ${data.gender?.charAt(0).toUpperCase() + data.gender?.slice(1)}\n` +
        `- *Provincia* → ${provNama}\n` +
        `- *Ciudad/Regencia* → Código \`${data.kabupatenKotaId}\`\n` +
        `- *Kecamatan* → Código \`${data.kecamatanId}\`\n` +
        `- *Código Unik* → \`${data.uniqcode}\``,
    );
  } catch (e) {
    console.log(e);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
