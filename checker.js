import cron from 'node-cron';
import fetch from 'node-fetch';
import { readIniFileSync } from 'read-ini-file';
import path from 'path';
import { parse } from 'node-html-parser';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import authorize from './authorize.js';

const gmail = google.gmail('v1');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FUNC_MAP = {
    'NOTHAS': notHas,
    'HAS': has
}

const task = cron.schedule('* * * * *', async () => {
    const fixture = path.join(__dirname, 'config.ini');
    const info = readIniFileSync(fixture);

    const response = await fetch(info.site.href, { method: 'GET' });
    const data = await response.text();
    const root = parse(data);
    const targets = root.querySelectorAll(info.site.target);
    let contexts = Array.prototype.slice.call(targets)
        .filter(e => decodeURIComponent(e.innerHTML.replace(/(\&nbsp;| |\r|\n)/g, '')).length)
        .map(e => e.innerHTML);
    const conditions = Object.values(info.condition).map(e => e.split(' '));
    conditions.forEach(con => {
        const [conType, text] = con;
        const filterFunction = FUNC_MAP[conType];
        contexts = filterFunction?.(contexts, text) || contexts;
    });

    if (contexts.length) {
        authorize().then((auth) => sendMail(auth, info, contexts)).catch(console.error);
        task.stop();
    }
});


async function sendMail(auth, info, append) {
    const { target, subject, context } = info.email;
    const totalContext = context.split('<br/>').map(e => e + "\r\n").join('');
    console.log(totalContext);
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: btoa(
                "From: " + target + "\r\n" +
                "To: " + target + "\r\n" +
                "Subject: " + subject + "\r\n\r\n" +
                totalContext
            ).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
        }
    });
}

function notHas(collection, text) {
    return collection.filter(e => e.indexOf(text) == -1);
}

function has(collection, text) {
    return collection.filter(e => e.indexOf(text) !== -1);
}