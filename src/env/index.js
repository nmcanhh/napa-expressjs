import prod from './env.prod.js';
import dev from './env.dev.js';

const env = process.env.NODE_ENV || 'development';
let config;

switch (env) {
  case 'production':
    config = prod;
    break;
  default:
    config = dev;
    break;
}

export default { ...config };
