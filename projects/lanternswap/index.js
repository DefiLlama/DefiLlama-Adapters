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

const DAI = "0x765277EebeCA2e31912C9946eAe1021199B39C61"
const USDC = "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f"
const USDT = "0xB44a9B6905aF7c801311e8F4E76932ee959c663C"

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