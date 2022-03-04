const sdk = require("@defillama/sdk");
const poolInfoAbi = require("../helper/abis/masterchef.json");
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs');
const { addFundsInMasterChef } = require("../helper/masterchef");
const {
  transformBscAddress,
  transformFantomAddress,
} = require("../helper/portedTokens");
const { fetchURL } = require("../helper/utils");
const { toUSDTBalances } = require("../helper/balances");

const MasterChefContract = "0xbf513aCe2AbDc69D38eE847EFFDaa1901808c31c";
const ice = "0xf16e81dce15B08F326220742020379B855B87DF9";

function calcTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};

    const transformAddressBsc = await transformBscAddress();
    const transformAddressFtm = await transformFantomAddress();

    await addFundsInMasterChef(
      balances,
      MasterChefContract,
      chainBlocks[chain],
      chain,
      chain == "bsc" || chain == "fantom"
        ? chain == "bsc"
          ? transformAddressBsc
          : transformAddressFtm
        : (addr) => addr,
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
      abi: {
        inputs: [
          { internalType: "uint256", name: "_amount", type: "uint256" },
        ],
        name: "wMEMOToMEMO",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      block: chainBlocks.avax,
      chain: "avax",
    })
  ).output;
  balances["avax:0xb54f16fb19478766a268f172c9480f8da1a7c9c3"] = memo;
  delete balances["fantom:0xddc0385169797937066bbd8ef409b5b3c0dfeb52"];

  return balances;
};
async function fantomStaking(timestamp, block, chainBlocks) {
  const transform = await transformFantomAddress();
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      ["0x7f620d7d0b3479b1655cefb1b0bc67fb0ef4e443", false],
      ["0xf16e81dce15b08f326220742020379b855b87df9", false],
    ],
    [
      "0xBC8d95Ab498502242b41fdaD30bDFfC841f436e2",
      "0xaE2e07276A77DAdE3378046eEd92FfDE3995b0D5",
    ],
    chainBlocks.fantom, "fantom", transform
  );

  //nICE
  const nIce = 'fantom:0x7f620d7d0b3479b1655cefb1b0bc67fb0ef4e443';
  const ice = '0xf16e81dce15B08F326220742020379B855B87DF9'
  // if (nIce in balances){
  //   const nIceSupply = (
  //     await sdk.api.abi.call({
  //       chain: 'fantom',
  //       block: chainBlocks.fantom,
  //       target: "0x7f620d7d0b3479b1655cefb1b0bc67fb0ef4e443",
  //       abi: 'erc20:totalSupply',
  //     })
  //   ).output
  //   const iceLocked = (
  //     await sdk.api.abi.call({
  //       chain: 'fantom',
  //       block: chainBlocks.fantom,
  //       target: "0xf16e81dce15b08f326220742020379b855b87df9",
  //       params: ["0x7f620d7d0b3479b1655cefb1b0bc67fb0ef4e443"],
  //       abi: 'erc20:balanceOf',
  //     })
  //   ).output
  //   const icePernICE = iceLocked / nIceSupply

    // Then, multiply the staked spell balance by spell to staked spell ratio
    balances[ice] = Number(balances[ice]) + Number(balances[nIce])// * icePernICE);
    delete balances[nIce]
  //}
  return balances;
}
const ethTvl = calcTvl("ethereum");

const fantomPool2 = calcTvl("fantom");

const bscTvl = calcTvl("bsc");
// node test.js projects/popsicle/index.js
module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    pool2: ethTvl,
    tvl: optimizerV3,
  },
  bsc: {
    pool2: bscTvl,
  },
  fantom: {
    pool2: fantomPool2,
    tvl: fantomTvl,
    staking: fantomStaking
  },
  methodology: "We count pool2 liquidity staked on masterchef",
};
