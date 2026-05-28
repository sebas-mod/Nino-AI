import os from "os";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "stats",
  alias: ["botstats", "status", "stat"],
  category: "main",
  description: "Muestra estadisticas bot",
  usage: ".stats",
  example: ".stats",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

async function handler(m, { sock, db, uptime, config: botConfig }) {
  try {
    const users = db.db?.data?.users || {};
    const groups = db.db?.data?.groups || {};
    const memUsed = process.memoryUso();
    const cpuUso = os.loadavg()[0].toFixed(2);
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const totalUsuarios = Object.keys(users).length;
    const totalGroups = Object.keys(groups).length;
    const premiumUsuarios = Object.values(users).filter((u) => u.premium).length;

    const statsObj = {
      bot: botConfig?.bot?.name || "Nino AI",
      version: `v${botConfig?.bot?.version || "1.0.0"}`,
      uptime: formatUptime(uptime),
      database: {
        users: totalUsuarios,
        premium: premiumUsuarios,
        groups: totalGroups,
      },
      system: {
        platform: `${os.platform()} ${os.arch()}`,
        node: process.version,
        cpuLoad: `${cpuUso}%`,
        ram: `${formatBytes(usedMem)} / ${formatBytes(totalMem)}`,
        heap: `${formatBytes(memUsed.heapUsed)} / ${formatBytes(memUsed.heapTotal)}`,
      },
      updated: new Date().toLocaleTimeString("id-ID", {
        timeZone: "Asia/Jakarta",
      }),
    };

    const table = [
      "📊 Estadisticas del bot",
      "Clave | Valor",
      `Bot | ${statsObj.bot};;Version | ${statsObj.version};;Tiempo activo | ${statsObj.uptime}`,
      `Usuarios | ${statsObj.database.users};;Premium | ${statsObj.database.premium};;Grupos | ${statsObj.database.groups}`,
      `Plataforma | ${statsObj.system.platform};;Node | ${statsObj.system.node};;Carga CPU | ${statsObj.system.cpuLoad}`,
      `RAM | ${statsObj.system.ram};;Heap | ${statsObj.system.heap};;Actualizado | ${statsObj.updated}`,
    ];

    await sock.sendTableV2(m.chat, table, m, {
      title: "📊 Estas son las estadisticas de nuestro bot",
      footer: botConfig?.bot?.name,
    });
  } catch (error) {
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
