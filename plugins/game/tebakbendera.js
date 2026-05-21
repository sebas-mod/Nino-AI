import { games } from '../../src/lib/ourin-games.js'

games.register('tebakbendera', {
    alias: ['tbendera', 'flag'],
    emoji: '🏳️',
    title: 'ADIVINA LA BANDERA',
    description: 'Adivina el pais desde la bandera',
    dataFile: 'tebakbendera2.json',
    answerField: 'name',
    hasImage: true
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakbendera')
export { pluginConfig as config, handler, answerHandler }
