import config from '../../config.js'
import path from 'path'
import fs from 'fs'
const pluginConfig = {
    name: 'tqto',
    alias: ['thanksto', 'credits', 'kredit'],
    category: 'main',
    description: 'Muestra lista de colaboradores del bot',
    usage: '.tqto',
    example: '.tqto',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const botName = config.bot?.name || 'Nino AI'
    const version = config.bot?.version || '1.0.0'
    const developer = config.bot?.developer || 'Lucky Archz'
    
    const credits = [
        { name: 'hyuuOkkotsuX', role: 'Staff principal', icon: '👨‍💻' },
        { name: 'Zann', role: 'Creador de Nino AI MD y APK Stardem Nino AI', icon: '👨‍💻' },
        { name: 'SenzOkkotsu', role: 'Desarrollador asistente', icon: '👨‍💻' },
        { name: 'Ell', role: 'Desarrollador asistente', icon: '👨‍💻' },
        { name: 'Aqell', role: 'Desarrollador SC BUG Nino AI Glitch', icon: '👨‍💻' },
        { name: 'Mobbc', role: 'Staff', icon: '👨‍💻' },
        { name: 'Sanxz', role: 'Tangan Kanan', icon: '👨‍💻' },
        { name: 'Dinz', role: 'Tangan Kanan', icon: '👨‍💻' },
        { name: 'Forone Store', role: 'Tangan Kanan', icon: '🛒' },
        { name: 'Rakaa', role: 'Tangan Kanan', icon: '🛒' },
        { name: 'Sabila', role: 'Tangan Kanan', icon: '👩‍💻' },
        { name: 'Syura Store', role: 'Tangan Kanan', icon: '👩‍💻' },
        { name: 'Xero', role: 'Tangan Kanan', icon: '👩‍💻' },
        { name: 'Lyoraaa', role: 'Owner', icon: '👩‍💻' },
        { name: 'Danzzz', role: 'Owner', icon: '👨‍💻' },
        { name: 'Muzan', role: 'Owner', icon: '👨‍💻' },
        { name: 'Gray', role: 'Owner', icon: '👨‍💻' },
        { name: 'Baim', role: 'Moderador', icon: '👨‍💻' },
        { name: 'Vadel', role: 'Moderador', icon: '👨‍💻' },
        { name: 'Fahmi', role: 'Moderador', icon: '👨‍💻' },
        { name: 'Caca', role: 'Moderador', icon: '👨‍💻' },
        { name: 'panceo', role: 'Socio', icon: '🛒' },
        { name: 'KingSatzID', role: 'Socio', icon: '🛒' },
        { name: 'Dashxz', role: 'Socio', icon: '🛒' },
        { name: 'This JanzZ', role: 'Socio', icon: '🛒' },
        { name: 'Ahmad', role: 'Socio', icon: '🛒' },
        { name: 'nopal', role: 'Socio', icon: '🛒' },
        { name: 'tuadit', role: 'Socio', icon: '🛒' },
        { name: 'andry', role: 'Socio', icon: '🛒' },
        { name: 'kingdanz', role: 'Socio', icon: '🛒' },
        { name: 'patih', role: 'Socio', icon: '🛒' },
        { name: 'Ryuu', role: 'Socio', icon: '🛒' },
        { name: 'Pororo', role: 'Socio', icon: '🛒' },
        { name: 'Janzz', role: 'Socio', icon: '🛒' },
        { name: 'Morvic', role: 'Socio', icon: '🛒' },
        { name: 'zylnzee', role: 'Socio', icon: '🛒' },
        { name: 'Farhan', role: 'Socio', icon: '🛒' },
        { name: 'Alizz', role: 'Socio', icon: '🛒' },
        { name: 'Kiram', role: 'Socio', icon: '🛒' },
        { name: 'Minerva', role: 'Socio', icon: '🛒' },
        { name: 'Riam', role: 'Socio', icon: '🛒' },
        { name: 'Febri', role: 'Socio', icon: '🛒' },
        { name: 'Kuze', role: 'Socio', icon: '🛒' },
        { name: 'Oscar Dani', role: 'Socio', icon: '🛒' },
        { name: 'Udun', role: 'Socio', icon: '🛒' },
        { name: 'Zanspiw', role: 'Youtuber', icon: '🌐' },
        { name: 'Danzz Nano', role: 'Youtuber', icon: '🌐' },
        { name: 'Otros youtubers que ya hicieron review', role: 'Youtuber', icon: '🌐' },
        { name: 'Todos ustedes', role: 'Los mejores', icon: '🌐' },
        { name: 'Comunidad open source', role: 'Librerias y herramientas', icon: '🌐' },

    ]
    
    const headers = ['No', 'Nombre', 'Rol / Nivel']
    const rows = credits.map((c, i) => [i + 1, c.name, c.role])
    
    await sock.sendTable(m.chat, "EQUIPO NINO AI", headers, rows, m, { 
        headerText: `${config.bot?.name}\n\n- A continuacion esta la lista de personas que nos ayudaron a crear este bot y nos dieron soporte\n`, 
        footer: '\n*Gracias por apoyarnos hasta este punto :b*' 
    })
}

export { pluginConfig as config, handler }
