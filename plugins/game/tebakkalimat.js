import { games } from '../../src/lib/ourin-games.js'

games.register('tebakkalimat', {
    alias: ['tkl', 'peribahasa'],
    emoji: '📖',
    title: 'ADIVINA LA FRASE',
    description: 'Adivina la frase o el refran'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakkalimat')
export { pluginConfig as config, handler, answerHandler }
