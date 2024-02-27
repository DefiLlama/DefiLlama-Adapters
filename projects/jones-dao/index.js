const sdk = require("@defillama/sdk");
const ADDRESSES = require("../helper/coreAssets.json");
const { pool2s } = require("../helper/pool2");
const { stakings } = require("../helper/staking");
const { sumTokens2 } = require("../helper/unwrapLPs");

const lockerABI = require("./aura-locker-abi.json");
const addresses = require("./addresses");

const jAssetToAsset = {
  "0x662d0f9ff837a51cf89a1fe7e0882a906dac08a3": ADDRESSES.arbitrum.WETH, // jETH
  "0x5375616bb6c52a90439ff96882a986d8fcdce421": addresses.tokens.gohm, // jgOHM,
  "0xf018865b26ffab9cd1735dcca549d95b0cb9ea19": addresses.tokens.dpx, // jDPX
  "0x1f6fa7a58701b3773b08a1a16d06b656b0eccb23": addresses.tokens.rdpx, // jrdpx
};

async function tvl(_timestamp, _block, _chainBlocks, { api }) {
  const [
    metavaultTokens,
    metavaultBalances,
    optionVaultTokens,
    optionVaultBalances,
  ] = await Promise.all([
    api.multiCall({
      abi: "address:depositToken",
      calls: addresses.metaVaultsAddresses,
    }),
    api.multiCall({
      abi: "uint256:workingBalance",
      calls: addresses.metaVaultsAddresses,
    }),
    api.multiCall({
      abi: "address:asset",
      calls: addresses.optionVaultAddresses,
    }),
    api.multiCall({
      abi: "uint256:totalAssets",
      calls: addresses.optionVaultAddresses,
    }),
  ]);

  api.addTokens(metavaultTokens, metavaultBalances);
  api.addTokens(optionVaultTokens, optionVaultBalances);

  const tokensAndOwners = [
    [addresses.tokens.uvrt, addresses.glp.stableRewardTracker],
    [addresses.tokens.uvrt, addresses.glp.router],
    [addresses.tokens.glp, addresses.glp.leverageStrategy],
  ];

  return sumTokens2({ api, tokensAndOwners });
}

async function tvl_ethereum(_timestamp, _block, _chainBlocks, { api }) {
  const balances = {};

  const leftoverStrategy = await sdk.api.erc20
    .balanceOf({
      target: addresses.tokens.aura,
      owner: addresses.aura.strategy,
    })
    .then((result) => result.output);
  sdk.util.sumSingleBalance(balances, addresses.tokens.aura, leftoverStrategy);

  const lockedBalance = await sdk.api.abi
    .call({
      abi: lockerABI.at(0),
      target: addresses.aura.locker,
      params: addresses.aura.strategy,
    })
    .then((result) => result.output[0]);
  sdk.util.sumSingleBalance(balances, addresses.tokens.aura, lockedBalance);

  return balances;
}

module.exports = {
  arbitrum: {
    tvl,
    pool2: pool2s(addresses.lpStaking, addresses.lps, "arbitrum", (addr) => {
      addr = addr.toLowerCase();
      return `arbitrum:${jAssetToAsset[addr] ?? addr}`;
    }),
    staking: stakings(
      addresses.stakingContracts,
      addresses.tokens.jones,
      "arbitrum"
    ),
  },

  ethereum: {
    tvl: tvl_ethereum,
  },
};
// node test.js projects/jones-dao/index.js
