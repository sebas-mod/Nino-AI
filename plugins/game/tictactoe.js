import { getDatabase } from '../../src/lib/ourin-database.js'
import { parseMention, delay } from '../../src/lib/ourin-utils.js'
const pluginConfig = {
  name: "tictactoe",
  alias: ["ttt", "xo"],
  category: "game",
  description: "Juega TicTacToe con otro jugador",
  usage: ".tictactoe [nombre de sala] o .ttt",
  example: ".tictactoe",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const boardSymbols = {
  X: "❌",
  O: "⭕",
  1: "1️⃣",
  2: "2️⃣",
  3: "3️⃣",
  4: "4️⃣",
  5: "5️⃣",
  6: "6️⃣",
  7: "7️⃣",
  8: "8️⃣",
  9: "9️⃣",
};

class TicTacToe {
  constructor(playerX = "x", playerO = "o") {
    this.playerX = playerX;
    this.playerO = playerO;
    this._currentTurn = false;
    this._x = 0;
    this._o = 0;
    this.turns = 0;
  }

  get board() {
    return this._x | this._o;
  }

  get currentTurn() {
    return this._currentTurn ? this.playerO : this.playerX;
  }

  get enemyTurn() {
    return this._currentTurn ? this.playerX : this.playerO;
  }

  static check(state) {
    for (let combo of [7, 56, 73, 84, 146, 273, 292, 448])
      if ((state & combo) === combo) return true;
    return false;
  }

  static toBinary(x = 0, y = 0) {
    if (x < 0 || x > 2 || y < 0 || y > 2) throw new Error("invalid position");
    return 1 << (x + 3 * y);
  }

  turn(player = 0, x = 0, y) {
    if (this.board === 511) return -3;
    let pos = 0;
    if (y == null) {
      if (x < 0 || x > 8) return -1;
      pos = 1 << x;
    } else {
      if (x < 0 || x > 2 || y < 0 || y > 2) return -1;
      pos = TicTacToe.toBinary(x, y);
    }
    if (this._currentTurn ^ player) return -2;
    if (this.board & pos) return 0;
    this[this._currentTurn ? "_o" : "_x"] |= pos;
    this._currentTurn = !this._currentTurn;
    this.turns++;
    return 1;
  }

  static render(boardX = 0, boardO = 0) {
    let x = parseInt(boardX.toString(2), 4);
    let y = parseInt(boardO.toString(2), 4) * 2;
    return [...(x + y).toString(4).padStart(9, "0")]
      .reverse()
      .map((value, index) => (value == 1 ? "X" : value == 2 ? "O" : ++index));
  }

  render() {
    return TicTacToe.render(this._x, this._o);
  }

  get winner() {
    let x = TicTacToe.check(this._x);
    let o = TicTacToe.check(this._o);
    return x ? this.playerX : o ? this.playerO : false;
  }
}

if (!global.tictactoeGames) global.tictactoeGames = {};

function isRateLimitError(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("rate-overlimit") ||
    message.includes("rate overlimit") ||
    message.includes("ratelimit") ||
    message.includes("rate limit")
  );
}

function normalizeMentions(text, extraMentions = []) {
  const parsed = parseMention(text).map((number) => `${number}@s.whatsapp.net`);
  const all = [...parsed, ...(extraMentions || [])].filter(Boolean);
  return [...new Set(all)];
}

async function sendWithRetry(action) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (!isRateLimitError(error) || attempt === 2) {
        throw error;
      }
      await delay(1200 * Math.pow(2, attempt));
    }
  }
  throw lastError;
}

async function safeReply(m, text, options = {}) {
  const mentions = normalizeMentions(text, options.mentions || []);
  const replyOptions = { ...options, mentions };
  try {
    return await sendWithRetry(() => m.reply(text, replyOptions));
  } catch (error) {
    if (isRateLimitError(error)) return null;
    throw error;
  }
}

async function safeReact(m, emoji) {
  try {
    await sendWithRetry(() => m.react(emoji));
  } catch (error) {}
}
async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const salaName = args.join(" ").trim();

  // Check if player already in a game
  const existingSala = Object.values(global.tictactoeGames).find(
    (sala) =>
      sala.id.startsWith("ttt_") &&
      [sala.game.playerX, sala.game.playerO].filter(Boolean).includes(m.sender),
  );

  if (existingSala) {
    return safeReply(
      m,
      `❌ Todavia estas en una partida!\n\n` +
        `> Termina tu partida o escribe *nyerah* para rendirte.`,
    );
  }

  // Find waiting sala or create new
  let sala = Object.values(global.tictactoeGames).find(
    (r) =>
      r.state === "WAITING" &&
      r.chat === m.chat &&
      (salaName ? r.name === salaName : true),
  );

  if (sala) {
    // Join existing sala
    sala.game.playerO = m.sender;
    sala.state = "PLAYING";

    const board = renderBoard(sala.game.render());

    const txt =
      `🎮 *ᴛɪᴄ ᴛᴀᴄ ᴛᴏᴇ*\n\n` +
      `Pareja encontrada!\n\n` +
      `❌ @${sala.game.playerX.split("@")[0]}\n` +
      `⭕ @${sala.game.playerO.split("@")[0]}\n\n` +
      `${board}\n\n` +
      `> Turno: @${sala.game.currentTurn.split("@")[0]}\n` +
      `> Responde este mensaje con un numero del 1 al 9\n` +
      `> Escribe *nyerah* para rendirte`;

    await safeReact(m, "🎮");
    await safeReply(m, txt, {
      mentions: [sala.game.playerX, sala.game.playerO],
    });
  } else {
    // Create new sala
    const salaId = "ttt_" + Date.now();

    global.tictactoeGames[salaId] = {
      id: salaId,
      chat: m.chat,
      name: salaName || null,
      game: new TicTacToe(m.sender, null),
      state: "WAITING",
      createdAt: Date.now(),
    };

    await safeReact(m, "🕕");
    await safeReply(
      m,
      `🎮 *ᴛɪᴄ ᴛᴀᴄ ᴛᴏᴇ*\n\n` +
        `Sala creada! Esperando pareja...\n\n` +
        `> Escribe \`.tictactoe${salaName ? " " + salaName : ""}\` para unirte\n` +
        `> La sala expirara en 5 minutos`,
    );

    // Auto delete after 5 min
    setTimeout(() => {
      if (global.tictactoeGames[salaId]?.state === "WAITING") {
        delete global.tictactoeGames[salaId];
      }
    }, 300000);
  }
}

// ==================== Answer Handler ====================
async function answerHandler(m, sock) {
  if (!m.body) return false;

  const text = m.body.trim().toLowerCase();

  // Find player's active game
  const sala = Object.values(global.tictactoeGames).find(
    (r) =>
      r.state === "PLAYING" &&
      r.chat === m.chat &&
      [r.game.playerX, r.game.playerO].filter(Boolean).includes(m.sender),
  );

  if (!sala) return false;

  const db = getDatabase();

  // Handle surrender
  if (text === "nyerah" || text === "surrender" || text === "give up") {
    const winner =
      m.sender === sala.game.playerX ? sala.game.playerO : sala.game.playerX;
    const loser = m.sender;

    // Reward winner
    const winnerData = db.getUser(winner) || {};
    winnerData.koin = (winnerData.koin || 0) + 500;
    db.setUser(winner, winnerData);

    await safeReact(m, "🏳️");
    await safeReply(
      m,
      `🏳️ *RENDICION!*\n\n` +
        `@${loser.split("@")[0]} se rindio!\n` +
        `@${winner.split("@")[0]} gana! +Rp 500`,
      { mentions: [winner, loser] },
    );

    delete global.tictactoeGames[sala.id];
    return true;
  }

  // Check if valid move
  const move = parseInt(text);
  if (isNaN(move) || move < 1 || move > 9) return false;

  // Check if it's player's turn
  if (sala.game.currentTurn !== m.sender) {
    await safeReply(m, "❌ No es tu turno!");
    return true;
  }

  // Make move
  const player = sala.game.playerX === m.sender ? 0 : 1;
  const result = sala.game.turn(player, move - 1);

  if (result === 0) {
    await safeReply(m, "❌ La posicion ya esta ocupada!");
    return true;
  }

  if (result === -1) {
    await safeReply(m, "❌ Posicion no valida!");
    return true;
  }

  const board = renderBoard(sala.game.render());
  const winner = sala.game.winner;
  const isTie = sala.game.board === 511 && !winner;

  if (winner) {
    const loser =
      winner === sala.game.playerX ? sala.game.playerO : sala.game.playerX;

    // Reward winner
    const winnerData = db.getUser(winner) || {};
    winnerData.koin = (winnerData.koin || 0) + 1000;
    db.setUser(winner, winnerData);

    await safeReact(m, "🎉");
    await safeReply(
      m,
      `🎉 *FIN DEL JUEGO!*\n\n` +
        `${board}\n\n` +
        `🏆 @${winner.split("@")[0]} gana! +Rp 1.000`,
      { mentions: [winner, loser] },
    );

    delete global.tictactoeGames[sala.id];
    return true;
  }

  if (isTie) {
    await safeReact(m, "🤝");
    await safeReply(
      m,
      `🤝 *EMPATE!*\n\n` + `${board}\n\n` + `> No hay ganador!`,
      { mentions: [sala.game.playerX, sala.game.playerO] },
    );

    delete global.tictactoeGames[sala.id];
    return true;
  }

  // Continue game
  await safeReply(
    m,
    `🎮 *ᴛɪᴄ ᴛᴀᴄ ᴛᴏᴇ*\n\n` +
      `${board}\n\n` +
      `> Turno: @${sala.game.currentTurn.split("@")[0]}`,
    { mentions: [sala.game.currentTurn] },
  );

  return true;
}

// ==================== Helper ====================
function renderBoard(arr) {
  const cells = arr.map((cell) => boardSymbols[String(cell)] || cell);
  return `┌───┬───┬───┐
│ ${cells[0]} │ ${cells[1]} │ ${cells[2]} │
├───┼───┼───┤
│ ${cells[3]} │ ${cells[4]} │ ${cells[5]} │
├───┼───┼───┤
│ ${cells[6]} │ ${cells[7]} │ ${cells[8]} │
└───┴───┴───┘`;
}

export { pluginConfig as config, handler, answerHandler }
