import { games } from '../../src/lib/ourin-games.js'

games.register('susunkata', {
    alias: ['susun', 'scramble'],
    emoji: '🔠',
    title: 'ORDENA LA PALABRA',
    description: 'Ordena la palabra desde las letras'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('susunkata')
export { pluginConfig as config, handler, answerHandler }
