const pluginConfig = {
  name: "kalkulatormbg",
  alias: ["kkmbg"],
  category: "tools",
  description: "Calcula duración y comparación de fondos para Makan Bergizi Gratis (MBG)",
  usage: ".kkmbg <jumlah_uang>",
  example: ".kkmbg 1000000000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

function hitungMBG(uang) {
  const pengeluaranPerHari = 319600000000;
  const hargaPorsi = 15000;

  const hariFloat = uang / pengeluaranPerHari;

  const tahun = Math.floor(hariFloat / 365);
  const bulan = Math.floor((hariFloat % 365) / 30);
  const hari = Math.floor(hariFloat % 30);

  const jam = Math.floor((hariFloat % 1) * 24);
  const menit = Math.floor(((hariFloat * 24) % 1) * 60);
  const detik = (((hariFloat * 24 * 60) % 1) * 60);

  const porciones = Math.floor(uang / hargaPorsi);

  const umrDKI = 5400000;
  const umrJateng = 2040000;
  const guruHonorer = 300000;

  const persenDKI = ((uang / umrDKI) * 100).toFixed(1);
  const persenJateng = ((uang / umrJateng) * 100).toFixed(1);
  const kaliGuru = (uang / guruHonorer).toFixed(1);

  const pemain = [
    { nama: "Cristiano Ronaldo (Al Nassr)", gaji: 4500000000000 },
    { nama: "Lionel Messi (Inter Miami)", gaji: 2100000000000 },
    { nama: "Karim Benzema (Al-Ittihad)", gaji: 1700000000000 },
    { nama: "Kylian Mbappé (Real Madrid)", gaji: 1500000000000 },
    { nama: "Erling Haaland (Man City)", gaji: 1300000000000 },
    { nama: "Vinícius Jr. (Real Madrid)", gaji: 960000000000 },
    { nama: "Mohamed Salah (Liverpool)", gaji: 880000000000 },
    { nama: "Sadio Mané (Al Nassr)", gaji: 864000000000 },
    { nama: "Jude Bellingham (Real Madrid)", gaji: 704000000000 },
    { nama: "Lamine Yamal (Barcelona)", gaji: 688000000000 }
  ];

  const perbandinganPemain = pemain.map(p => {
    const persen = ((uang / p.gaji) * 100);
    return {
      nama: p.nama,
      gaji: p.gaji,
      persen: persen < 0.0001 ? "0%" : persen.toFixed(4) + "%"
    };
  });

  return {
    durasi: {
      tahun,
      bulan,
      hari,
      jam,
      menit,
      detik: detik.toFixed(2)
    },
    pengeluaran: pengeluaranPerHari,
    porciones,
    gajiIndonesia: {
      dki: persenDKI + "%",
      jateng: persenJateng + "%",
      guru: kaliGuru + "x"
    },
    pemain: perbandinganPemain
  };
}

function formatRupiah(angka) {
  const formatted = angka.toLocaleString('id-ID');
  return angka < 1000 ? `${formatted} Perak` : `Rp ${formatted}`;
}

async function handler(m, { args }) {
  if (!args[0]) {
    let txt = `🧮 *KALKULATOR MBG (Makan Bergizi Gratis)* 🧮\n\n`;
    txt += `Hola, ¿quieres saber cuánto tiempo tu dinero podría cubrir el programa Makan Bergizi Gratis en Indonesia?\n\n`;
    txt += `*Modo de uso:*\n`;
    txt += `👉 \`${m.prefix}kkmbg <monto de dinero>\`\n\n`;
    txt += `*Ejemplo:*\n`;
    txt += `\`${m.prefix}kkmbg 1000000000\``;
    return m.reply(txt);
  }

  await m.react("🧮");

  try {
    const uang = Number(args[0].replace(/[^0-9]/g, ''));
    if (isNaN(uang) || uang <= 0) {
      return m.reply("❌ Ingresa una cantidad válida de dinero. Solo números, por ejemplo 500000.");
    }

    const data = hitungMBG(uang);

    let contentTxt = `💰 *Dana :* ${formatRupiah(uang)}\n\n`;
    contentTxt += `⏳ *Duración MBG:*\n`;
    contentTxt += `${data.durasi.tahun} AÑOS, ${data.durasi.bulan} MESES, ${data.durasi.hari} DÍAS\n`;
    contentTxt += `${data.durasi.jam} HORAS, ${data.durasi.menit} MINUTOS, ${data.durasi.detik} SEGUNDOS\n`;
    contentTxt += `_(Basado en un gasto de ~Rp ${(data.pengeluaran / 1000000000).toFixed(1)} mil millones/día)_\n\n`;
    
    contentTxt += `🍱 *Equivalente en porciones de comida:*\n`;
    contentTxt += `${data.porciones.toLocaleString('id-ID')} porciones (@ Rp 15.000/porciones)\n\n`;

    contentTxt += `📊 *Comparación con salarios de Indonesia:*\n`;
    contentTxt += `🏢 UMR DKI Jakarta (Rp 5,4 Jt/bulan): ${data.gajiIndonesia.dki}\n`;
    contentTxt += `🏭 UMR Jawa Tengah (Rp 2,04 Jt/bulan): ${data.gajiIndonesia.jateng}\n`;
    contentTxt += `👨‍🏫 Salario de profesor honorario (Rp 300rb/bulan): ${data.gajiIndonesia.guru}\n\n`;

    contentTxt += `⚽ *Comparación con salarios de futbolistas:*\n`;
    for (let p of data.pemain) {
      contentTxt += `🏆 ${p.nama}\n`;
      contentTxt += `💵 ${formatRupiah(p.gaji)}/tahun\n`;
      contentTxt += `📈 Porcentaje: ${p.persen}\n\n`;
    }

    let txt = `🍽️ *RESULTADO DEL CÁLCULO MBG* 🍽️\n\n`;
    txt += contentTxt.trim().split("\n").map(line => line.trim() ? `${line}` : ``).join("\n");

    await m.reply(txt);
    await m.react("✅");
  } catch (e) {
    m.reply(`❌ Lo siento, ocurrió un error al calcular. 😭\nError: ${e.message}`);
  }
}

export { pluginConfig as config, handler };
