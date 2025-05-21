const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");
const { stakings } = require("../helper/staking");

module.exports = {
  methodology: 'TVL counts the tokens deposited in the boring vaults.',
  start: 1733726867
}

const CONFIG = {
  ethereum: {
    vaults: [
      ADDRESSES.sonic.scUSD,
      ADDRESSES.sonic.scETH,
      '0xBb30e76d9Bb2CC9631F7fC5Eb8e87B5Aff32bFbd'
    ],
    supportedAssets: [
      ADDRESSES.ethereum.USDC,                         // USDC
      ADDRESSES.ethereum.USDT,                         // USDT
      ADDRESSES.ethereum.DAI,                          // DAI
      ADDRESSES.ethereum.SDAI,                         // SDAI
      ADDRESSES.ethereum.sUSDS,                        // SUSDS
      '0xCAcd6fd266aF91b8AeD52aCCc382b4e165586E29',    // frxUSD
      '0xcf62F905562626CfcDD2261162a51fd02Fc9c5b6',   // sfrxUSD
      ADDRESSES.ethereum.WETH,                         // WETH
      ADDRESSES.ethereum.WSTETH,                       // WSTETH
      ADDRESSES.ethereum.STETH,                       // WSTETH
      ADDRESSES.ethereum.WEETH,                        // WEETH
      ADDRESSES.ethereum.EETH,                        // WEETH
      '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f', // GHO
      '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c', // AAVEUSDC
      '0x23878914EFE38d27C4D67Ab83ed1b93A74D4086a', // AAVEUSDT
      '0x32a6268f9Ba3642Dda7892aDd74f1D34469A4259', // AAVESUSDS
      '0x1a88Df1cFe15Af22B3c4c783D4e6F7F9e0C1885d', // STKGHO
      '0xdC035D45d973E3EC169d2276DDab16f1e407384F', // USDS
      '0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8', // AAVEWETH
      '0xd63070114470f685b75B74D60EEc7c1113d33a3D',  // USDO MORPHO,
      '0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB', // STEAK_USDC
      '0x6A29A46E21C730DcA1d8b23d637c101cec605C5B', // FGHO
      '0x5C20B550819128074FD538Edf79791733ccEdd18', // FUSDT
      '0x2371e134e3455e0593363cBF89d3b6cf53740618', // GAUNTLET WETH
      ADDRESSES.ethereum.WBTC,
      '0x657e8C867D8B37dCC18fA4Caead9C45EB088C642', // EBTC
      ADDRESSES.ethereum.LBTC // LBTC
    ]
  },
  sonic: {
    vaults: [
      ADDRESSES.sonic.scUSD,
      ADDRESSES.sonic.scETH,
      '0xBb30e76d9Bb2CC9631F7fC5Eb8e87B5Aff32bFbd'
    ],
    supportedAssets: [
      ADDRESSES.sonic.USDC_e,
      '0x50c42dEAcD8Fc9773493ED674b675bE577f2634b',  // WETH
      ADDRESSES.berachain.WBTC,                      // WBTC
      ADDRESSES.sonic.LBTC,  // LBTC
      '0x578Ee1ca3a8E1b54554Da1Bf7C583506C4CD11c6',  // AUSDC
      '0xe18Ab82c81E7Eecff32B8A82B1b7d2d23F1EcE96',   // AWETH
      '0x80Eede496655FB9047dd39d9f418d5483ED600df', // frxUSD 
      '0x5Bff88cA1442c2496f7E475E9e7786383Bc070c0' // sfrxUSD
    ],
  },
}

Object.keys(CONFIG).forEach((chain) => {
  const {  vaults, supportedAssets } = CONFIG[chain]
  module.exports[chain] = { 
    tvl: sumTokensExport({ owners: vaults, tokens: supportedAssets }),
  };
});
