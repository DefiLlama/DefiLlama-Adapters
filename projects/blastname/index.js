const { default: BigNumber } = require('bignumber.js')
const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { sumTokensAndLPs } = require('../helper/unwrapLPs')

const BNDPoolAddr1 = '0xe875B8D17973a306fd0727B6a578695CE136C2cA'
const BNDPoolAddr2 = '0x56C09e6d859477aF3863408Cf8BA3C427b61782c'
const BNSPoolAddr = '0xb5510aB65418d53961A9fd32A8E6343f942E20Aa'
const BankAddr = '0x819660dcce7f451d879dBcb69A4A183e5fc5FCbc'

const transformAddress = i => `blast:${i}`

async function getTvl() {
  let balances = {}
  const poolInfoFuncAbi = 'function poolInfo(uint256) view returns (bool isNftPool, address poolToken, uint8 nftTier, uint256 nftAmount, uint256 allocPoint, uint256 lastRewardBlock, uint256 accTokenPerShare, bool isStarted)'
  
  const pools = await sdk.api.abi.multiCall({
    calls: [
      {
        target: BNDPoolAddr1,
        params: 2
      },
      {
        target: BNDPoolAddr1,
        params: 3
      },
      {
        target: BNDPoolAddr1,
        params: 4
      },
      {
        target: BNDPoolAddr1,
        params: 5
      }
    ],
    abi: poolInfoFuncAbi,
    chain: 'blast',
  })
  let nftValue = BigNumber(0)
  pools.output.forEach(pool => {
    // Common NFT Price
    let nftPrice = BigNumber(100e+18)
    if (pool.output.nftTier == 2) {
      // Rare NFT
      nftPrice = BigNumber(2000e+18)
    } else if (pool.output.nftTier == 1) {
      // Epic NFT
      nftPrice = BigNumber(20000e+18)
    } else if (pool.output.nftTier == 0) {
      // Legendary NFT
      nftPrice = BigNumber(100000e+18)
    }
    nftValue = nftValue.plus(BigNumber(pool.output.nftAmount).multipliedBy(nftPrice))
  })

  balances[transformAddress(ADDRESSES.blast.USDB)] = nftValue.toNumber()

  let tokens = [
    [ADDRESSES.blast.USDB, BNDPoolAddr1, false],
    ['0xa21406a95195D449646EA97D550CC97BD62B4B7A', BNDPoolAddr1, true],
    ['0xD80f694FB00215262169AFF73f8626f7989353A7', BNDPoolAddr2, true],
    ['0x389daCE33EF8a7E020196F388cF107A881799872', BNSPoolAddr, true],
    ['0xdD9B243A18Fb4e46AefFa26D42797f0Be9F9AfC8', BNSPoolAddr, true],
  ]

  await sumTokensAndLPs(balances, tokens, undefined, 'blast', transformAddress)
  return balances
}

module.exports = {
  blast: {
    tvl: getTvl
  }
}
