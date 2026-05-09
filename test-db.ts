import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './lib/db/schema';
import dotenv from 'dotenv';
import dns from 'dns';
import https from 'https';
const fetchNode = require('node-fetch');

dotenv.config({ path: '.env.local' });

const customLookup = (hostname: string, options: any, callback: any) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  console.log("Looking up:", hostname);
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  dns.resolve4(hostname, (err, addresses) => {
    if (err) {
      return callback(err);
    }
    if (!addresses || addresses.length === 0) {
      return callback(new Error('Not found'));
    }
    if (options && options.all) {
      callback(null, addresses.map(a => ({ address: a, family: 4 })));
    } else {
      callback(null, addresses[0], 4);
    }
  });
};

const customAgent = new https.Agent({
  lookup: customLookup
});

neonConfig.fetchFunction = (url, init) => {
  return fetchNode(url, { ...init, agent: customAgent });
};

async function test() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });
  try {
    const users = await db.query.users.findMany();
    console.log("Users:", users.length);
  } catch (err) {
    console.error("DB Error:", err);
  }
}
test();
