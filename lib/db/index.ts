import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (process.env.NODE_ENV === 'development') {
  // Fix local DNS resolution issues on Windows for Neon
  const dns = require('dns');
  const https = require('https');
  const fetchNode = require('node-fetch');

  const customLookup = (hostname: string, options: any, callback: any) => {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    dns.resolve4(hostname, (err: any, addresses: string[]) => {
      if (err || !addresses || addresses.length === 0) {
        // Fallback to default lookup
        return dns.lookup(hostname, options, callback);
      }
      if (options && options.all) {
        callback(null, addresses.map(a => ({ address: a, family: 4 })));
      } else {
        callback(null, addresses[0], 4);
      }
    });
  };

  const customAgent = new https.Agent({ lookup: customLookup });
  
  neonConfig.fetchFunction = (url, init) => {
    return fetchNode(url, { ...init, agent: customAgent });
  };
}

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
