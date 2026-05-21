import { games } from '../../src/lib/ourin-games.js'

games.register('tebaknegara', {
    alias: ['tn', 'guesscountry'],
    emoji: '🌍',
    title: 'ADIVINA EL PAIS',
    description: 'Adivina el nombre del pais'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebaknegara')
export { pluginConfig as config, handler, answerHandler }
