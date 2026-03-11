const ADDRESSES = require('../helper/coreAssets.json')
const ITVL = {
  pool2: "uint256:pool2",
  staking: "uint256:staking",
  tvl: "uint256:tvl",
  usd: "address:usd",
}
const tvlGuru = "0x426a4A4B73d4CD173C9aB78d18c0d79d1717eaA9";   //On-Chain Universal TVL Finder
const USD = ADDRESSES.kcc.USDT;   //same as abi.call({target:tvlGuru,abi:ITVL["usd"]})
//NOTE: USD===kcc:USDT is used explicitly to reduce EVM calls by this adapter. It makes this process faster.
async function pool2(api) {
  let _pool2 = await api.call({ target: tvlGuru, abi: ITVL.pool2, });
  api.add(USD, _pool2)
}
async function staking(api) {
  let _staking = await api.call({ target: tvlGuru, abi: ITVL.staking, });
  api.add(USD, _staking)
}
async function tvl(api) {
  let _tvl = await api.call({ target: tvlGuru, abi: ITVL.tvl, });
  api.add(USD, _tvl)
}
module.exports = {
  methodology: "USD-denominated value aggregation of most Locked assets held across kcc.guru's & Kompound Protocol's smart contracts, powered by direct on-chain storage of quantity, pools and prices using ftm.guru's Universal TVL Finder Tool (tvlGuru.sol). More detailed documentation of TVL is available at https://ftm.guru/rawdata/tvl",
  kcc: {
    pool2: pool2,
    staking: staking,
    tvl: tvl
  },
}
