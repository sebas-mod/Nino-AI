import { getDatabase } from "../../src/lib/ourin-database.js";
import {
  getOrCreateFischUser,
  getRandomFish,
  formatMoney,
  addRodExp,
  addPlayerExp,
  getUpgradedStats,
  doGachaPull,
  getStreakBonus,
  JACKPOT_POOLS,
  doJackpotPull,
  applyJackpotReward,
} from "../../src/lib/ourin-fisch.js";
import {
  islands,
  travelRequirements,
  fishingRod,
  rodEnchants,
  mutations,
  RARITY_EMOJI,
  UPGRADES,
  DAILY_REWARDS,
  TOKEN_SHOP,
  GACHA_COST_COINS,
  GACHA_PITY_LIMIT,
} from "../../src/lib/ourin-fisch-data.js";
import config from "../../config.js";
import path from "path";
import fs from "fs";

const FC = 15;
const rc = (r) => RARITY_EMOJI[r] || "W";
const encCost = (r) =>
  ({
    common: 50000,
    rare: 500000,
    epic: 5e6,
    legendary: 5e7,
    mythic: 5e8,
    godly: 5e9,
    secret: 5e10,
  })[r] || 50000;

let thumbFish = null;
try {
  const p = path.join(process.cwd(), "assets", "images", "ourin-fishit.jpg");
  if (fs.existsSync(p)) thumbFish = fs.readFileSync(p);
} catch (e) {}

function ctx(title, body) {
  const sId = config.saluran?.id || "120363400911374213@newsletter";
  const sName = config.saluran?.name || config.bot?.name || "Nino AI";
  const c = {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: sId,
      newsletterName: sName,
      serverMessageId: 127,
    },
  };
  return c;
}

function send(sock, m, text, title, body) {
  const msgId = sock.sendPreview(
    m.chat,
    {
      caption: `${config.info.website} ${text}`,
      url: `${config.info.website}`,
      title: `𝗙𝗜𝗦𝗛 𝗜𝗧 𝗚𝗔𝗠𝗘𝗦`,
      description: `consigue recompensas y diversion con tus capturas`,
      jpegThumbnail: thumbFish,
      previewType: 0,
    },
    { quoted: m },
  );
  return { key: { id: msgId, remoteJid: m.chat, fromMe: true } };
}

const pluginConfig = {
  name: "fisht",
  alias: ["fishit"],
  category: "game",
  description: "Fishit - Juego de pesca",
  usage: ".fisht <command>",
  example: ".fisht help",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const cmd = m.command || m.body?.split(" ")[0]?.slice(1)?.toLowerCase() || "";
  const args = m.args || m.body?.split(" ").slice(1) || [];
  const sub = args[0]?.toLowerCase() || "";
  const sa = args.slice(1);

  if (cmd === "fishit") {
    if (!sub || sub === "on" || sub === "off") {
      if (!m.isGroup) return m.reply("_El toggle solo funciona en grupos_");
      if (!m.isOwner && !m.isAdmin) return m.reply("_Solo admin/owner_");
      const gd = db.getGroup(m.chat) || {};
      if (sub === "on") {
        gd.fishitEnabled = true;
        db.setGroup(m.chat, gd);
        return send(
          sock,
          m,
          `*FISHIT ACTIVADO*\n\nTodos los miembros pueden jugar Fishit!\nEscribe \`.fisht help\` para empezar`,
          "Fishit ON",
          "Activado",
        );
      }
      if (sub === "off") {
        gd.fishitEnabled = false;
        db.setGroup(m.chat, gd);
        return send(sock, m, `*FISHIT DESACTIVADO*`, "Fishit OFF", "Desactivado");
      }
      return m.reply(
        `*Fishit:* ${gd.fishitEnabled ? "ON" : "OFF"}\n\`.fishit on/off\``,
      );
    }
  }

  if (cmd !== "fisht" && cmd !== "fishit") return;

  if (!sub || sub === "help" || sub === "menu") {
    return send(
      sock,
      m,
      `*FISHIT GAME*\n_Sistema completo de pesca_\n\n` +
        `*PESCA*\n\`.fisht mancing\` _Empezar a pescar_\n\`.fisht view\` _Recoger capturas_\n\`.fisht sell\` _Vender peces_\n\`.fisht fishbook\` _Coleccion de peces_\n\`.fisht mutbook\` _Coleccion de mutaciones_\n\`.fisht top\` _Clasificacion_\n\n` +
        `*PERFIL*\n\`.fisht me\` _Tu perfil_\n\`.fisht stats\` _Estadisticas detalladas_\n\`.fisht daily\` _Recompensa diaria_\n\n` +
        `*ISLAS & CANAS*\n\`.fisht travel\` _Lista de islas_\n\`.fisht travel <isla>\` _Cambiar de isla_\n\`.fisht shop\` _Tienda de canas_\n\`.fisht buy <cana>\` _Comprar cana_\n\`.fisht equip <cana>\` _Equipar cana_\n\`.fisht rods\` _Coleccion de canas_\n\`.fisht enchant <clave>\` _Encantar cana_\n\`.fisht enchants\` _Lista de encantamientos_\n\`.fisht rodup\` _Mejorar cana_\n\n` +
        `*PRESTIGE*\n\`.fisht prestige\` _Info de prestigio_\n\`.fisht tokens\` _Tienda de tokens_\n\`.fisht upgrade\` _Mejorar estadisticas_\n\`.fisht gacha\` _Gacha_\n\`.fisht gacha ticket\` _Gacha con ticket_\n\n` +
        `*JACKPOT*\n\`.fisht jackpot\` _Lista de jackpots_\n\`.fisht jackpot <tier>\` _Jugar jackpot_\n_El jackpot puede dar _Premium_, _Partner_, _Energi_, _Limit_, incluso _UNLIMITED_!_`,
      "Fishit Game",
      "Juego de pesca",
    );
  }
  if (sub === "mancing" || sub === "fish") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    if (f.fishingPending && f.fishingPending.length > 0)
      return m.reply(`_Todavia hay capturas pendientes!_ \`.fisht view\` _primero._`);
    const now = Date.now();
    if (f.lastFishTime && now - f.lastFishTime < FC * 1000)
      return m.reply(
        `_Espera *${Math.ceil((FC * 1000 - (now - f.lastFishTime)) / 1000)}* segundos_`,
      );
    const rk = f.usedFishingRod || "basicrod";
    const rod = f.fishingRods[rk];
    if (!rod) return m.reply(`_No hay una cana activa!_ \`.fisht rods\``);
    const ik = f.currentIsland || "mousewood";
    const st = getUpgradedStats(f, rod);
    const eRod = {
      ...rod,
      luck: st.luck,
      speed: st.speed,
      sellMultiplier: st.sellMultiplier,
    };
    const catches = [];
    let tv = 0;
    for (let i = 0; i < (rod.comboFish || 1); i++) {
      const fish = getRandomFish(eRod, ik);
      if (fish) {
        fish.price = Math.round(
          fish.price * getStreakBonus(f.streak || 0).mult,
        );
        catches.push(fish);
        tv += fish.price;
      }
    }
    f.fishingPending = catches;
    f.lastFishTime = now;
    f.streak = (f.streak || 0) + 1;
    await send(
      sock,
      m,
      `*_Pescando en ${islands[ik]?.name || ik}..._*\n_Cana: ${rod.name} | Suerte: ${(st.luck * 100).toFixed(1)}%_`,
      "Pescando...",
      islands[ik]?.name || "",
    );
    await new Promise((r) =>
      setTimeout(
        r,
        Math.min(Math.max(2000, 5000 - (rod.speed || 0) * 3000), 4000),
      ),
    );
    let txt = `*RESULTADO DE PESCA!*\n\n`;
    for (const c of catches) {
      txt += `${rc(c.rarity)} *${c.name}*\n   _${formatMoney(c.price)} | ${c.kg}kg_\n`;
      if (c.isMutated)
        txt += `   _Mutacion: ${c.mutations.filter((x) => x !== "Normal").join(", ")}_\n`;
    }
    txt += `\n*Total: ${formatMoney(tv)}*`;
    if (f.streak >= 3) txt += `\n_Streak: ${f.streak}x_`;
    txt += `\n\n\`.fisht view\` para recoger!`;
    db.markDirty("users");
    return send(sock, m, txt, "Resultado de pesca!", formatMoney(tv));
  }

  if (sub === "view") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    if (!f.fishingPending || f.fishingPending.length === 0)
      return m.reply(`_No hay capturas._ \`.fisht mancing\` _primero!_`);
    const catches = f.fishingPending;
    let tv = 0,
      te = 0,
      nf = [],
      nm = [];
    for (const fish of catches) {
      tv += fish.price;
      te += Math.max(10, Math.floor(fish.price / 50));
      const cn = fish.name.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim();
      if (!f.fishFound.includes(cn)) {
        f.fishFound.push(cn);
        nf.push(cn);
      }
      if (fish.isMutated)
        for (const mut of fish.mutations) {
          if (mut !== "Normal" && !f.mutationFound.includes(mut)) {
            f.mutationFound.push(mut);
            nm.push(mut);
          }
        }
    }
    f.money = (f.money || 0) + tv;
    f.fishCaught = (f.fishCaught || 0) + catches.length;
    f.totalEarned = (f.totalEarned || 0) + tv;
    f.inventory = [...(f.inventory || []), ...catches];
    const rlu = addRodExp(f, f.usedFishingRod || "basicrod", te);
    const plu = addJugadorExp(f, te);
    f.fishingPending = [];
    let txt = `*CAPTURAS RECOGIDAS!*\n\n+${formatMoney(tv)}\n+${te} EXP\n+${catches.length} peces\n`;
    if (nf.length > 0) txt += `\n*Pez nuevo:* ${nf.join(", ")}`;
    if (nm.length > 0) txt += `\n*Mutacion nueva:* ${nm.join(", ")}`;
    if (rlu) txt += `\n\n${rlu}`;
    if (plu) txt += `\n*SUBIDA DE NIVEL! Nivel ${f.level}*`;
    db.markDirty("users");
    return send(sock, m, txt, "Capturas recogidas!", `+${formatMoney(tv)}`);
  }

  if (sub === "sell") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    if (!f.inventory || f.inventory.length === 0)
      return m.reply(`_Inventario vacio!_ \`.fisht mancing\` _primero._`);
    let tv = 0;
    for (const fish of f.inventory) tv += fish.price || 0;
    const sb = UPGRADES.sell.effect(f.sellUpgrade || 0);
    const rod = f.fishingRods[f.usedFishingRod || "basicrod"];
    const rsm = rod ? rod.sellMultiplier || 0 : 0;
    const fv = Math.round(tv * (1 + sb + rsm));
    const fc2 = f.inventory.length;
    f.money = (f.money || 0) + fv;
    f.totalEarned = (f.totalEarned || 0) + fv;
    f.inventory = [];
    db.markDirty("users");
    return send(
      sock,
      m,
      `*PECES VENDIDOS!*\n\nCantidad: ${fc2}\nTotal: ${formatMoney(fv)}\nSaldo: ${formatMoney(f.money)}`,
      "Peces vendidos!",
      formatMoney(fv),
    );
  }

  if (sub === "me") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rod = f.fishingRods[f.usedFishingRod || "basicrod"];
    return send(
      sock,
      m,
      `*PERFIL DE PESCADOR*\n\n*Nivel:* ${f.level} _(${f.exp}/${f.expToNextLevel} EXP)_\n*Dinero:* ${formatMoney(f.money)}\n*Peces:* ${f.fishCaught}\n*Cana:* ${rod ? rod.name : "Basica"} _(Lv.${rod ? rod.level : 1})_\n*Isla:* ${islands[f.currentIsland] ? islands[f.currentIsland].name : f.currentIsland}\n*Racha:* ${f.streak || 0}\n*Prestigio:* ${f.prestige || 0}\n*Tokens:* ${f.prestigeTokens || 0}\n*Tickets:* ${f.gachaTickets || 0}\n*Libro de peces:* ${f.fishFound ? f.fishFound.length : 0}\n*Mutaciones:* ${f.mutationFound ? f.mutationFound.length : 0}\n*Mejoras:*\n  _Suerte: Lv.${f.luckUpgrade || 0}_\n  _Velocidad: Lv.${f.speedUpgrade || 0}_\n  _Venta: Lv.${f.sellUpgrade || 0}_`,
      "Perfil",
      `Nivel ${f.level}`,
    );
  }

  if (sub === "stats") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rod = f.fishingRods[f.usedFishingRod || "basicrod"];
    const st = getUpgradedStats(f, rod);
    let txt = `*ESTADISTICAS DETALLADAS*\n\n*Cana: ${rod ? rod.name : "Ninguna"}*\n  _Lv.${rod ? rod.level : 1}/${rod ? rod.maxLevel : 5} | EXP ${rod ? rod.exp : 0}/${rod ? rod.expToNextLevel : 100}_\n  _Suerte: ${(st.luck * 100).toFixed(1)}% | Velocidad: ${(st.speed * 100).toFixed(1)}%_\n  _Venta: +${(st.sellMultiplier * 100).toFixed(1)}% | Combo: ${rod ? rod.comboFish : 1}_\n`;
    if (rod && rod.enchant) {
      const e = rodEnchants[rod.enchant];
      txt += `  _Encantamiento: ${e ? e.name : rod.enchant} (${e ? e.rarity : "?"})_\n`;
    }
    txt += `\n*Mejoras*\n  _Luck: Lv.${f.luckUpgrade || 0} (+${(UPGRADES.luck.effect(f.luckUpgrade || 0) * 100).toFixed(1)}%)_\n  _Speed: Lv.${f.speedUpgrade || 0} (+${(UPGRADES.speed.effect(f.speedUpgrade || 0) * 100).toFixed(1)}%)_\n  _Sell: Lv.${f.sellUpgrade || 0} (+${(UPGRADES.sell.effect(f.sellUpgrade || 0) * 100).toFixed(1)}%)_`;
      return send(sock, m, txt, "Estadisticas detalladas", rod ? rod.name : "");
  }
  if (sub === "fishbook") {
    const user = getOrCreateFischUser(db, m.sender);
    const found = user.fisch.fishFound || [];
    if (found.length === 0)
      return m.reply(`_Fish Book vacio!_ \`.fisht mancing\` _primero_`);
    let txt = `*FISH BOOK* _(${found.length} especies)_\n\n`;
    for (const [k, isle] of Object.entries(islands)) {
      const fl = isle.listFish.filter((f) => found.includes(f.name));
      if (fl.length > 0) {
        txt += `*${isle.name}*\n`;
        for (const f of fl) txt += `  ${rc(f.rarity)} ${f.name}\n`;
        txt += `\n`;
      }
    }
    return send(sock, m, txt.trim(), "Fish Book", `${found.length} especies`);
  }

  if (sub === "mutbook") {
    const user = getOrCreateFischUser(db, m.sender);
    const found = user.fisch.mutationFound || [];
    if (found.length === 0) return m.reply(`_Mutation Book vacio!_`);
    let txt = `*MUTATION BOOK* _(${found.length})_\n\n`;
    for (const mut of found) {
      const d = mutations[mut];
      if (d) txt += `*${mut}* _x${d.multiplier}_\n`;
    }
    return send(sock, m, txt.trim(), "Mutation Book", `${found.length} mutaciones`);
  }

  if (sub === "travel") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    if (!sa[0]) {
      let txt = `*LISTA DE ISLAS*\n\n`;
      for (const [k, isle] of Object.entries(islands)) {
      const req = travelRequirements[k];
        const ok = (f.travelFound || []).includes(k);
        txt += `${ok ? "[OK]" : "[LOCK]"} *${isle.name}*${f.currentIsland === k ? "  _< Ahora_" : ""}\n`;
        txt += req
          ? `   _${formatMoney(req.money)} | ${req.fish} peces_\n`
          : `   _Gratis_\n`;
      }
      return send(
        sock,
        m,
        txt + `\n\`.fisht travel <isla>\``,
        "Lista de islas",
        islands[f.currentIsland || "mousewood"]?.name || "",
      );
    }
    const tk = sa[0].toLowerCase();
    if (!islands[tk]) return m.reply(`_La isla no existe!_ \`.fisht travel\``);
    if (f.currentIsland === tk)
      return m.reply(`_Ya estas en ${islands[tk].name}!_`);
    const req = travelRequirements[tk];
    if (req) {
      if ((f.money || 0) < req.money)
        return m.reply(`_Dinero insuficiente! Necesitas ${formatMoney(req.money)}_`);
      if ((f.fishCaught || 0) < req.fish)
        return m.reply(`_Peces insuficientes! Necesitas ${req.fish}_`);
      f.money -= req.money;
    }
    if (!(f.travelFound || []).includes(tk))
      f.travelFound = [...(f.travelFound || []), tk];
    f.currentIsland = tk;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*CAMBIO DE ISLA!*\n\nAhora estas en *${islands[tk].name}*\n${islands[tk].listFish.length} tipos de peces disponibles`,
      "Viaje!",
      islands[tk].name,
    );
  }

  if (sub === "shop") {
    let txt = `*TIENDA DE CANAS*\n\n`;
    for (const [k, rod] of Object.entries(fishingRod)) {
      if (rod.price > 0)
        txt += `*${rod.name}*\n   _${formatMoney(rod.price)}_\n   _Suerte +${(rod.luck * 100).toFixed(0)}% | Velocidad +${(rod.speed * 100).toFixed(0)}% | Combo: ${rod.comboFish}_\n   _${rod.description}_\n\n`;
    }
    return send(
      sock,
      m,
      txt + `\`.fisht buy <cana>\``,
      "Tienda de canas",
      "Elige la mejor cana",
    );
  }

  if (sub === "buy") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rk = sa[0] ? sa[0].toLowerCase() : "";
    if (!rk) return m.reply(`_Elige una cana!_ \`.fisht shop\``);
    if (!fishingRod[rk]) return m.reply(`_La cana no existe!_ \`.fisht shop\``);
    if (f.fishingRods[rk])
      return m.reply(`_Ya tienes ${fishingRod[rk].name}!_`);
    if (fishingRod[rk].price === 0)
      return m.reply(`_Esta cana viene de Tokens/Prestigio!_`);
    if ((f.money || 0) < fishingRod[rk].price)
      return m.reply(
        `_Dinero insuficiente! Necesitas ${formatMoney(fishingRod[rk].price)}_`,
      );
    f.money -= fishingRod[rk].price;
    f.fishingRods[rk] = { ...fishingRod[rk] };
    db.markDirty("users");
    return send(
      sock,
      m,
      `*CANA COMPRADA!*\n\n*${fishingRod[rk].name}*\n_Escribe_ \`.fisht equip ${rk}\` _para equipar_`,
      "Cana nueva!",
      fishingRod[rk].name,
    );
  }

  if (sub === "equip") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rk = sa[0] ? sa[0].toLowerCase() : "";
    if (!rk) return m.reply(`_Elige una cana!_ \`.fisht rods\``);
    if (!f.fishingRods[rk])
      return m.reply(`_No tienes esta cana!_ \`.fisht rods\``);
    f.usedFishingRod = rk;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*CANA EQUIPADA!*\n\n*${f.fishingRods[rk].name}* _ahora esta activa_`,
      "Equipar cana!",
      f.fishingRods[rk].name,
    );
  }

  if (sub === "rods") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rods = f.fishingRods || {};
    if (Object.keys(rods).length === 0) return m.reply(`_No tienes canas!_`);
    let txt = `*COLECCION DE CANAS*\n\n`;
    for (const [k, rod] of Object.entries(rods)) {
      txt += `*${rod.name}*${f.usedFishingRod === k ? " _ACTIVA_" : ""}\n  _Lv.${rod.level || 1}/${rod.maxLevel} | Suerte ${(rod.luck * 100).toFixed(0)}% | Velocidad ${(rod.speed * 100).toFixed(0)}%_\n`;
      if (rod.enchant)
        txt += `  _Encantamiento: ${rodEnchants[rod.enchant] ? rodEnchants[rod.enchant].name : rod.enchant}_\n`;
    }
    return send(
      sock,
      m,
      txt + `\n\`.fisht equip <cana>\``,
      "Coleccion de canas",
      `${Object.keys(rods).length} canas`,
    );
  }
  if (sub === "enchant") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rk = f.usedFishingRod || "basicrod";
    const rod = f.fishingRods[rk];
    if (!rod) return m.reply(`_No hay una cana activa!_`);
    const ek = sa[0] ? sa[0].toLowerCase() : "";
    if (!ek) {
      if (rod.enchant) {
        const e = rodEnchants[rod.enchant];
        return m.reply(
          `_Encantamiento actual: *${e ? e.name : rod.enchant}* (${e ? e.rarity : "?"})_\n\`.fisht enchant <clave>\` para cambiar`,
        );
      }
      return m.reply(`_Elige un encantamiento!_ \`.fisht enchants\``);
    }
    if (!rodEnchants[ek])
      return m.reply(`_El encantamiento no existe!_ \`.fisht enchants\``);
    const ench = rodEnchants[ek];
    const cost = encCost(ench.rarity);
    if ((f.money || 0) < cost)
      return m.reply(`_Dinero insuficiente! Necesitas ${formatMoney(cost)}_`);
    f.money -= cost;
    rod.enchant = ek;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*ENCANTAMIENTO EQUIPADO!*\n\n*${ench.name}* _(${ench.rarity})_ en *${rod.name}*\n_${ench.desc}_\n_Costo: ${formatMoney(cost)}_`,
      "Encantamiento!",
      ench.name,
    );
  }

  if (sub === "enchants") {
    const byR = {};
    for (const [k, e] of Object.entries(rodEnchants)) {
      if (!byR[e.rarity]) byR[e.rarity] = [];
      byR[e.rarity].push({ key: k, name: e.name, desc: e.desc });
    }
    let txt = `*LISTA DE ENCANTAMIENTOS*\n\n`;
    for (const r of [
      "common",
      "rare",
      "epic",
      "legendary",
      "mythic",
      "godly",
      "secret",
    ]) {
      const list = byR[r];
      if (!list) continue;
      txt += `${rc(r)} *${r.toUpperCase()}* _${formatMoney(encCost(r))}_\n`;
      for (const e of list) txt += `  \`${e.key}\`: ${e.name} _${e.desc}_\n`;
      txt += `\n`;
    }
    return send(
      sock,
      m,
      txt.trim() + `\n\`.fisht enchant <clave>\``,
      "Encantamientos",
      "Elige un encantamiento",
    );
  }

  if (sub === "rodup") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rk = f.usedFishingRod || "basicrod";
    const rod = f.fishingRods[rk];
    if (!rod) return m.reply(`_No hay una cana activa!_`);
    if (rod.level >= rod.maxLevel) return m.reply(`_La cana ya esta al nivel maximo!_`);
    const cost = Math.floor(rod.price * 0.1 * rod.level) || 10000 * rod.level;
    if ((f.money || 0) < cost)
      return m.reply(`_Dinero insuficiente! Necesitas ${formatMoney(cost)}_`);
    f.money -= cost;
    const res = addRodExp(f, rk, Math.floor(rod.expToNextLevel * 0.5));
    db.markDirty("users");
    return send(
      sock,
      m,
      res
        ? `*CANA MEJORADA!*\n\n${res}\n_Costo: ${formatMoney(cost)}_`
        : `*EXP DE CANA AUMENTADA!*\n\n+${Math.floor(rod.expToNextLevel * 0.5)} EXP\n_Costo: ${formatMoney(cost)}_`,
      "Rod Upgrade!",
      rod.name,
    );
  }

  if (sub === "daily") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const now = new Date();
    if (f.lastDaily) {
      const diff = now.getTime() - new Date(f.lastDaily).getTime();
      if (diff < 86400000)
        return m.reply(
          `_La recompensa diaria ya fue reclamada! Espera *${Math.ceil((86400000 - diff) / 3600000)}* horas._`,
        );
    }
    const ld = f.lastDaily ? new Date(f.lastDaily) : null;
    f.dailyStreak =
      ld && now.getTime() - ld.getTime() < 172800000
        ? (f.dailyStreak || 0) + 1
        : 1;
    let rw = DAILY_REWARDS[0];
    for (const r of DAILY_REWARDS) {
      if (f.dailyStreak >= r.streak) rw = r;
    }
    f.money = (f.money || 0) + rw.money;
    f.gachaTickets = (f.gachaTickets || 0) + rw.tickets;
    f.lastDaily = now.toISOString();
    db.markDirty("users");
    return send(
      sock,
      m,
      `*RECOMPENSA DIARIA!*\n\n*Racha:* ${f.dailyStreak} dias\n+${formatMoney(rw.money)}\n+${rw.tickets} tickets de gacha\n*Saldo:* ${formatMoney(f.money)}`,
      "Recompensa diaria!",
      `Racha ${f.dailyStreak}`,
    );
  }

  if (sub === "gacha") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const useT = sa[0] && sa[0].toLowerCase() === "ticket";
    if (useT) {
      if ((f.gachaTickets || 0) < 1)
        return m.reply(`_No tienes tickets! Tienes ${f.gachaTickets || 0}_`);
      f.gachaTickets -= 1;
    } else {
      if ((f.money || 0) < GACHA_COST_COINS)
        return m.reply(`_Dinero insuficiente! Necesitas ${formatMoney(GACHA_COST_COINS)}_`);
      f.money -= GACHA_COST_COINS;
    }
    const result = doGachaPull(f);
    const item = result.item;
    let txt = `*GACHA RESULT!*\n\n`;
    switch (item.type) {
      case "rod":
        if (fishingRod[item.value] && !f.fishingRods[item.value]) {
          f.fishingRods[item.value] = { ...fishingRod[item.value] };
          txt += `OBTUVISTE CANA: *${item.label}*\n`;
        } else if (f.fishingRods[item.value]) {
          const ref = Math.floor(
            (fishingRod[item.value] ? fishingRod[item.value].price : 0) * 0.3 ||
              100000,
          );
          f.money = (f.money || 0) + ref;
          txt += `Duplicado: *${item.label}* _+${formatMoney(ref)}_\n`;
        }
        break;
      case "tickets":
        f.gachaTickets = (f.gachaTickets || 0) + item.value;
        txt += `+${item.value} tickets\n`;
        break;
      case "tokens":
        f.prestigeTokens = (f.prestigeTokens || 0) + item.value;
        txt += `+${item.value} Tokens\n`;
        break;
      case "coins":
        f.money = (f.money || 0) + item.value;
        txt += `+${formatMoney(item.value)}\n`;
        break;
      case "enchant_scroll":
        {
          const avail = Object.entries(rodEnchants).filter(
            ([, v]) => v.rarity === item.value,
          );
          if (avail.length > 0) {
            const [ek2, ed] = avail[Math.floor(Math.random() * avail.length)];
            const rk2 = f.usedFishingRod || "basicrod";
            if (f.fishingRods[rk2]) {
              f.fishingRods[rk2].enchant = ek2;
              txt += `Enchant: *${ed.name}* _(${item.value})_ a la cana!\n`;
            }
          }
        }
        break;
      case "xp_boost":
        f.exp = (f.exp || 0) + Math.floor(f.expToNextLevel * 0.5);
        txt += `XP Boost x${item.value}!\n`;
        break;
      default:
        txt += `${item.label}\n`;
    }
    if (result.isSSR) txt += `\n*SSR PULL!*`;
    if (result.pity) txt += `\n*Pity activado!*`;
    txt += `\n\n_Pity: ${f.gachaPity}/${GACHA_PITY_LIMIT}_\n_Saldo: ${formatMoney(f.money)} | Tickets: ${f.gachaTickets}_`;
    db.markDirty("users");
    return send(sock, m, txt, "Gacha!", result.isSSR ? "SSR PULL!" : "Resultado");
  }
  if (sub === "upgrade") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const type = sa[0] ? sa[0].toLowerCase() : "";
    if (!type || !UPGRADES[type]) {
      let txt = `*UPGRADE SHOP*\n\n`;
      for (const [k, u] of Object.entries(UPGRADES)) {
        const lv = f[k + "Upgrade"] || 0;
        txt += `*${u.name}* _(Lv.${lv}/${u.maxLevel})_\n  _${u.desc}_\n  ${lv >= u.maxLevel ? "_MAXED_" : `_Next: ${formatMoney(u.getCost(lv))}_`}\n\n`;
      }
      return send(
        sock,
        m,
        txt + `\`.fisht upgrade <luck/speed/sell>\``,
        "Upgrade Shop",
        "Mejora estadisticas",
      );
    }
    const upg = UPGRADES[type];
    const lv = f[type + "Upgrade"] || 0;
    if (lv >= upg.maxLevel) return m.reply(`_Ya esta al maximo!_`);
    const cost = upg.getCost(lv);
    if ((f.money || 0) < cost)
      return m.reply(`_Dinero insuficiente! Necesitas ${formatMoney(cost)}_`);
    f.money -= cost;
    f[type + "Upgrade"] = lv + 1;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*${upg.name} LEVEL UP!*\n\n_Level ${lv + 1}_\n_Costo: ${formatMoney(cost)}_\n_${upg.desc}_`,
      "Upgrade!",
      `${upg.name} Lv.${lv + 1}`,
    );
  }

  if (sub === "prestige") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const cp = f.prestige || 0;
    if (sa[0] && sa[0].toLowerCase() === "confirm") {
      const reqs = [
        { fish: 500, money: 1e10 },
        { fish: 1500, money: 1e12 },
        { fish: 4000, money: 1e14 },
        { fish: 10000, money: 1e19 },
        { fish: 25000, money: 1e22 },
      ];
      const req = reqs[cp];
      if (!req) return m.reply(`_Ya esta al maximo prestige!_`);
      if ((f.fishCaught || 0) < req.fish)
        return m.reply(`_Peces insuficientes! Necesitas ${req.fish}_`);
      if ((f.money || 0) < req.money)
        return m.reply(`_Dinero insuficiente! Necesitas ${formatMoney(req.money)}_`);
      f.prestige = cp + 1;
      f.money = Math.floor(f.money * 0.1);
      f.fishCaught = 0;
      f.streak = 0;
      f.prestigeTokens =
        (f.prestigeTokens || 0) + [50, 150, 500, 1000, 5000][cp];
      const titles = [
        "Pescador nuevo",
        "Veteran",
        "Master Angler",
        "Legend",
        "Transcendent",
        "God of Fishing",
      ];
      if (cp === 0 && !f.fishingRods.prestigerod)
        f.fishingRods.prestigerod = { ...fishingRod.prestigerod };
      if (cp === 2 && !f.fishingRods.cosmicrod)
        f.fishingRods.cosmicrod = { ...fishingRod.cosmicrod };
      db.markDirty("users");
      return send(
        sock,
        m,
        `*SUBIDA DE PRESTIGIO!*\n\n*Titulo:* ${titles[f.prestige]}\n*Tokens:* ${f.prestigeTokens}\n\n_Dinero -90%, contador de peces reiniciado_`,
        "PRESTIGE!",
        titles[f.prestige],
      );
    }
    let txt = `*PRESTIGE SYSTEM*\n\n*Prestige:* ${cp}\n*Tokens:* ${f.prestigeTokens || 0}\n\n`;
    const allReqs = [
      { lv: 1, fish: 500, money: 1e10, rw: "Cana de prestigio + 50 tokens" },
      { lv: 2, fish: 1500, money: 1e12, rw: "Suerte +20% + 150 tokens" },
      { lv: 3, fish: 4000, money: 1e14, rw: "Cana cosmica + 500 tokens" },
      { lv: 4, fish: 10000, money: 1e19, rw: "2x EXP + 1000 tokens" },
      { lv: 5, fish: 25000, money: 1e22, rw: "Cana eterna + 5000 tokens" },
    ];
    for (const r of allReqs)
      txt += `${cp >= r.lv ? "[OK]" : "[LOCK]"} *P${r.lv}*: _${r.fish} peces | ${formatMoney(r.money)}_\n  _${r.rw}_\n\n`;
    return send(
      sock,
      m,
      txt + `\`.fisht prestige confirm\` _(cuidado!)_`,
      "Prestige",
      `P${cp}`,
    );
  }

  if (sub === "tokens") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    if (!sa[0]) {
      let txt = `*TOKEN STORE*\n\n*Tokens:* ${f.prestigeTokens || 0}\n\n`;
      for (const item of TOKEN_SHOP)
        txt += `*${item.name}* _${item.cost} tokens_\n`;
      return send(
        sock,
        m,
        txt + `\n\`.fisht tokens <id>\``,
        "Token Store",
        `${f.prestigeTokens || 0} tokens`,
      );
    }
    const iid = sa[0].toLowerCase();
    const item = TOKEN_SHOP.find((i) => i.id === iid);
    if (!item) return m.reply(`_El item no existe!_ \`.fisht tokens\``);
    if ((f.prestigeTokens || 0) < item.cost)
      return m.reply(`_Tokens insuficientes! Necesitas ${item.cost}_`);
    f.prestigeTokens -= item.cost;
    switch (item.type) {
      case "rod":
        if (fishingRod[item.value] && !f.fishingRods[item.value]) {
          f.fishingRods[item.value] = { ...fishingRod[item.value] };
        } else {
          f.prestigeTokens += item.cost;
          return m.reply(`_Ya tienes esta cana!_`);
        }
        break;
      case "tickets":
        f.gachaTickets = (f.gachaTickets || 0) + item.value;
        break;
      case "coins":
        f.money = (f.money || 0) + item.value;
        break;
    }
    db.markDirty("users");
    return send(
      sock,
      m,
      `*ITEM COMPRADO!*\n\n*${item.name}* _por ${item.cost} tokens_`,
      "Token Store!",
      item.name,
    );
  }

  if (sub === "jackpot") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    if (!sa[0]) {
      let txt = `*JACKPOT SYSTEM*\n\n_Sistema de jackpot con premios grandes!_\n_Puedes obtener _Premium_, _Partner_, _Energi_, _Limit_, incluso _UNLIMITED_!_\n\n`;
      for (const pool of JACKPOT_POOLS) {
        txt += `*${pool.name}*\n  _Costo: ${formatMoney(pool.cost)}_\n  _Probabilidad: ${pool.weight}%_\n  _Recompensas:_\n`;
        for (const rw of pool.rewards) {
          const label =
            {
              coins: "Koin",
              energi: "Energi",
              limit: "Limit",
              tickets: "Gacha Tickets",
              tokens: "Prestige Tokens",
              exp_boost: "EXP Boost",
              premium_7d: "Premium 7 dias",
              premium_30d: "Premium 30 dias",
              partner_7d: "Partner 7 dias",
              partner_30d: "Partner 30 dias",
              unlimited_energi: "UNLIMITED Energi",
              unlimited_limit: "UNLIMITED Limit",
            }[rw.type] || rw.type;
          txt += `    _${label}: ${rw.min === rw.max ? rw.min : `${rw.min}-${rw.max}`} (${rw.weight}%)_\n`;
        }
        txt += `\n`;
      }
      return send(
        sock,
        m,
        txt + `\`.fisht jackpot <mini/mega/ultra/legend>\``,
        "Jackpot!",
        "Premio grande",
      );
    }
    const poolId = sa[0].toLowerCase();
    const pool = JACKPOT_POOLS.find((p) => p.id === poolId);
    if (!pool) return m.reply(`_El tier no existe!_ \`.fisht jackpot\``);
    if ((f.money || 0) < pool.cost)
      return m.reply(`_Dinero insuficiente! Necesitas ${formatMoney(pool.cost)}_`);
    f.money -= pool.cost;
    const result = doJackpotPull(f, poolId);
    if (!result) return m.reply(`_Fallo! Intenta otra vez._`);
    const applied = applyJackpotReward(db, f, m.sender, result);
    db.markDirty("users");
    let txt = `*${pool.name.toUpperCase()}!*\n\n`;
    const isBig = [
      "premium_7d",
      "premium_30d",
      "partner_7d",
      "partner_30d",
      "unlimited_energi",
      "unlimited_limit",
    ].includes(result.reward.type);
    if (isBig) txt += `*JACKPOT GRANDE!*\n\n`;
    txt += `${applied.desc}\n\n_Costo: ${formatMoney(pool.cost)}_\n_Saldo: ${formatMoney(f.money)}_`;
    return send(
      sock,
      m,
      txt,
      isBig ? "JACKPOT GRANDE!" : pool.name,
      applied.desc,
    );
  }

  if (sub === "top") {
    const users = db.db.data.users || {};
    const rankings = [];
    for (const [jid, ud] of Object.entries(users)) {
      if (ud.fisch)
        rankings.push({
          jid,
          fishCaught: ud.fisch.fishCaught || 0,
          money: ud.fisch.money || 0,
          level: ud.fisch.level || 1,
          prestige: ud.fisch.prestige || 0,
        });
    }
    if (rankings.length === 0) return m.reply(`_Aun no hay jugadores!_`);
    rankings.sort((a, b) => {
      if (b.prestige !== a.prestige) return b.prestige - a.prestige;
      if (b.fishCaught !== a.fishCaught) return b.fishCaught - a.fishCaught;
      return b.money - a.money;
    });
    let txt = `*LEADERBOARD FISCHIT*\n\n`;
    const top = rankings.slice(0, 10);
    for (let i = 0; i < top.length; i++) {
      const p = top[i];
      const medal =
        i === 0 ? "1." : i === 1 ? "2." : i === 2 ? "3." : `${i + 1}.`;
      txt += `${medal} @${p.jid}\n  _P${p.prestige} | ${p.fishCaught} peces | ${formatMoney(p.money)}_\n`;
    }
    return send(sock, m, txt.trim(), "Clasificacion", "Mejores jugadores");
  }
}

export { pluginConfig as config, handler };
