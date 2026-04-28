const { PublicKey } = require('@solana/web3.js')
const { getConnection } = require('../helper/solana')

const USDX_EVM = {
  ethereum: '0xfea577f08d1984e6654813be0acee3140e5d7d42',
  monad: '0xd0a4BDb0422DB3fA77dC46189b6d043D2cd5A7B9',
}

const USDX_SOLANA_MINT = '9Gst2E7KovZ9jwecyGqnnhpG1mhHKdyLpJQnZonkCFhA'

const methodology =
  'TVL is the circulating supply of USDX across all chains on which it has been issued. ' +
  'USDX is the fully-collateralized stablecoin issued by Stable (trystable.co), backed by ' +
  'real-world mortgage debt NFTs (tokenized real estate loans) plus on-chain yield reserves ' +
  '(idle USDC and positions in Jupiter Lend and Kamino). USDX is minted 1:1 against ' +
  'collateral, so circulating supply equals total backing.'

async function solanaTvl(api) {
  const conn = getConnection()
  const supply = await conn.getTokenSupply(new PublicKey(USDX_SOLANA_MINT))
  api.addUSDValue(supply.value.uiAmount)
}

module.exports = {
  methodology,
  solana: { tvl: solanaTvl },
}

for (const [chain, target] of Object.entries(USDX_EVM)) {
  module.exports[chain] = {
    tvl: async (api) => {
      const supply = await api.call({ abi: 'erc20:totalSupply', target })
      api.addUSDValue(Number(supply) / 1e18)
    },
  }
}
