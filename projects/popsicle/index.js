const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const poolInfoAbi = require("../helper/abis/masterchef.json");
const { sumTokensAndLPsSharedOwners, sumTokens2 } = require('../helper/unwrapLPs');
const { addFundsInMasterChef } = require("../helper/masterchef");
const {
  transformBscAddress,
  transformFantomAddress,
} = require("../helper/portedTokens");
const { fetchURL } = require("../helper/utils");
const { toUSDTBalances } = require("../helper/balances");

const MasterChefContract = "0xbf513aCe2AbDc69D38eE847EFFDaa1901808c31c";
const ice = "0xf16e81dce15B08F326220742020379B855B87DF9";

function pool2(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    await addFundsInMasterChef(
      balances,
      MasterChefContract,
      chainBlocks[chain],
      chain,
      undefined,
      poolInfoAbi.poolInfo,
      [ice]
    );
    return balances;
  };
}

async function optimizerV3(time, block) {
  const data = await fetchURL(
    "https://analytics.back.popsicle.finance/api/v1/FragolaApy"
  );
  return toUSDTBalances(data.data.reduce((total, pool) => total + pool.tvl, 0));
}
async function fantomTvl(timestamp, block, chainBlocks) {
  const transform = await transformFantomAddress();
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      ["0xddc0385169797937066bbd8ef409b5b3c0dfeb52", false],
    ],
    [
      "0xFDB988aF9ef9D0C430176f972bA82B98b476F3ee",
    ],
    chainBlocks.fantom, "fantom", transform
  );

  //wMEMO
  const memo = (
    await sdk.api.abi.call({
      target: "0x0da67235dd5787d67955420c84ca1cecd4e5bb3b",
      params: [
        balances["fantom:0xddc0385169797937066bbd8ef409b5b3c0dfeb52"],
      ],
      abi: 'function wMEMOToMEMO(uint256 _amount) view returns (uint256)',
      block: chainBlocks.avax,
      chain: "avax",
    })
  ).output;
  balances["avax:0xb54f16fb19478766a268f172c9480f8da1a7c9c3"] = memo;
  delete balances["fantom:0xddc0385169797937066bbd8ef409b5b3c0dfeb52"];

  return balances;
}

async function fantomStaking(timestamp, block, chainBlocks) {
  return sumTokens2({
    tokensAndOwners: [
      ['0xf16e81dce15b08f326220742020379b855b87df9', '0xaE2e07276A77DAdE3378046eEd92FfDE3995b0D5'], // ICE
      [ADDRESSES.fantom.nICE, '0xBC8d95Ab498502242b41fdaD30bDFfC841f436e2'], // nICE
    ],
    chain: 'fantom',
    block: chainBlocks.fantom,
  })
}

// node test.js projects/popsicle/index.js
module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  ethereum: {
    pool2: pool2("ethereum"),
    tvl: optimizerV3,
  },
  bsc: {
    pool2: pool2("bsc"),
  },
  fantom: {
    pool2: pool2("fantom"),
    tvl: fantomTvl,
    staking: fantomStaking
  },
  methodology: "We count pool2 liquidity staked on masterchef",
};
