const sdk = require("@defillama/sdk");
const constants = require("./constants");
const { requery } = require("../helper/requery");
const { chainJoinExports, chainTypeExports } = require("./utils");
const { getBlock } = require("../helper/getBlock");
const { staking } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const {
  getChainTransform,
} = require("../helper/portedTokens");
const { request } = require("graphql-request");

const DATA = {
  boba: async () => {
    const bobaTransform = await getChainTransform('boba');

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
          ],
        },
        staking: {
          address: constants.addresses.boba.staking,
          token: constants.addresses.boba.KYO,
        },
      },
    ];
  },
  ethereum: async () => {
    const ethereumTransform = await getChainTransform('ethereum');

    return [
      ethereumTransform,
      {
        treasury: {
          addresss: [constants.addresses.ethereum.treasury],
          tokens: [
            [constants.addresses.ethereum.USDC, false], // USDC(Ethereum)
          ],
        },
      },
    ];
  },
};

const chainTVL = (chain) => {
  return async (timestamp, _ethBlock, chainBlocks) => {
    if (!DATA[chain] || constants.tvlExclusion.includes(chain)) return {};

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

    const balanceCalls = tokenAddresses.flatMap((address) => {
      return [
        {
          target: address,
          params: koyoVault.koyos[0].address,
        },
        { target: address, params: constants.addresses[chain].feeCollector },
      ];
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
    if (!DATA[chain] || constants.treasuryExclusion.includes(chain)) return {};

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
    if (!DATA[chain] || constants.stakingExclusion.includes(chain)) return {};

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
  ["boba", "ethereum"]
);

module.exports = {
  ...module.exports,
  methodology:
    "Counts the tokens locked on swap pools based on their holdings.",
  hallmarks: [
    [1656419883, "Boba adds to FRAX-USDC"],
    [1658439731, "Boba removes from FRAX-USDC"],
    [1659129231, "Boba adds to USDC-DAI"],
    [1665774187, "Boba removes from USDC-DAI"]
  ],
};
