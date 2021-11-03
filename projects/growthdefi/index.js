const sdk = require("@defillama/sdk");
const BigNumber = require('bignumber.js');
const abi = require("./abi.json");
const erc20 = require("../helper/abis/erc20.json");
const beltAbi = require("./abis/belt.json");
const { transformBscAddress } = require("../helper/portedTokens");
const {staking} = require('../helper/staking');
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const stakingContract_eth = "0xD93f98b483CC2F9EFE512696DF8F5deCB73F9497";
const GRO_ETH = "0x09e64c2B61a5f1690Ee6fbeD9baf5D6990F8dFd0"; /* it's not on coingecko yet!! */

const gRootStakingContract_bsc = "0xDA2AE62e2B71ad3000BB75acdA2F8f68DC88aCE4";

const treasuryContract_bsc = "0x392681Eaf8AD9BC65e74BE37Afe7503D92802b7d";
const GRO_BSC = "0x336ed56d8615271b38ecee6f4786b55d0ee91b96";
const gROOT_BSC = "0x8b571fe684133aca1e926beb86cb545e549c832d";
const WBNB_BSC = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

const BELT_4POOL_SWAP_BSC = "0xAEA4f7dcd172997947809CE6F12018a6D5c1E8b6"

const wheatChains = {
  bsc: {
    masterChefContract: "0x95fABAe2E9Fb0A269cE307550cAC3093A3cdB448",
    ignoreAddresses: [
      "0xC8216C4ac63F3cAC4f7e74A82d2252B7658FA8b1",
      "0x87BAde473ea0513D4aA7085484aEAA6cB6EBE7e3",
    ]
  }
}

const treasury = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const transformAddress = await transformBscAddress();
  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [GRO_BSC, false],
      [gROOT_BSC, false],
      [WBNB_BSC, false],
    ],
    [treasuryContract_bsc],
    chainBlocks["bsc"],
    "bsc",
    transformAddress
  );

  return balances;
};

//*** Wheat tvl portion as product of GrowthDefi Protocol ***//
const fetchWheatChainTvl = async (timestamp, ethBlock, chainBlocks, chain, chainCustomProcessor) => {
  const chainConfig = wheatChains[chain];

  const balances = {};

  const poolLength = Number(
    (
      await sdk.api.abi.call({
        abi: abi.poolLength,
        target: chainConfig.masterChefContract,
        chain: chain,
        block: chainBlocks[chain],
      })
    ).output
  );

  const allPoolNums = Array.from(Array(poolLength).keys());

  const lpTokens = (
    await sdk.api.abi.multiCall({
      abi: abi.poolInfo,
      calls: allPoolNums.map((idx) => ({
        target: chainConfig.masterChefContract,
        params: idx,
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output.map((lp) => lp.output.lpToken);

  const lpToken_bal = (
    await sdk.api.abi.multiCall({
      abi: erc20.balanceOf,
      calls: lpTokens.map((lp) => ({
        target: lp,
        params: chainConfig.masterChefContract,
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output.map((bal) => bal.output);

  const symbol = (
    await sdk.api.abi.multiCall({
      abi: abi.symbol,
      calls: lpTokens.map((lp) => ({
        target: lp,
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output;

  const lpPositions = [];
  const stkLpTokens = [];

  await Promise.all(
    symbol.map(async (symbol, idx) => {
      const token = symbol.input.target;
      if (
        chainConfig.ignoreAddresses.some((addr) => addr.toLowerCase() === token.toLowerCase())
      ) {
        return;
      } else if (symbol.output.includes("-LP")) {
        lpPositions.push({
          token: lpTokens[idx],
          balance: lpToken_bal[idx],
        });
      } else if (symbol.output.includes("stk")) {
        stkLpTokens.push({
          token: lpTokens[idx],
        });
      } else {
        const processedTokens = await chainCustomProcessor(
          lpTokens[idx],
          lpToken_bal[idx],
          symbol.output
        )

        processedTokens.map(({ tokenAddress, tokenBalance }) => {
          sdk.util.sumSingleBalance(
            balances,
            `${chain}:${tokenAddress}`,
            tokenBalance
          );
        })
      }
    })
  );

  const stakeLpTokens = (
    await sdk.api.abi.multiCall({
      abi: abi.reserveToken,
      calls: stkLpTokens.map((stkLp) => ({
        target: stkLp.token,
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output.map((stkLp) => stkLp.output);

  const stakeLpTokens_bal = (
    await sdk.api.abi.multiCall({
      abi: abi.totalReserve,
      calls: stkLpTokens.map((stkLp) => ({
        target: stkLp.token,
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output.map((stkLp_bal) => stkLp_bal.output);

  const stkSymbol = (
    await sdk.api.abi.multiCall({
      abi: abi.symbol,
      calls: stakeLpTokens.map((lp) => ({
        target: lp,
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output;

  await Promise.all(
    stkSymbol.map(async (symbol, idx) => {
      if (symbol.output.includes("LP")) {
        lpPositions.push({
          token: stakeLpTokens[idx],
          balance: stakeLpTokens_bal[idx],
        });
      } else {
        const processedTokens = await chainCustomProcessor(
          stakeLpTokens[idx],
          stakeLpTokens_bal[idx],
          symbol.output
        )

        processedTokens.map(({ tokenAddress, tokenBalance }) => {
          sdk.util.sumSingleBalance(
            balances,
            `${chain}:${tokenAddress}`,
            tokenBalance
          );
        })
      }
    })
  );

  const transformAddress = await transformBscAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks[chain],
    chain,
    transformAddress
  );

  return balances;
};

const wheatBscTvl = (timestamp, ethBlock, chainBlocks) => {
  const bscProcessor = async (address, balance, symbol) => {
    let tokenAddress = address;
    let tokenBalance = balance;

    // Replace govGRO token with GRO (as it's pegged 1:1)
    if (symbol === 'govGRO') {
      tokenAddress = GRO_BSC;
    }

    // Unwrap belt-tokens
    if (symbol.startsWith('belt') && symbol.length > 4) {
      tokenAddress = (
        await sdk.api.abi.call({
          abi: beltAbi.token,
          target: address,
          chain: "bsc",
          block: chainBlocks["bsc"]
        })
      ).output

      tokenBalance = (
        await sdk.api.abi.call({
          abi: beltAbi.sharesToAmount,
          target: address,
          params: balance,
          chain: "bsc",
          block: chainBlocks["bsc"]
        })
      ).output
    }

    // Unwrap 4Belt
    if (symbol === '4Belt') {
      const tokensIndexes = [0, 1, 2, 3];

      const lpBalance = new BigNumber(balance);
      const totalSupply = new BigNumber((
        await sdk.api.abi.call({
          abi: beltAbi.totalSupply,
          target: address,
          chain: "bsc",
          block: chainBlocks["bsc"]
        })
      ).output)

      const coins = (
        await sdk.api.abi.multiCall({
          abi: beltAbi.coins,
          calls: tokensIndexes.map((idx) => ({
            target: BELT_4POOL_SWAP_BSC,
            params: idx
          })),
          chain: "bsc",
          block: chainBlocks["bsc"],
        })
      ).output.map((bal) => bal.output);

      const balances = (
        await sdk.api.abi.multiCall({
          abi: beltAbi.balances,
          calls: tokensIndexes.map((idx) => ({
            target: BELT_4POOL_SWAP_BSC,
            params: idx
          })),
          chain: "bsc",
          block: chainBlocks["bsc"],
        })
      ).output.map((bal) => new BigNumber(bal.output));

      const shares = balances.map((balance) => balance.times(lpBalance.div(totalSupply)).toFixed(0));

      const underlyingTokens = (
        await sdk.api.abi.multiCall({
          abi: beltAbi.token,
          calls: coins.map(coin => ({ target: coin })),
          chain: "bsc",
          block: chainBlocks["bsc"],
        })
      ).output.map((underlying) => underlying.output);

      const underlyingBalances = (
        await sdk.api.abi.multiCall({
          abi: beltAbi.sharesToAmount,
          calls: coins.map((coin, idx) => ({
            target: coin,
            params: shares[idx]
          })),
          chain: "bsc",
          block: chainBlocks["bsc"],
        })
      ).output.map((bal) => bal.output);

      return underlyingTokens.map((token, idx) => ({
        tokenAddress: token,
        tokenBalance: underlyingBalances[idx]
      }))
    }

    return [{ tokenAddress, tokenBalance }]
  }

  return fetchWheatChainTvl(timestamp, ethBlock, chainBlocks, 'bsc', bscProcessor)
}

module.exports = {
  misrepresentedTokens: true,
  staking_eth: {
    tvl: staking(stakingContract_eth, GRO_ETH),
  },
  staking_bsc: {
    tvl: staking(gRootStakingContract_bsc, GRO_BSC, "bsc"),
  },
  treasury_bsc: {
    tvl: treasury,
  },
  bsc: {
    tvl: wheatBscTvl,
  },
  tvl: sdk.util.sumChainTvls([wheatBscTvl]),
  methodology:
    "We count liquidity on the Wheath, GRoot, Mor as products of Growthdefi Protocol through MasterChef and Staking Contracts",
};
