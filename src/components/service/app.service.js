const config = require('../../../config');
export const SERVER = location.href.includes('localhost') ? config.dev.server : '';
