const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const LEVEL_STAKING_CONTRACT = '0x7FDA203f6F77545548E984133be62693bCD61497';
const LEVEL_RESERVE_MANAGERS = ['0x70D544F75c2228D68EE04BC63e6e4Bae8F31fCEF'];

const TOKEN_CONTRACTS = [
    ADDRESSES.ethereum.USDT, // USDT
    ADDRESSES.ethereum.USDC, // USDC
    ADDRESSES.ethereum.DAI, // DAI
    ADDRESSES.ethereum.SDAI, // sDAI
    ADDRESSES.ethereum.sUSDe, // sUSD
    ADDRESSES.ethereum.USDe, // USDe
    "0x57f5e098cad7a3d1eed53991d4d66c45c9af7812", // wUSDM
    "0x73a15fed60bf67631dc6cd7bc5b6e8da8190acf5", // USD0
    "0x35D8949372D46B7a3D5A56006AE77B215fc69bC0", // USD0++
    "0x15700b564ca08d9439c58ca5053166e8317aa138", // deUSD
    "0x5c5b196abe0d54485975d1ec29617d42d9198326", // stdeUSD
];

module.exports = {
    ethereum: {
        tvl: sumTokensExport({ 
          owners: [LEVEL_STAKING_CONTRACT].concat(LEVEL_RESERVE_MANAGERS), 
          tokens: TOKEN_CONTRACTS,
        }),
    }
};
