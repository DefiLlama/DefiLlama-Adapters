const {
    sumTokensExport
} = require('../helper/unwrapLPs');

// Vidya 
const VIDYA_TOKEN = '0x3D3D35bb9bEC23b06Ca00fe472b50E7A4c692C30';
const GNOSIS_SAFE = '0x17F0ABD8535Ba8846a82B1462F95C384A7d2193C';

// Generator 
const SINGLE_SIDE_TELLER = '0x4E053ac1F6F34A73F5Bbd876eFd20525EAcB5382';
const LP_TELLER = '0xD9BecdB8290077fAf79A2637a5f2FDf5033b2486';
const VAULT = '0xe4684AFE69bA238E3de17bbd0B1a64Ce7077da42';

// Games  
const VIDYAFLUX = '0x34317e2Da45FeC7c525aCa8dAbF22CbC877128a3';
const INVENTORYV2 = '0x9680223F7069203E361f55fEFC89B7c1A952CDcc';
const LEMONADESTAND = '0xf1261B8aD1a1c1856F0DE117Cd90BAc64b386285';

// LPs   
const UNISWAP_PAIR = '0xDA3706c9A099077e6BC389D1baf918565212A54D';
const UNISWAP_PAIR_CRAMER = '0x507C7d56c69bEDC528c3AA00b018656D20605663';

module.exports = {
    methodology: 'Counts the total number of tokens locked in staking contracts, game contracts and project treasury.',
    ethereum: {
        tvl: () => ({}),
        staking: sumTokensExport({
            owners: [SINGLE_SIDE_TELLER, VAULT, VIDYAFLUX, INVENTORYV2, LEMONADESTAND, ],
            tokens: [VIDYA_TOKEN,],
        }),
        pool2: sumTokensExport({
            owners: [LP_TELLER, ],
            tokens: [UNISWAP_PAIR, UNISWAP_PAIR_CRAMER],
        }),
    }
};
