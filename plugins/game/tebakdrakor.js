import { games } from '../../src/lib/ourin-games.js'

games.register('tebakdrakor', {
    alias: ['drakor', 'kdrama'],
    emoji: '🇰🇷',
    title: 'ADIVINA EL K-DRAMA',
    description: 'Adivina el titulo del drama coreano',
    hasImage: true
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakdrakor')
export { pluginConfig as config, handler, answerHandler }
