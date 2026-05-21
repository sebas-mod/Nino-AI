import { games } from '../../src/lib/ourin-games.js'

games.register('riddle', {
    alias: ['rd', 'tebaktebak', 'riddles'],
    emoji: '❓',
    title: 'ACERTIJO',
    description: 'Acertijos y adivinanzas'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('riddle')
export { pluginConfig as config, handler, answerHandler }
