import {
  getRandomItem,
  createSession,
  getSession,
  endSession,
  hasActiveSession,
  setSessionTimer,
  getRemainingTime,
  formatRemainingTime,
  isSurrender,
  isReplyToGame,
  getRandomReward,
} from "../../src/lib/ourin-game-data.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "family100",
  alias: ["f100", "survei"],
  category: "game",
  description: "La encuesta dice! Adivina las respuestas principales",
  usage: ".family100",
  example: ".family100",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const chatId = m.chat;

  if (hasActiveSession(chatId)) {
    const session = getSession(chatId);
    if (session && session.gameType === "family100") {
      const remaining = getRemainingTime(chatId);
      const answered = session.answered || [];
      const total = session.question.respuestas.length;

      let text = `La sesion de Family 100 sigue activa! 😱✨\n\n`;
      text += `*${session.question.soal}*\n\n`;
      text += `Respondidas: *${answered.length} de ${total}*\n`;
      answered.forEach((ans, i) => {
        text += `${i + 1}. ✅ ${ans}\n`;
      });
      for (let i = answered.length; i < total; i++) {
        text += `${i + 1}. ❓ ???\n`;
      }
      text += `\nTiempo restante: *${formatRemainingTime(remaining)}* ⏳\n`;
      text += `Responde ese mensaje rapido para contestar! 🔥`;
      await m.reply(text);
      return;
    }
  }

  const question = getRandomItem("family100.json");
  if (!question) {
    await m.reply("Perdon, las preguntas del juego estan vacias 😭💔");
    return;
  }

  const total = question.respuestas.length;

  let text = `Hora de jugar *FAMILY 100*! 🎉✨\n\n`;
  text += `*Pregunta:* ${question.soal}\n\n`;
  text += `Total de respuestas: *${total}* 📝\n`;
  for (let i = 0; i < total; i++) {
    text += `${i + 1}. ❓ ???\n`;
  }
  text += `\nSolo tienes *120 segundos*! ⏱️\n`;
  text += `Recompensa: *EXP* y *Koin* aleatorios por cada respuesta correcta! 🎁💸\n\n`;
  text += `Como jugar: responde directamente este mensaje con tu respuesta, o responde *nyerah* si quieres rendirte 🏳️😂`;

  const sentMsg = await m.reply(text);

  const session = createSession(
    chatId,
    "family100",
    question,
    sentMsg.key,
    120000,
  );
  session.answered = [];
  session.answeredBy = {};

  setSessionTimer(chatId, async () => {
    const sess = getSession(chatId);
    const answered = sess?.answered || [];
    const remaining = question.respuestas.filter(
      (j) => !answered.includes(j.toLowerCase()),
    );

    let timeoutText = `Que pena, se acabo el tiempo! 😭😭⏱️\n\n`;
    timeoutText += `Adivinaron *${answered.length}* de *${question.respuestas.length}* respuestas! ✨\n\n`;
    if (remaining.length > 0) {
      timeoutText += `Estas son las respuestas que faltaron:\n`;
      remaining.forEach((ans) => {
        timeoutText += `• ${ans}\n`;
      });
    }
    timeoutText += `\nGracias por jugar, nos vemos en la proxima sesion! 💖🎉`;

    endSession(chatId);
    await sock.sendMessage(chatId, { text: timeoutText }, { quoted: sentMsg });
  });
}

async function family100AnswerHandler(m, sock) {
  const chatId = m.chat;
  const session = getSession(chatId);

  if (!session || session.gameType !== "family100") return false;
  if (!isReplyToGame(m, session)) return false;

  const userAnswer = (m.body || "").toLowerCase().trim();
  if (!userAnswer || userAnswer.startsWith(".")) return false;

  if (isSurrender(userAnswer)) {
    const answered = session.answered || [];
    const remaining = session.question.respuestas.filter(
      (j) => !answered.includes(j.toLowerCase()),
    );

    let text = `Se rindieron? 🥺🏳️\n\n`;
    text += `Ya habian adivinado *${answered.length}* de *${session.question.respuestas.length}*! 👏\n\n`;
    if (remaining.length > 0) {
      text += `Aqui estan las respuestas restantes:\n`;
      remaining.forEach((ans) => {
        text += `• ${ans}\n`;
      });
    }
    text += `\nNo pasa nada, la proxima seguro sale mejor! 💖✨`;

    endSession(chatId);
    await m.reply(text);
    return true;
  }

  const correctAnswers = session.question.respuestas.map((j) => j.toLowerCase());
  const answered = session.answered || [];

  if (answered.includes(userAnswer)) {
    await m.react("⚠️");
    await m.reply(`La respuesta *${userAnswer}* ya fue respondida antes! Busca otra 😂✨`);
    return true;
  }

  const matchIndex = correctAnswers.findIndex((ans) => {
    const similarity = getSimilarity(ans, userAnswer);
    return (
      similarity >= 0.8 || ans.includes(userAnswer) || userAnswer.includes(ans)
    );
  });

  if (matchIndex !== -1) {
    const originalAnswer = session.question.respuestas[matchIndex];

    if (!answered.includes(originalAnswer.toLowerCase())) {
      session.answered.push(originalAnswer.toLowerCase());
      session.answeredBy[originalAnswer.toLowerCase()] = m.sender;

      const db = getDatabase();
      const user = db.getUser(m.sender);

      const answerReward = getRandomReward();
      if (!user.rpg) user.rpg = {};
      await addExpWithLevelCheck(sock, m, db, user, answerReward.exp);
      db.updateKoin(m.sender, answerReward.koin);
      db.save();

      if (session.answered.length === correctAnswers.length) {
        endSession(chatId);

        const participants = Object.values(session.answeredBy);
        const uniqueParticipants = [...new Set(participants)];

        let text = `INCREIBLE! Adivinaron todas las respuestas! 🎉🔥✨\n\n`;
        text += `*Pregunta:* ${session.question.soal}\n\n`;
        session.question.respuestas.forEach((ans, i) => {
          const who = session.answeredBy[ans.toLowerCase()];
          text += `${i + 1}. ✅ ${ans} - @${who?.split("@")[0] || "?"}\n`;
        });
        text += `\n🎊 Felicitaciones a todos los que participaron! Que gran mente! 🧠💯`;

        await m.reply(text, { mentions: uniqueParticipants });
        return true;
      }

      const total = session.question.respuestas.length;
      let text = `Correctisimo! ✅🎉\n@${m.sender.split("@")[0]} recibe *+${answerReward.exp} EXP* & *+${answerReward.koin} Koin*! 💸✨\n\n`;
      text += `*Pregunta:* ${session.question.soal}\n\n`;
      session.question.respuestas.forEach((ans, i) => {
        const isAnswered = session.answered.includes(ans.toLowerCase());
        if (isAnswered) {
          text += `${i + 1}. ✅ ${ans}\n`;
        } else {
          text += `${i + 1}. ❓ ???\n`;
        }
      });
      text += `\nVamos, quedan *${total - session.answered.length}* respuestas! 🔥⏱️`;

      await m.reply(text, { mentions: [m.sender] });
      return true;
    }
  }

  await m.react("❌");
  await m.reply(`❌ Incorrecto! Piensalo un poco mas 😂🧠`);
  return true;
}

function getSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const costs = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }

  return (longer.length - costs[shorter.length]) / longer.length;
}

export { pluginConfig as config, handler, family100AnswerHandler };
