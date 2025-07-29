const ADDRESSES = require('../helper/coreAssets.json')

const CONFIG = {
  ethereum: {
    factory: { START_BLOCK: 20432393, TOKEN_FACTORY: '0x91808B5E2F6d7483D41A681034D7c9DbB64B9E29' },
    assets: { USDC: ADDRESSES.ethereum.USDC },
  },
  base: {
    factory: { START_BLOCK: 17854404, TOKEN_FACTORY: '0x7f192F34499DdB2bE06c4754CFf2a21c4B056994' },
    assets: { USDC: ADDRESSES.base.USDC }
  },
  arbitrum: {
    factory: { START_BLOCK: 238245701, TOKEN_FACTORY: '0x91808B5E2F6d7483D41A681034D7c9DbB64B9E29' },
    assets: { USDC: ADDRESSES.arbitrum.USDC_CIRCLE }
  },
}

const abis = {
  getVault: "function vault(address asset) external view returns (address)",
  totalAssets: "function totalAssets() external view returns (uint256)",
};

const eventAbis = {
  deployTranches: 'event DeployTranche(uint64 indexed poolId, bytes16 indexed trancheId, address indexed tranche)'
}

const getTokens = async (api, block, START_BLOCK, TOKEN_FACTORY) => {
  const tranches = await api.getLogs({ target: TOKEN_FACTORY, fromBlock: START_BLOCK, toBlock: block, eventAbi: eventAbis.deployTranches, onlyArgs: true })
  return tranches.map(({ tranche }) => tranche)
}

const tvl = async (api) => {
  const chain = api.chain
  const block = await api.getBlock() - 100
  const { factory: { START_BLOCK, TOKEN_FACTORY }, assets: { USDC } } = CONFIG[chain]
  const tokens = await getTokens(api, block, START_BLOCK, TOKEN_FACTORY)
  const vaults = await api.multiCall({ calls: tokens.map((t) => ({ target: t, params: [USDC] })), abi: abis.getVault })
  await api.erc4626Sum({ calls: vaults, tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets' })
}

module.exports.methodology = `TVL corresponds to the total USD value of tokens minted on Centrifuge across Ethereum, Base, and Arbitrum.`
Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})