const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
    taiko: {
        tvl: sumTokensExport({ 
            tokensAndOwners: [
                // USDC-WETH Pair 
                ['0x07d83526730c7438048D55A4fc0b850e2aaB6f0b' , '0xde634b8363488Aa49a4A5F69fc66D3cb35962676'],
                ['0xA51894664A773981C6C112C43ce576f315d5b1B6' , '0xde634b8363488Aa49a4A5F69fc66D3cb35962676'],

                // WETH-TAIKO Pair 
                ['0xA51894664A773981C6C112C43ce576f315d5b1B6' , '0xEb5BE83E5cc05C2158b39B37222b9C44DbE8CaC7'],
                ['0x07d83526730c7438048D55A4fc0b850e2aaB6f0b' , '0xEb5BE83E5cc05C2158b39B37222b9C44DbE8CaC7'],

                // WETH-WSXETH
                ['0xA51894664A773981C6C112C43ce576f315d5b1B6' , '0xc7Cbac1bB6C37570c04609FB70B2959c8b8b4412'],
                ['0xda9a0fbCE1b8b11fCbd8114354eC266594C0Ff5A' , '0xc7Cbac1bB6C37570c04609FB70B2959c8b8b4412'],

                // USDT-USDC
                ['0x2DEF195713CF4a606B49D07E520e22C17899a736' , '0x3136Ef69a9E55d7769cFED39700799Bb328d9B46'],
                ['0x07d83526730c7438048D55A4fc0b850e2aaB6f0b' , '0x3136Ef69a9E55d7769cFED39700799Bb328d9B46'],
                
              ],
        }),
  
    }
};
