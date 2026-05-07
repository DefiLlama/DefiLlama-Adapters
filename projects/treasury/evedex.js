'use strict';

const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require("../helper/treasury");

const treasury = '0x77075c627e51145d54e4EDD54Afa169DA7ff8A17';

module.exports = treasuryExports({
  eventum: {
    tokens: [ 
        ADDRESSES.eventum.USDT
     ],
    owners: [treasury],
  },
})