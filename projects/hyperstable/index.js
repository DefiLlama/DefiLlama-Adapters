const { getLogs } = require('../helper/cache/getLogs')
const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../helper/unwrapLPs");

const MANAGER = "0x8ADf2532c86aB123228D75Eb9DA5085DC3eAf5b9"
const USH = "0x8ff0dd9f9c40a0d76ef1bcfaf5f98c1610c74bd8"
const USH_ORACLE = "0xDc4ddde1EeaF64d77B23B794b89BfBe281B5Ce35"

const POOL2_CONFIG = [
  {
    stakingContract: "0x830B9cf9520854DDF885f594f9Da93023244BB13",
    lpToken: "0x3Bee53e887D52d9CBa177396AA44810904D501fF"
  },
  {
    stakingContract: "0xD1F03DdbcF8DDF201Dc49E834b33Ff842abd76E0",
    lpToken: "0x70ac2feeB9ab4417591a97AD2607DD0E87bb3e33"
  },
  {
    stakingContract: "0xa656a488023A5D3e52d9c580B31904177DF05060",
    lpToken: "0x749eF4ab10aef61151E14C9336B07727ffA5a323"
  }
]

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: MANAGER,
    eventAbi: 'event VaultRegistered(uint8 indexed index, address indexed vaultAddress, address indexed asset, uint256 mcr, uint256 minDebt, uint256 debtCap, uint256 interestIndex)',
    fromBlock: 3724000,
  })

  const vaults = logs.map(log => ({
    vault: log.args.vaultAddress,
    asset: log.args.asset,
  }))

  const totalAssets = await api.multiCall({
    abi: 'function totalAssets() view returns (uint256)',
    calls: vaults.map(v => ({ target: v.vault }))
  })

  const balances = {}
  vaults.forEach(({ asset }, i) => {
    sdk.util.sumSingleBalance(balances, asset.toLowerCase(), totalAssets[i], api.chain)
  })

  return balances
}

async function pool2(api) {
  const tokensAndOwners = POOL2_CONFIG.map(p => ([p.lpToken, p.stakingContract]))
  
  // Log raw LP token balances before unwrapping
  for (const config of POOL2_CONFIG) {
    const balance = await api.call({
      target: config.lpToken,
      params: [config.stakingContract],
      abi: 'erc20:balanceOf'
    })
  }

  const balances = await sumTokens2({ api, tokensAndOwners, resolveLP: true })
  return balances
}

module.exports = {
  hyperliquid: {
    tvl,
    pool2,
  },
  methodology: "Counts the total assets posted as collateral for TVL. For borrowed, calculates USH total supply × USH price from the protocol's price oracle (Pyth). Pool2 includes Curve LP positions staked in the protocol's staking contracts.",
};
 