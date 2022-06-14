const { getUniTVL } = require("../helper/unknownTokens");

 module.exports = {
   polygon: {
     tvl: getUniTVL({
       factory: '0x3ee4154c7f42d94e1092ad8ce5debb4b743ed0b2',
       chain: 'polygon',
       coreAssets: [
        '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0', // wmatic
        '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // usdc
       ]
     })
   },
 }
