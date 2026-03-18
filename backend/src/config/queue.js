import { PgBoss } from 'pg-boss';
import { config } from './env.js';

if (!config.DATABASE_URL) {
    console.warn(' DATABASE_URL is missing. Job scheduling will not work.');
}


/**
 * The initialized pg-boss job queue instance.
 * @constant
 * @type {PgBoss}
*/
export const queue = new PgBoss(config.DATABASE_URL);

queue.on('error', error => console.error(' pg-boss background error:', error));
/**
 * Starts the pg-boss queue and prepares it to process jobs.
 * @async
 * @function startQueue
 */
export const startQueue = async () => {
    try {

        await queue.start();

        await queue.createQueue('toggle-flag');
        console.log(' pg-boss job queue started successfully.');
    } catch (error) {
        console.error(' Failed to start pg-boss:', error.message);
    }
};