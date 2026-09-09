const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// Mercata bridge custody. One address on every source chain; deposits are
// escrowed here and 1:1 `*ST` wrapped tokens are minted on STRATO.
// Source of truth for chains + assets: BlockApps-MercataBridge-chains / -assets
// on STRATO mainnet (bridge contract 0x0000000000000000000000000000000000001008).
const CUSTODY = '0x8c458f866e603335ef179a63a2528f357732f5d5'

// Outbound direction: StratoNativeBridge locks STRATO-native assets in its
// custody vault when they leave the chain. Vault resolved on-chain from the bridge.
const STRATO_NATIVE_BRIDGE = '0x4d9e9c39180a75091b9c35bbb9064d67c7fdde5a'
const STRATO_NATIVE_TOKENS = [
  '0x937efa7e3a77e20bbdbd7c0d32b6514f368c1010', // USDST
  '0xcdc93d30182125e05eec985b631c7c61b3f63ff0', // GOLDST
  '0x2c59ef92d08efde71fe1a1cb5b45f4f6d48fcc94', // SILVST
]
// $STRATO locked in the vault is exactly what circulates as the Ethereum STRATO
// ERC-20, which is where CoinGecko tracks it (`ethereum-strato`, 18 decimals).
// It has no price feed on the STRATO chain, so it is counted against that address.
const STRATO_ON_STRATO   = '0x2ca3e170e6714282da77815f7864b17f612f5f83'
const STRATO_ON_ETHEREUM = 'ethereum:0x4c93b9fbf7fd1777ccbcbc538b1d0a8b58fb1ad6'

const tokens = {
  ethereum: [
    ADDRESSES.null, // ETH
    ADDRESSES.ethereum.USDC,
    ADDRESSES.ethereum.USDT,
    ADDRESSES.ethereum.WBTC,
    ADDRESSES.ethereum.WSTETH,
    ADDRESSES.ethereum.RETH,
    '0x45804880de22913dafe09f4980848ece6ecbaf78', // PAXG
    '0x68749665ff8d2d112fa859aa293f07a622782f38', // XAUt
    '0x80ac24aa929eaf5013f6436cda2a7ba190f5cc0b', // syrupUSDC
    '0xa3931d71877c0e7a3148cb7eb4463524fec27fbd', // sUSDS
    '0x289ff00235d2b98b0145ff5d4435d3e92f9540a6', // BOOE
    '0x8ad3c73f833d3f9a523ab01476625f269aeb7cf0', // TSLAx
    '0x90a2a4c76b5d8c0bc892a69ea28aa775a8f2dd48', // SPYx
    '0x0b925ed163218f6662a35e0f0371ac234f9e9371', // aEthwstETH
    '0x23878914efe38d27c4d67ab83ed1b93a74d4086a', // aEthUSDT
    '0x4d5f47fa6a74757f35c14fd3a6ef8e3c9bc514e8', // aEthWETH
    '0x5ee5bf7ae06d1be5997a1a72006fe6c607ec6de8', // aEthWBTC
    '0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c', // aEthUSDC
    '0xbdfa7b7893081b35fb54027489e2bc7a38275129', // aEthweETH
  ],
  base: [
    ADDRESSES.null, // ETH
    ADDRESSES.base.USDC,
  ],
  linea: [
    '0x176211869ca2b568f2a7d4ee941e073a821ee1ff', // USDC
  ],
  robinhood: [
    '0x117cc2133c37b721f49de2a7a74833232b3b4c0c', // SPY
    '0xd0601ce157db5bdc3162bbac2a2c8af5320d9eec', // NVDA
  ],
}

module.exports = {
  methodology:
    'Inbound: assets escrowed in the Mercata bridge custody address on each source chain (Ethereum, Base, Linea, Robinhood Chain), each backing a 1:1 wrapped *ST token minted on STRATO; token list mirrors the enabled entries in the on-chain MercataBridge assets registry. Outbound: STRATO-native assets (STRATO, USDST, GOLDST, SILVST) locked in the StratoNativeBridge custody vault while represented on other chains; locked $STRATO is priced against the Ethereum STRATO ERC-20 because it has no price feed on the STRATO chain.',
  start: 1775151906,
  strato: {
    tvl: async (api) => {
      const vault = await api.call({ target: STRATO_NATIVE_BRIDGE, abi: 'function custodyVault() view returns (address)' })
      await api.sumTokens({ owner: vault, tokens: STRATO_NATIVE_TOKENS })
      const stratoLocked = await api.call({ target: STRATO_ON_STRATO, abi: 'erc20:balanceOf', params: vault })
      if (BigInt(stratoLocked) > 0n) api.add(STRATO_ON_ETHEREUM, stratoLocked.toString(), { skipChain: true })
    },
  },
}

Object.entries(tokens).forEach(([chain, list]) => {
  module.exports[chain] = { tvl: sumTokensExport({ owner: CUSTODY, tokens: list }) }
})
