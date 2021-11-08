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
  },
  avax: {
    masterChefContract: "0x995eeDB14d5ecF3c7C44D7186fA013f3C12fA994",
    ignoreAddresses: []
  }
}

const morChains = {
  bsc: {
    pools: [
      "0xB50Acf6195F97177D33D132A3E5617b934C351d3",
      "0x13e7A6691FE00DE975CF27868386f4aE9aed3cdC",
      "0xd8C76eF0de11f9cc9708EB966A87e25a7E6C7949",
      "0x0170D4C58AD9A9D8ab031c0270353d7034B87f6F",
      "0xE487a3780D56F2ECD142201907dF16350bb09946",
      "0x9Df7B409925cc93dE1BB4ADDfA9Aed2bcE913F08",
      "0x60CD286AF05A3e096C8Ace193950CffA5E8e3CE0",
      "0x26E0701F5881161043d56eb3Ddfde0b8c6772060",
      "0xFA6388B7980126C2d7d0c5FC02949a2fF40F95DE",
      "0x9FDD69a473d2216c5D232510DDF2328272bC6847",
      "0xcAD2E1b2257795f0D580d49520741E93654fAaB5",
      "0xC2E8C3c427E0a5BaaF512A013516aECB65Bd75CB"
    ],
    ignoreAddresses: []
  },
  avax: {
    pools: [
      "0x3eC9379c79ace6510574EE2c3B0B67aeeE1C23AC",
      "0x156a4aD3aDbD14599F96dDC24e690e0B2841aB28",
      "0x53073f685474341cdc765F97E7CFB2F427BD9db9",
      "0x14955760d8c09D51a984C1c977e5A306C6133891",
      "0xf5aFfe3459813AB193329E53f17098806709046A",
      "0xDf93E61037DeEf5ca280e4A915bEB62e1bdE481F",
      "0x5141da4ab5b3e13ceE7B10980aE6bB848FdB59Cd",
      "0x0B32788B77c77265D08bf13E12FcE4C4978c64E8",
      "0x691e486b5F7E39e90d37485164fAbDDd93aE43cD",
      "0xB1429FB053242fd5b8483Ed452E22c688E405CB5",
    ],
    ignoreAddresses: []
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
          symbol.output,
          chainBlocks
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
          symbol.output,
          chainBlocks
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

//*** MOR tvl portion as product of GrowthDefi Protocol ***//
const fetchMorChainTvl = async (timestamp, ethBlock, chainBlocks, chain, chainCustomProcessor) => {
  const chainConfig = morChains[chain];

  const balances = {};

  const stakeLpTokens = (
    await sdk.api.abi.multiCall({
      abi: abi.state,
      calls: chainConfig.pools.map((pool) => ({
        target: pool,
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output.map((stkLp) => stkLp.output._reserveToken);

  const stakeLpTokens_bal = (
    await sdk.api.abi.multiCall({
      abi: abi.totalReserve,
      calls: chainConfig.pools.map((pool) => ({
        target: pool,
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

  const lpPositions = [];

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
          symbol.output,
          chainBlocks
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
}

/**
 * BSC-specific tokens processing logic
 *
 * @param {*} address
 * @param {*} balance
 * @param {*} symbol
 * @param {*} chainBlocks
 * @returns
 */
const bscTokensProcessor = async (address, balance, symbol, chainBlocks) => {
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

/**
 * Avax-specific tokens processing logic
 *
 * @param {*} address
 * @param {*} balance
 * @param {*} symbol
 * @param {*} chainBlocks
 * @returns
 */
const avaxTokensProcessor = async (address, balance, symbol, chainBlocks) => {
  let tokenAddress = address;
  let tokenBalance = balance;

  return [{ tokenAddress, tokenBalance }]
}

const wheatBscTvl = (timestamp, ethBlock, chainBlocks) => {
  return fetchWheatChainTvl(timestamp, ethBlock, chainBlocks, 'bsc', bscTokensProcessor)
}

const wheatAvaxTvl = (timestamp, ethBlock, chainBlocks) => {
  return fetchWheatChainTvl(timestamp, ethBlock, chainBlocks, 'avax', avaxTokensProcessor)
}

const morBscTvl = (timestamp, ethBlock, chainBlocks) => {
  return fetchMorChainTvl(timestamp, ethBlock, chainBlocks, 'bsc', bscTokensProcessor)
}

const morAvaxTvl = (timestamp, ethBlock, chainBlocks) => {
  return fetchMorChainTvl(timestamp, ethBlock, chainBlocks, 'avax', avaxTokensProcessor)
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
    tvl: sdk.util.sumChainTvls([wheatBscTvl, morBscTvl]),
  },
  avax: {
    tvl: sdk.util.sumChainTvls([wheatAvaxTvl, morAvaxTvl]),
  },
  tvl: sdk.util.sumChainTvls([wheatBscTvl, morBscTvl, wheatAvaxTvl, morAvaxTvl]),
  methodology:
    "We count liquidity on the Wheath, GRoot, Mor as products of Growthdefi Protocol through MasterChef and Staking Contracts",
};
