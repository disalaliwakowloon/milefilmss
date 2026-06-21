// Production startup file untuk shared hosting (cPanel)
process.env.NODE_ENV = 'production';
/* eslint-disable @typescript-eslint/no-require-imports */
require('./.next/standalone/server.js');
