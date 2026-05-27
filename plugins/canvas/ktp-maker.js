import te from "../../src/lib/ourin-error.js";
import config from "../../config.js";

const pluginConfig = {
  name: "ktp-maker",
  alias: ["ktp", "makektp"],
  category: "canvas",
  description: "Crea una imagen KTP falsa para entretenimiento",
  usage: ".ktp-maker | nik | nombre | provincia | ciudad | ttl | genero | sangre | direccion | rt/rw | kel | kec | religion | estado | trabajo | wni",
  example: ".ktp-maker | 3171234567890001 | Penguin | DKI JAKARTA | JAKARTA | Helsinki, 28-12-1969 | HOMBRE | O | Calle Open Source 1 | 001/001 | Linux | Kernel | Islam | CASADO | Programador | WNI",
  cooldown: 20,
  energi: 2,
  isEnabled: true,
};

const API = "https://api.obscuraworks.org/api/maker/ektp";
const KEY = config.APIkey.obscura;

const FIELDS = [
  "nik", "nama", "provinsi", "kota", "ttl",
  "jenis_kelamin", "golongan_darah", "alamat",
  "rt/rw", "kel/desa", "kecamatan",
  "agama", "status", "pekerjaan", "kewarganegaraan",
];

async function handler(m, { sock }) {
  const raw = m.text?.trim();
  if (!raw || !raw.includes("|")) {
    return m.reply(
      `🪪 *ᴋᴛᴘ ᴍᴀᴋᴇʀ*\n\n` +
      `- Crea una imagen KTP falsa para entretenimiento 🎭\n` +
      `- Separa el formato con |\n\n` +
      `\`${m.prefix}ktp-maker | NIK | Nombre | Provincia | Ciudad | TTL | Genero | Tipo de sangre | Direccion | RT/RW | Kel/Desa | Kecamatan | Religion | Estado | Trabajo | WNI\``
    );
  }

  const parts = raw.split("|").map((s) => s.trim());
  if (parts.length < 15) {
    return m.reply(
      `🪪 *ꜰᴏʀᴍᴀᴛ ᴋᴜʀᴀɴɢ*\n\n` +
      `- Necesitas 15 campos, solo llenaste ${parts.length}\n` +
      `- NIK | Nombre | Prov | Ciudad | TTL | Genero | Sangre | Direccion | RT/RW | Kel | Kec | Religion | Estado | Trabajo | WNI`
    );
  }

  m.react("🕕");

  try {
    const params = new URLSearchParams();
    for (let i = 0; i < FIELDS.length; i++) {
      params.set(FIELDS[i], parts[i] || "-");
    }

    const ppUrl = m.isImage || m.quoted?.isImage
      ? await uploadPhoto(m)
      : "https://img1.pixhost.to/images/10801/670256545_upload.jpg";

    params.set("pas_photo", ppUrl);

    const r = await fetch(`${API}?${params}`, {
      headers: {
        Accept: "application/json, image/*, audio/*, video/*",
        Authorization: `Bearer ${KEY}`,
      },
    });

    const buf = Buffer.from(await r.arrayBuffer());

    m.react("✅");
    await sock.sendMedia(m.chat, buf, null, m, { type: "image" });
  } catch (e) {
    console.log(e);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

async function uploadPhoto(m) {
  try {
    const b = m.quoted?.isMedia
      ? await m.quoted.download()
      : await m.download();
    const f = new FormData();
    f.append("file", new Blob([b]), "img.jpg");
    const r = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST", body: f,
    });
    const j = await r.json();
    return j.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
  } catch {
    return "https://img1.pixhost.to/images/10801/670256545_upload.jpg";
  }
}

export { pluginConfig as config, handler };
