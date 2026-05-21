import { games } from '../../src/lib/ourin-games.js'

games.register('asahotak', {
    alias: ['asah', 'quiz'],
    emoji: '🧠',
    title: 'ASAH OTAK',
    description: 'Juego de agilidad mental - adivina la respuesta'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('asahotak')
export { pluginConfig as config, handler, answerHandler }
