import { games } from '../../src/lib/ourin-games.js'

games.register('tebakkimia', {
    alias: ['kimia', 'chemistry', 'unsur'],
    emoji: '🧪',
    title: 'ADIVINA QUIMICA',
    description: 'Adivina el elemento quimico',
    questionField: 'unsur',
    answerField: 'lambang'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakkimia')
export { pluginConfig as config, handler, answerHandler }
