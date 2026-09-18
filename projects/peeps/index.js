const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

const FACTORY = '0x138C1C551bAd0F1c43084ddbC79F5E78225Eb9dD'
const LP_FEE_VAULT = '0xCdD3dBb6e7e2613443d27Ffc3FB041202BBD5259'
const NFT_MANAGER = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3'
const FROM_BLOCK = 10_814_012 // factory deploy

const TokenCreated =
  'event TokenCreated(address indexed token, address indexed curve, address indexed creator, string name, string symbol, bytes32 metadataHash, string metadataUri, address pool, uint8 graduationCap, uint16 postGradCreatorShareBps)'

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: FACTORY,
    fromBlock: FROM_BLOCK,
    eventAbi: TokenCreated,
  })

  const curves = logs.map((i) => i.curve)
  await api.sumTokens({ owners: curves, tokens: [ADDRESSES.null] })

  // Locked graduation LP NFTs live in the Peeps LP fee vault (WETH side only).
  return sumTokens2({
    api,
    owners: [LP_FEE_VAULT],
    resolveUniV3: true,
    uniV3WhitelistedTokens: [ADDRESSES.robinhood.WETH],
    uniV3ExtraConfig: { nftAddress: NFT_MANAGER },
  })
}

module.exports = {
  methodology: 'Peeps TVL is ETH locked in active bonding curves plus WETH in locked Uniswap V3 LP positions held by the Peeps LP fee vault on Robinhood Chain. Launch tokens are not counted.',
  start: '2026-07-16',
  doublecounted: true,
  robinhood: { tvl },
}
