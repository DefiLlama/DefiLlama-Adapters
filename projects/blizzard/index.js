const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformAvaxAddress } = require("../helper/portedTokens");

//Blizz Vault
const VaultBlizz = "0x37126BCaeF2b033011d7a68c3884eC294c965B3a";
const BLIZZ = "0xB147656604217a03Fe2c73c4838770DF8d9D21B8";
const WAVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";

//Locked Vault
const VaultLockedBlizz = "0x7754cdd32BD47a6A857c1939740845905F5F9308";

//JOE Vault
const VaultJoe = "0x336e16b1f3A10048F38367B16808CF70e9e34E50";

const lpVaults = [
  "0xE595C99b35f17408178097aFcF08DaE31DF0AD78", //PGL Vault PNG
  "0xe69FaFbCA661368855A29B9Bf7eD14aA5c27FB4E", //JLP Vault JOE
  "0xBcf284640dF1b17DC9022168798bc839e36F39Df", //JLP Vault JOE
  "0x5806F70646832bfe5Dd11dF847832f9c268545c4", //JLP Vault JOE
  "0x3C6e6019337AeEb1E58dcab16473Bf05B92B7417", //PGL Vault PNG
  //"0xdc68EB4F1E603DA8909929bE74b68CBa943017c6", //JLP Vault JOE
  //"0xD0659570B2De12F7814189c54f1316381F947329", //JLP Vault JOE
];

const calcTvl = async (balances, chain, block, token, balance, vault) => {
  const TokenOrWant = (
    await sdk.api.abi.call({
      abi: token,
      target: vault,
      chain,
      block,
    })
  ).output;

  const balanceOfvault = (
    await sdk.api.abi.call({
      abi: balance,
      target: vault,
      chain,
      block,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, `avax:${TokenOrWant}`, balanceOfvault);
};

const avaxTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const wantOfVaults = (
    await sdk.api.abi.multiCall({
      abi: abi.want,
      calls: lpVaults.map((vault) => ({
        target: vault,
      })),
      chain: "avax",
      block: chainBlocks["avax"],
    })
  ).output.map((w) => w.output);

  const balanceOfVaults = (
    await sdk.api.abi.multiCall({
      abi: abi.balance,
      calls: lpVaults.map((vault) => ({
        target: vault,
      })),
      chain: "avax",
      block: chainBlocks["avax"],
    })
  ).output.map((w) => w.output);

  const lpPositions = [];

  for (let i = 0; i < lpVaults.length; i++) {
    lpPositions.push({
      token: wantOfVaults[i],
      balance: balanceOfVaults[i],
    });
  }

  const transformAddress = await transformAvaxAddress();
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["avax"],
    "avax",
    transformAddress
  );

  await calcTvl(
    balances,
    "avax",
    chainBlocks["avax"],
    abi.token,
    abi.balance,
    VaultLockedBlizz
  );

  await calcTvl(
    balances,
    "avax",
    chainBlocks["avax"],
    abi.want,
    abi.balance,
    VaultJoe
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  staking: {
    tvl: staking(VaultBlizz, BLIZZ, "avax"),
  },
  avax: {
    tvl: avaxTvl,
  },
  tvl: sdk.util.sumChainTvls([avaxTvl]),
  methodology: "We count liquidity on the Vaults through their contracts",
};
