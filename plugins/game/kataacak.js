import { games } from '../../src/lib/ourin-games.js'

games.register('kataacak', {
    alias: ['ka', 'acakkata'],
    emoji: '🔤',
    title: 'PALABRA DESORDENADA',
    description: 'Ordena las letras mezcladas'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('kataacak')
export { pluginConfig as config, handler, answerHandler }
