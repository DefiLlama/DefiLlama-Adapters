const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const quantTokenAddress = "0x05357bE6a973DA0a43b9aB82C90Bcc8a3Ef074b7";
const quantGenesisAddress = '0x10a2b4F8EF1DEDa10CEf90A7bdF178547b1efb54'
const xquantRewardPoolAddress = "0x";
const masonryAddress = "0x";
const quantscUSDLP = "0xa774bf15419499d1e9b227188eca366ff55af4be"


const genesisTokens = [
    ADDRESSES.sonic.wS, // S
    "0xb1e25689d55734fd3fffc939c4c3eb52dff8a794",  // OS 
    "0x50c42dEAcD8Fc9773493ED674b675bE577f2634b", // WETH
    "0x3333b97138D4b086720b5aE8A7844b1345a33333", // SHADOW
    ADDRESSES.sonic.scUSD, // scUSD
    "0x9fDbC3f8Abc05Fa8f3Ad3C17D2F806c1230c4564", // GOGLZ
    "0x3333111A391cC08fa51353E9195526A70b333333", // x33
    "0xe920d1DA9A4D59126dC35996Ea242d60EFca1304", // DERP
    "0xf26Ff70573ddc8a90Bd7865AF8d7d70B8Ff019bC", // EGGS
    quantscUSDLP, // quant/scUSD LP
]




module.exports = {
  methodology: "TVL currently only consists of genesis pools. Pool2 will consist of Quant/scUSD & xQuant/OS LP tokens staked in the Reward Pool. Staking also includes Quant tokens locked in the Masonry contract.",
  hallmarks: [
    [1742677200, 'Genesis Starts'],
    [1743282000, 'Genesis Ends'],
    [1743303600, 'xQUANT Reward Pool Starts'],
  ],
  sonic: {
    tvl: async (api) => {
        return api.sumTokens({
            tokens: genesisTokens,
            owner: quantGenesisAddress,
        })
    },
  },
};