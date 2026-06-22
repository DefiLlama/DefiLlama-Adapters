const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress, sumTokens2 } = require('../helper/unwrapLPs.js')
const { staking } = require('../helper/staking')

const activePoolAbi = 'address:activePool'

const polygonAddrs = {
  usdc: ADDRESSES.polygon.USDC,
  arthRedeemer: '0x394f4f7db617a1e4612072345f9601235f64b326',
}

const bscAddrs = {
  busd: ADDRESSES.bsc.BUSD,
  arth: '0x85daB10c3BA20148cA60C2eb955e1F8ffE9eAa79',
  arthBusdPool: '0x21de718bcb36f649e1a7a7874692b530aa6f986d',
}

const eth = {
  maha: '0x745407c86df8db893011912d3ab28e68b62e49b0',
  mahax: '0xbdd8f4daf71c2cb16cce7e54bb81ef3cfcf5aacb',
}

async function ethTvl(api) {
  const troves = [
    '0x8b1da95724b1e376ae49fdb67afe33fe41093af5', // ETH Trove
  ]
  const pools = await api.multiCall({ abi: activePoolAbi, calls: troves })
  return sumTokens2({ api, owners: pools, tokens: [nullAddress] })
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'Deposited collateral in loans used to mint ARTH',
  polygon: {
    // TVL contract that holds backing for polygon ARTH
    tvl: sumTokensExport({ owner: polygonAddrs.arthRedeemer, tokens: [polygonAddrs.usdc] }),
  },
  bsc: {
    // ARTH/BUSD Ellipsis pool (stablecoin + ARTH legs)
    pool2: sumTokensExport({ owner: bscAddrs.arthBusdPool, tokens: [bscAddrs.busd, bscAddrs.arth] }),
  },
  ethereum: {
    staking: staking(eth.mahax, eth.maha),
    pool2: sumTokensExport({ tokensAndOwners: [
      ['0xdf34bad1D3B16c8F28c9Cf95f15001949243A038', '0x9ee8110c0aacb7f9147252d7a2d95a5ff52f8496'],
    ] }),
    tvl: ethTvl,
  },
}
