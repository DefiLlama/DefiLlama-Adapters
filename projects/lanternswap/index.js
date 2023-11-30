const ADDRESSES = require('../helper/coreAssets.json')
/*==================================================
  Modules
  ==================================================*/
  const axios = require("axios");
  const sdk = require("@defillama/sdk");
  const BigNumber = require("bignumber.js");

  const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
  const { getChainTransform} = require("../helper/portedTokens")



/*** Arbitrum Addresses ***/
const poolAddressesKava = [
    //3PoolAddress
    "0x9076e914D94431A38311B247b289B7274E08d6f9",
];

const DAI = ADDRESSES.shiden.ETH
const USDC = ADDRESSES.telos.ETH
const USDT = ADDRESSES.moonriver.USDT

async function tvl(timestamp, chainBlocks) {
    const balances = {};
    const transformAddress = await getChainTransform("kava");
    await sumTokensAndLPsSharedOwners(
        balances,
        [
        [DAI, false],
        [USDC, false],
        [USDT, false],
        ],
        poolAddressesKava,
        chainBlocks["kava"],
        "kava",
        transformAddress
    );
    return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
    misrepresentedTokens: true,
    kava: {
      tvl
    },
    methodology:
      "Counts as TVL all the Assets deposited on KAVA through different Pool Contracts",
};