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
    "0x57F5E098CaD7A3D1Eed53991D4d66C45C9AF7812", // wUSDM
    "0x73A15FeD60Bf67631dC6cd7Bc5B6e8da8190aCF5", // USD0
    "0x35D8949372D46B7a3D5A56006AE77B215fc69bC0", // USD0++
    "0x15700B564Ca08D9439C58cA5053166E8317aa138", // deUSD
    "0x5C5b196aBE0d54485975D1Ec29617D42D9198326", // stdeUSD
];

module.exports = {
    ethereum: {
        tvl: sumTokensExport({ 
          owners: [LEVEL_STAKING_CONTRACT, ...LEVEL_RESERVE_MANAGERS], 
          tokens: TOKEN_CONTRACTS,
        }),
    }
};
