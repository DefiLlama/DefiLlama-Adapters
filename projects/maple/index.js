const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking, } = require("../helper/staking")
const { getConnection, getTokenBalance } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')
const { getLogs } = require('../helper/cache/getLogs')

const USDC = ADDRESSES.ethereum.USDC;

/*** Solana TVL Portions ***/
const POOL_DISCRIMINATOR = "35K4P9PCU";
const TVL_OFFSET = 257;
const TVL_DATA_SIZE = 8;
const PROGRAM_ID = "5D9yi4BKrxF8h65NkVE1raCCWFKUs5ngub2ECxhvfaZe";

let _tvl
const usdc = ADDRESSES.solana.USDC

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
  if (borrowed < 0) borrowed = 0

  return {
    tvl: {
      [USDC]: tvlValue.toFixed(0),
    },
    borrowed: {
      [USDC]: borrowed.toFixed(0)
    }
  };
}

const pInfos = {}

async function getPoolInfo(block, api) {
  if (!pInfos[block]) pInfos[block] = _getPoolInfo()
  return pInfos[block]

  async function _getPoolInfo() {
    const loanFactory = '0x1551717ae4fdcb65ed028f7fb7aba39908f6a7a6'
    const openTermLoanManagerFactory = '0x90b14505221a24039A2D11Ad5862339db97Cc160'

    const logs = await getLogs({
      api,
      target: loanFactory,
      topic: "InstanceDeployed(uint256,address,bytes)",
      fromBlock: 16126995,
    });
    const logs2 = await getLogs({ // open term
      api,
      target: openTermLoanManagerFactory,
      topic: "InstanceDeployed(uint256,address,bytes)",
      fromBlock: 17372608,
    });

    let proxies = logs.map(s => "0x" + s.topics[2].slice(26, 66))
    const proxiesOpenTerm = logs2.map(s => "0x" + s.topics[2].slice(26, 66))
    proxies.push(...proxiesOpenTerm)
    proxies = [...new Set(proxies.map(i => i.toLowerCase()))]
    const managers = await api.multiCall({ abi: 'address:poolManager', calls: proxies })
    const assets = await api.multiCall({ block, abi: abis.fundsAsset, calls: proxies, })
    return { proxies, assets, managers }
  }
}

async function ethTvl2(_, block, _1, { api }) {
  const { managers, assets, } = await getPoolInfo(block, api)
  const pools = await api.multiCall({
    abi: abis.pool,
    calls: managers,
  })

  return sumTokens2({ block, tokensAndOwners: pools.map((o, i) => ([assets[i], o])) })
}

async function borrowed2(_, block, _1, { api }) {
  const balances = {}
  const { proxies, assets, } = await getPoolInfo(block, api)
  const principalOut = await api.multiCall({
    abi: abis.principalOut,
    calls: proxies,
  })
  principalOut.forEach((val, i) => sdk.util.sumSingleBalance(balances, assets[i], val))
  return balances
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ethereum: {
    tvl: sdk.util.sumChainTvls([ethTvl2]),
    staking: staking('0x4937a209d4cdbd3ecd48857277cfd4da4d82914c', '0x33349b282065b0284d756f0577fb39c158f935e6'),
    borrowed: sdk.util.sumChainTvls([borrowed2]),
  },
  solana: {
    tvl: getTvl(),
    borrowed: getTvl(true),
  },
  methodology:
    "We count liquidity by USDC deposited on the pools through PoolFactory contract",
}

const abis = {
  fundsAsset: "address:fundsAsset",
  principalOut: "uint128:principalOut",
  pool: "address:pool",
}