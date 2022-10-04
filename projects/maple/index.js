const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokensAndLPsSharedOwners, sumTokens2 } = require("../helper/unwrapLPs");
const { staking, } = require("../helper/staking")
const { getConnection, getTokenBalance } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

const PoolFactory = "0x2Cd79F7f8b38B9c0D80EA6B230441841A31537eC";

const MapleTreasury = "0xa9466EaBd096449d650D5AEB0dD3dA6F52FD0B19";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const chain = 'ethereum'

/*** Treasury ***/
const Treasury = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [[USDC, false]],
    [MapleTreasury],
    chainBlocks["ethereum"],
    "ethereum",
    addr => addr
  );

  return balances;
};

/*** Ethereum TVL Portions ***/
const ethTvl = async (timestamp, block) => {
  const poolsCreated = (
    await sdk.api.abi.call({
      abi: abi.poolsCreated,
      target: PoolFactory,
      block
    })
  ).output;
  const calls = []

  for (let i = 0; i < poolsCreated; i++)
    calls.push({ params: i })

  const { output: pools } = await sdk.api.abi.multiCall({
    target: PoolFactory,
    abi: abi.pools,
    calls,
    chain, block,
  })

  const { output: assetOfLiquidity } = await sdk.api.abi.multiCall({
    abi: abi.liquidityAsset,
    calls: pools.map(i => ({ target: i.output })),
    chain, block,
  })

  const { output: locker } = await sdk.api.abi.multiCall({
    abi: abi.liquidityLocker,
    calls: pools.map(i => ({ target: i.output })),
    chain, block,
  })

  const toa = assetOfLiquidity.map(({ output }, i) => [output, locker[i].output])

  return sumTokens2({ tokensAndOwners: toa, block })
};


const borrowed = async (timestamp, block) => {
  const poolsCreated = (
    await sdk.api.abi.call({
      abi: abi.poolsCreated,
      target: PoolFactory,
      block
    })
  ).output;
  const calls = []

  for (let i = 0; i < poolsCreated; i++)
    calls.push({ params: i })

  const { output: pools } = await sdk.api.abi.multiCall({
    target: PoolFactory,
    abi: abi.pools,
    calls,
    chain, block,
  })

  const { output: assetOfLiquidity } = await sdk.api.abi.multiCall({
    abi: abi.liquidityAsset,
    calls: pools.map(i => ({ target: i.output })),
    chain, block,
  })

  const { output: principalOut } = await sdk.api.abi.multiCall({
    abi: abi.principalOut,
    calls: pools.map(i => ({ target: i.output })),
    chain, block,
  })

  const balances = {}
  assetOfLiquidity.forEach(({ output }, i) => sdk.util.sumSingleBalance(balances, output, principalOut[i].output))
  return balances
};

/*** Solana TVL Portions ***/
const POOL_DISCRIMINATOR = "35K4P9PCU";
const TVL_OFFSET = 257;
const TVL_DATA_SIZE = 8;
const PROGRAM_ID = "5D9yi4BKrxF8h65NkVE1raCCWFKUs5ngub2ECxhvfaZe";

let _tvl
const usdc = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

function getTvl(borrowed = false) {
  return async () => {
    if (!_tvl) _tvl = getSolanaTVL()
    const res = await _tvl
    return borrowed ? res.borrowed : res.tvl
  }
}

async function getSolanaTVL() {
  const programId = new PublicKey(PROGRAM_ID);
  const connection = getConnection();
  const accounts = await connection.getProgramAccounts(programId, {
    filters: [{
      memcmp: {
        offset: 0,
        bytes: POOL_DISCRIMINATOR
      }
    }]
  });

  let borrowed = 0;
  let tvlValue = 0;
  for (const account of accounts) {
    const data = account.account.data.slice(TVL_OFFSET, TVL_OFFSET + TVL_DATA_SIZE)
    const poolTvl = Number(data.readBigUint64LE())
    const loanBalance = await getTokenBalance(usdc, account.pubkey.toString())
    tvlValue += loanBalance * 1e6
    borrowed += poolTvl - loanBalance * 1e6
  }

  return {
    tvl: {
      [USDC]: tvlValue.toFixed(0),
    },
    borrowed: {
      [USDC]: borrowed.toFixed(0)
    }
  };
}


module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ethereum: {
    tvl: ethTvl,
    treasury: Treasury,
    staking: staking('0x4937a209d4cdbd3ecd48857277cfd4da4d82914c', '0x33349b282065b0284d756f0577fb39c158f935e6'),
    borrowed,
  },
  solana: {
    tvl: getTvl(),
    borrowed: getTvl(true),
  },
  methodology:
    "We count liquidity by USDC deposited on the pools through PoolFactory contract",
}
