const sdk = require('@defillama/sdk');
const constants = require("./constants");
const { requery } = require("../helper/requery");
const { chainJoinExports, chainTypeExports } = require("./utils");
const { getBlock } = require("../helper/getBlock");
const { staking } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { transformBobaAddress } = require("../helper/portedTokens");
const { request } = require("graphql-request");

const DATA = {
  boba: async () => {
    const bobaTransform = transformBobaAddress();

    return [
      bobaTransform,
      {
        treasury: {
          addresss: [constants.addresses.boba.treasury],
          tokens: [
            [constants.addresses.boba.BOBA, false], // BOBA(Boba)
            [constants.addresses.boba.FRAX, false], // FRAX(Boba)
            [constants.addresses.boba.USDC, false], // USDC(Boba)
            [constants.addresses.boba.USDT, false], // USDT(Boba)
            [constants.addresses.boba.DAI, false], // DAI(Boba)
            [constants.addresses.boba.FRAX_KYO, true], // FRAX-KYO(Boba, OolongSwap)
          ],
        },
        staking: {
          address: constants.addresses.boba.staking,
          token: constants.addresses.boba.KYO,
        }
      },
    ];
  },
};

const chainTVL = (chain) => {
  return async (timestamp, _ethBlock, chainBlocks) => {
    const balances = {};
    const block = await getBlock(timestamp, chain, chainBlocks);

    const [transform] = await DATA[chain]();
    const subgraphApi = `https://api.thegraph.com/subgraphs/name/koyo-finance/exchange-subgraph-${chain}`;

    const koyoVault = await request(subgraphApi, constants.POOL_TOKENS, {
      block,
    });

    let tokenAddresses = [];
    for (const pool of koyoVault.koyos[0].pools) {
      for (let address of pool.tokens) {
        tokenAddresses.push(address.address);
      }
    }
    tokenAddresses = [...new Set(tokenAddresses)];

    const balanceCalls = tokenAddresses.map((address) => {
      return {
        target: address,
        params: koyoVault.koyos[0].address,
      };
    });
    const balancesCalled = await sdk.api.abi.multiCall({
      block,
      calls: balanceCalls,
      abi: "erc20:balanceOf",
    });
    await requery(balancesCalled, chain, block, "erc20:balanceOf");

    sdk.util.sumMultiBalanceOf(balances, balancesCalled, true, transform);

    return balances;
  };
};
const chainTreasury = (chain) => {
  return async (timestamp, _ethBlock, chainBlocks) => {
    const balances = {};
    const block = await getBlock(timestamp, chain, chainBlocks);

    const [transform, data] = await DATA[chain]();

    await sumTokensAndLPsSharedOwners(
      balances,
      data.treasury.tokens,
      data.treasury.addresss,
      block,
      chain,
      transform
    );

    return balances;
  };
};
const chainStaking = (chain) => {
  return async (timestamp, ethBlock, chainBlocks) => {
    const [, data] = await DATA[chain]();

    return staking(data.staking.address, data.staking.token, chain)(
      timestamp,
      ethBlock,
      chainBlocks
    );
  };
};

module.exports = chainJoinExports(
  [
    (chains) => chainTypeExports("tvl", chainTVL, chains),
    (chains) => chainTypeExports("treasury", chainTreasury, chains),
    (chains) => chainTypeExports("staking", chainStaking, chains),
  ],
  ["boba"]
);

module.exports = {
  ...module.exports,
  methodology:
    "Counts the tokens locked on swap pools based on their holdings.",
  start: 668_337,
};
