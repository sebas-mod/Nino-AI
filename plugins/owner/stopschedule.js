import { stopSchedulerByName, getFullSchedulerStatus } from '../../src/lib/ourin-scheduler.js'
import { stopSholatScheduler } from '../../src/lib/ourin-sholat-scheduler.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'stopschedule',
    alias: ['stopscheduler', 'schedstop', 'pauseschedule'],
    category: 'owner',
    description: 'Detener scheduler especifico o todos',
    usage: '.stopschedule <nama|all>',
    example: '.stopschedule sholat',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock, args }) {
    try {
        const target = args[0]?.toLowerCase();
        
        if (!target) {
            const helpText = `🛑 *sᴛᴏᴘ sᴄʜᴇᴅᴜʟᴇʀ*

*Usage:*
\`.stopschedule <nama>\`

*Available schedulers:*
• \`limitreset\` - Daily Limit Reset
• \`groupschedule\` - Group Schedule
• \`sewa\` - Sewa Checker
• \`messages\` - Scheduled Messages
• \`sholat\` - Sholat Scheduler
• \`all\` - Todos los schedulers

*Example:*
\`.stopschedule sholat\`
\`.stopschedule all\``;
            
            await m.reply(helpText);
            return;
        }
        
        if (target === 'sholat') {
            const db = getDatabase();
            const wasEnabled = db.setting('autoSholat');
            
            if (!wasEnabled) {
                await m.reply(`ℹ️ El scheduler de sholat ya esta inactivo`);
                return;
            }
            
            stopSholatScheduler();
            db.setting('autoSholat', false);
            
            await m.reply(`🛑 *sᴄʜᴇᴅᴜʟᴇʀ ᴅɪʜᴇɴᴛɪᴋᴀɴ*

> Scheduler: *Sholat Scheduler*
> Status: ❌ Dihentikan

_Usa \`.startschedule sholat\` para volver a activarlo_`);
            return;
        }
        
        if (target === 'all') {
            stopSholatScheduler();
            const db = getDatabase();
            db.setting('autoSholat', false);
        }
        
        const result = stopSchedulerByName(target);
        
        if (result.stopped) {
            await m.reply(`🛑 *sᴄʜᴇᴅᴜʟᴇʀ ᴅɪʜᴇɴᴛɪᴋᴀɴ*

> Scheduler: *${result.name}*
> Status: ❌ Dihentikan

_Usa \`.startschedule ${target}\` para volver a activarlo_`);
        } else {
            await m.reply(`❌ Scheduler no encontrado o ya inactivo

Usa \`.stopschedule\` para ver lista de schedulers`);
        }
    } catch (error) {
        console.error('[StopSchedule Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }