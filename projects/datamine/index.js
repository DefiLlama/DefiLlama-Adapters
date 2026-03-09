const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const addresses = {
    ethereum: {
        // DAM (L1)
        damTokenContract: '0xF80D589b3Dbe130c270a69F1a69D050f268786Df',

        // FLUX (L1)
        fluxTokenContract: '0x469eDA64aEd3A3Ad6f868c44564291aA415cB1d9' 
    },
    arbitrum: {
        wethAddress: ADDRESSES.arbitrum.WETH,

        // FLUX (L2)
        fluxTokenContract: '0xF80D589b3Dbe130c270a69F1a69D050f268786Df',

        // ArbiFLUX (L2)
        arbiFluxTokenContract: '0x64081252c497FCfeC247a664e9D10Ca8eD71b276',

        // Lockquidity (L2)
        lockquidityTokenContract: '0x454F676D44DF315EEf9B5425178d5a8B524CEa03',
        lockquidityVaultContract: '0x0C93A1D3F68a0554d37F3e7AF3a1442a94405E7A'
    }
}

const arbitrumOneDeployUnixTimestamp = 1727644318; // Oct-13-2024 11:11:38 PM +UTC

module.exports = {
  methodology: "Pool2 counts all the permanent liquidity in LOCK/WETH Uniswap v2 pool. Staking counts all the tokens locked-in to mint FLUX/ArbiFLUX/LOCK",

  ethereum: {
    tvl:() => ({}),

    // DAM (L1) -> FLUX (L1)
    staking: sumTokensExport({
        chain: "ethereum",
        owner: addresses.ethereum.fluxTokenContract,
        tokens: [
            addresses.ethereum.damTokenContract
        ],
    }),
  },

  arbitrum: {
    tvl:() => ({}),
    staking: {
        // FLUX (L2) -> ArbiFLUX (L2)
        ...sumTokensExport({
            chain: "arbitrum",
            owner: addresses.arbitrum.arbiFluxTokenContract,
            tokens: [
                addresses.arbitrum.fluxTokenContract
            ],
        }),
        // ArbiFLUX (L2) -> LOCK (L2)
        ...sumTokensExport({
            chain: "arbitrum",
            owner: addresses.arbitrum.lockquidityTokenContract,
            tokens: [
                addresses.arbitrum.arbiFluxTokenContract
            ],
        })

    },

    // LOCK (L2) -> Uniswap v2 LOCK/WETH
    pool2: sumTokensExport({
      chain: "arbitrum",
      owner: addresses.arbitrum.lockquidityVaultContract,
      tokens: [
        addresses.arbitrum.wethAddress,
        addresses.arbitrum.lockquidityTokenContract,
      ],
    }),
  },

  hallmarks: [[arbitrumOneDeployUnixTimestamp, "Lockquidity Launch"]],
};
