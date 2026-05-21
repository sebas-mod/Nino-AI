import { games } from '../../src/lib/ourin-games.js'

games.register('siapakahaku', {
    alias: ['siapa', 'whoami'],
    emoji: '🎭',
    title: 'QUIEN SOY',
    description: 'Adivina desde la descripcion'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('siapakahaku')
export { pluginConfig as config, handler, answerHandler }
