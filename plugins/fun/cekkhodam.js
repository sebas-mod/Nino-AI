import fs from 'fs'
import path from 'path'
import gtts from 'gtts'
const pluginConfig = {
    name: 'cekkhodam',
    alias: ['khodam', 'cekhodam'],
    category: 'fun',
    description: 'Revisa el khodam propio o de otra persona',
    usage: '.cekkhodam o responde el mensaje de alguien',
    example: '.cekkhodam',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}
const KHODAMS = [
    { name: "Tigre Blanco", meaning: "Eres fuerte y valiente como un tigre, porque tus antepasados te heredaron una gran fuerza." },
    { name: "Lampara Dormida", meaning: "Pareces con sueno, pero siempre das una luz calida." },
    { name: "Panda Sin Dientes", meaning: "Eres adorable y siempre haces sonreir a la gente con tus rarezas." },
    { name: "Pato de Goma", meaning: "Siempre estas tranquilo y alegre, capaz de enfrentar olas de problemas con una sonrisa." },
    { name: "Tortuga Ninja", meaning: "Eres agil y resistente, listo para proteger a los debiles con tu fuerza de combate." },
    { name: "Gato de Refrigerador", meaning: "Eres misterioso y siempre apareces en lugares inesperados." },
    { name: "Jabon Perfumado", meaning: "Siempre llevas aroma y frescura a donde vayas." },
    { name: "Hormiga Pequena", meaning: "Trabajas duro y siempre se puede confiar en ti en cualquier situacion." },
    { name: "Cupcake Arcoiris", meaning: "Eres dulce y lleno de color, siempre traes felicidad y alegria." },
    { name: "Robot Mini", meaning: "Eres avanzado y siempre estas listo para ayudar con inteligencia tecnologica." },
    { name: "Pez Volador", meaning: "Eres unico y lleno de sorpresas, siempre superas los limites." },
    { name: "Pollo Frito", meaning: "Siempre eres querido y esperado por mucha gente, lleno de sabor en cada paso." },
    { name: "Cucaracha Voladora", meaning: "Siempre sorprendes y armas alboroto en toda la sala." },
    { name: "Cabra Taladro", meaning: "Eres unico y siempre haces reir a la gente con tus comportamientos raros." },
    { name: "Galleta Crujiente", meaning: "Siempre haces que el ambiente sea mas divertido y agradable." },
    { name: "Alcancia de Cerdito", meaning: "Siempre guardas sorpresas dentro de ti." },
    { name: "Armario Viejo", meaning: "Estas lleno de historias y recuerdos del pasado." },
    { name: "Cafe con Leche", meaning: "Eres dulce y siempre animas a quienes te rodean." },
    { name: "Escoba de Varillas", meaning: "Eres fuerte y siempre confiable para limpiar problemas." },
    { name: "Indomie Frito", meaning: "Siempre llenas y haces feliz." },
    { name: "Helado Derretido", meaning: "Siempre suavizas el ambiente con tu dulzura." },
    { name: "Albóndiga Persistente", meaning: "Siempre eres perseverante y firme al enfrentar problemas." },
    { name: "Pegamento Super", meaning: "Siempre te mantienes pegado en situaciones complicadas." },
    { name: "Salsa Dulce", meaning: "Siempre das un toque dulce a la vida." },
    { name: "Jabon de Bano", meaning: "Siempre limpio y perfumado." },
    { name: "Cafe Derramado", meaning: "Siempre con energia, aunque a veces desordenado." },
    { name: "Gato Callejero", meaning: "Siempre independiente y lleno de aventuras." },
    { name: "Jamu Amargo", meaning: "Siempre da fuerza aunque al principio no sepa bien." },
    { name: "Te en Bolsa", meaning: "Siempre da calidez al corazon." },
    { name: "Moto Astrea", meaning: "Siempre fiel y resistente." },
    { name: "Fideos Instantaneos", meaning: "Siempre rapido y satisfactorio." },
    { name: "Pastel al Vapor", meaning: "Siempre suave y dulce." },
    { name: "Tofu Redondo", meaning: "Siempre rico en cualquier situacion." },
    { name: "Arroz Uduk", meaning: "Siempre combina en cualquier momento." },
    { name: "Leon Coronado", meaning: "Naciste como lider, con la fuerza y sabiduria de un rey." },
    { name: "Pantera", meaning: "Eres misterioso y fuerte, como un felino que rara vez se ve pero siempre esta alerta." },
    { name: "Caballo Dorado", meaning: "Eres valioso y fuerte, listo para correr hacia el exito." },
    { name: "Aguila Azul", meaning: "Tienes una vision aguda y puedes ver oportunidades desde lejos." },
    { name: "Dragon Arcoiris", meaning: "Eres resistente y tienes fuerza para proteger y atacar." },
    { name: "Elefante Blanco", meaning: "Eres sabio y tienes gran fuerza, simbolo de valentia y firmeza." },
    { name: "Toro Magico", meaning: "Eres fuerte y lleno de energia, sin miedo a los obstaculos." },
    { name: "Ventilador", meaning: "Siempre da aire fresco." },
    { name: "Olla Arrocera", meaning: "Siempre cocina el arroz a la perfeccion." },
    { name: "Honda Beat", meaning: "Siempre agil en la calle." },
    { name: "Sandalia", meaning: "Siempre relajada y comoda." },
    { name: "Almohada Larga", meaning: "Siempre comoda en un abrazo." },
    { name: "Perro Rastreador", meaning: "Eres leal y dedicado, siempre encuentras el camino hacia tu objetivo." }
]
function getRandomKhodam() {
    const idx = Math.floor(Math.random() * KHODAMS.length)
    return KHODAMS[idx]
}
function handler(m, { sock }) {
    let targetJid = m.sender
    let targetName = m.pushName || m.sender.split('@')[0]
    if (m.quoted) {
        targetJid = m.quoted.sender
        targetName = m.quoted.pushName || targetJid.split('@')[0]
    } else if (m.mentionedJid?.[0]) {
        targetJid = m.mentionedJid[0]
        targetName = targetJid.split('@')[0]
    } else if(m.text) {
        targetName = m.text
    }
    const khodam = getRandomKhodam()
    let txt = `Hola ${targetName || ""}, tu khodam es ${khodam.name}. Este khodam significa: ${khodam.meaning}`
    const tts = new gtts(txt, 'id')
    const id = Date.now()
    const tempPath = path.join(process.cwd(), 'temp', `khodam-${id}.mp3`)
    tts.save(tempPath, async function (err) {
        if (err) return console.log(err)
        await sock.sendMedia(m.chat, fs.readFileSync(tempPath), null, m, { type: 'audio' })
        try {
            fs.unlinkSync(tempPath)
        } catch (error) {
        }
    })
}
export { pluginConfig as config, handler }
