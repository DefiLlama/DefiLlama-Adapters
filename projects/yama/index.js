const { treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        '0x9dbbbaecacedf53d5caa295b8293c1def2055adc',//mooGLP
        "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",//usdt
     ],
    owners: ["0x1cd97ee98f3423222f7b4cddb383f2ee2907e628", "0x0e1Ddf8D61f0570Bf786594077CD431c727335A9"],
  },
})


