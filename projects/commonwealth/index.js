const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");
const { staking } = require('../helper/staking');

const TREASURY = [
    '0xdE70B8BC5215BdF03f839BB8cD0F639D4E3E2881',
    '0xA205fD6A798A9Ba8b107A00b8A6a5Af742d6aCb5',
    '0x990eCdf73704f9114Ee28710D171132b5Cfdc6f0',
    '0xa653879692D4D0e6b6E0847ceDd58eAD2F1CC136'
]

const TOKENS = [
    coreAssets.null,
    coreAssets.base.USDC,
    coreAssets.base.WETH,

]

const CONTRACTS = [
    '0x048aC8a33dF81FfbD8397A98A667a10cfC8aD92a', // vesting
    '0xca8310e5fc441f9c7e575c64a8d992f455e6b7bf', 
    '0xbc9a06cc352e55f2a02e98b4cfae96ef3dbce481', 
    '0x7fd2f60b159920d7dd4544150ce140890052000d', 
    '0x34d6aaba93afee10fac35818f9d40fd0f393848e',
    '0xf4aa59f5192856f41ae19caab4929ccd3a265e70', // staked 
    '0x7519461fbd96abb539c770d57f38c2e91f8262aa', 
    '0xd7e31990883250e53314b15ee555345f04d011e8', 
    '0xdE70B8BC5215BdF03f839BB8cD0F639D4E3E2881',
    '0xA205fD6A798A9Ba8b107A00b8A6a5Af742d6aCb5',
    '0x87412c03979cc19c60071f5f98313a7cbe9f6d65', // rewards 
    
];

const WLTH = '0x99b2B1A2aDB02B38222ADcD057783D7e5D1FCC7D';

module.exports = {
    base: {
        tvl: sumTokensExport({ owners: TREASURY, tokens: TOKENS }),
        staking: staking(CONTRACTS, WLTH)
    }
};
