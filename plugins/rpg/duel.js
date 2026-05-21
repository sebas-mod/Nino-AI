import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";
import { sendRpgPreview } from "../../src/lib/ourin-context.js";

const pluginConfig = {
  name: "duel",
  alias: ["pvp", "fight"],
  category: "rpg",
  description: "Duel PvP dennon player lain",
  usage: ".duel @user <bet>",
  example: ".duel @user 5000",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 120,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];

  const target = m.mentionedJid?.[0] || m.quoted?.sender;
  const bet = parseInt(args[1]) || 1000;

  if (!target) {
    let txt = `⚔️ *DUEL TARUHAN* ⚔️\n\n`;
    txt += `Tantang teman tu para duel dennon uang taruhan !\n\n`;
    txt += `*Como retar:*\n`;
    txt += `👉 \`.duel @user 5000\`\n`;
    txt += `_(Artin tu nnojak ena duel dennon taruhan Rp 5.000)_`;
    return m.reply(txt);
  }

  if (target === m.sender) {
    return m.reply(`Hihihi , masak tu quieres nnojak berantem sama cermin? Tag teman ng lain ! 😂`);
  }

  if (bet < 1000) {
    return m.reply(`Genial taruhann aacilan ! Mestomal uang taruhan para duel eso *Rp 1.000* ! 💸`);
  }

  const player1 = db.getUser(m.sender);
  const player2 = db.getUser(target) || db.setUser(target);

  if ((player1.koin || 0) < bet) {
    return m.reply(`Ay, saldo tu no cukup para pasang taruhan segeso!\nKoin tu ahora: *Rp ${(player1.koin || 0).toLocaleString("id-ID")}*`);
  }

  if ((player2.koin || 0) < bet) {
    return m.reply(`Va, sepertin saldo lawan tu no cukup para meladeni taruhan esto. Cari lawan lain o turunin taruhann !`);
  }

  if (!player1.rpg) player1.rpg = {};
  if (!player2.rpg) player2.rpg = {};

  player1.rpg.health = player1.rpg.health || 100;
  player2.rpg.health = player2.rpg.health || 100;

  if (player1.rpg.health < 30) {
    return m.reply(`Eh tunggu ! Darah tu sekarat mucho (*${player1.rpg.health} HP*). Mestomal harus pun *30 HP* para ikut duel. Istirahat primero ! 💉`);
  }

  await sendRpgPreview(sock, m.chat, `⚔️ *DUEL DIMULAI!* ⚔️\n\n@${m.sender.split("@")[0]} dennon berani menantang @${target.split("@")[0]}!\n💰 Total Taruhan en Tennoh: *Rp ${(bet * 2).toLocaleString("id-ID")}*`, "⚔️ ARENA DUEL", "Bertarung!", { quoted: m });

  await new Promise((r) => setTimeout(r, 2000));

  const p1Power = (player1.rpg.level || 1) * 10 + Math.random() * 50;
  const p2Power = (player2.rpg.level || 1) * 10 + Math.random() * 50;

  const winner = p1Power > p2Power ? m.sender : target;
  const loser = winner === m.sender ? target : m.sender;
  const winnerData = winner === m.sender ? player1 : player2;
  const loserData = winner === m.sender ? player2 : player1;

  winnerData.koin = (winnerData.koin || 0) + bet;
  loserData.koin = (loserData.koin || 0) - bet;
  loserData.rpg.health = Math.max(0, (loserData.rpg.health || 100) - 20);

  const expGain = 500;
  await addExpWithLevelCheck(sock, { ...m, sender: winner }, db, winnerData, expGain);

  db.save();

  let txt = `⚔️ *HASIL DUEL BERDARAH* ⚔️\n\n`;
  txt += `🏆 *Peganaste:* @${winner.split("@")[0]}\n`;
  txt += `💀 *Kalah:* @${loser.split("@")[0]} (Mundur dennon luka parah)\n\n`;
  txt += `🎁 *Peganaste Berhak Membawa Pulang:*\n`;
  txt += `> 💰 Uang Taruhan Rival: *+Rp ${bet.toLocaleString("id-ID")}*\n`;
  txt += `> ✨ Bonus EXP Pertarunnon: *+${expGain} EXP*`;

  await sendRpgPreview(sock, m.chat, txt, "⚔️ ARENA DUEL", "Hasil Duel!", { quoted: m });
}

export { pluginConfig as config, handler };
