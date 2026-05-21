import { games } from '../../src/lib/ourin-games.js'

games.register('tebakhewan', {
    alias: ['th', 'guessanimal'],
    emoji: '🐾',
    title: 'ADIVINA EL ANIMAL',
    description: 'Adivina el nombre del animal',
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakhewan')
export { pluginConfig as config, handler, answerHandler }
