import { games } from '../../src/lib/ourin-games.js'

games.register('tebaktebakan', {
    alias: ['tbt', 'tebak2an', 'receh'],
    emoji: '😄',
    title: 'ADIVINANZA',
    description: 'Adivinanzas sencillas'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebaktebakan')
export { pluginConfig as config, handler, answerHandler }
