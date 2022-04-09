const getTVL = require('./src/tvl/tvl.service.js');

module.exports = {
    klaytn: {
        tvl: getTVL
    }
} 
