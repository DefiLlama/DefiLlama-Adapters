const ADDRESSES = require('../helper/coreAssets.json')
const ITVL = {
  pool2: "uint256:pool2",
  staking: "uint256:staking",
  tvl: "uint256:tvl",
}

const tvlGuru = "0x0786c3a78f5133F08C1c70953B8B10376bC6dCad";   //On-Chain Universal TVL Finder
const USD = "fantom:" + ADDRESSES.fantom.USDC;   //same as abi.call({target:tvlGuru,abi:ITVL[3]})
//NOTE: USD===fantom:USDC is used explicitly to reduce EVM calls by this adapter. It makes this process faster.

function tvl(abi) {
  return async (_, _b, _cb, { api, }) => {
    return {
      [USD]: (await api.call({ target: tvlGuru, abi: ITVL[abi], })) / 1e12
    }
  }
}

module.exports = {
  methodology: "USD-denominated value aggregation of most Locked assets held across ftm.guru's contracts, powered by direct on-chain storage of quantity, pools and prices using ftm.guru's Universal TVL Finder Tool (tvlGuru.sol). More detailed documentation of TVL is available at https://ftm.guru/rawdata/tvl",
  fantom: {
    pool2: tvl('pool2'),
    staking: tvl('staking'),
    tvl: tvl('tvl'),
  },
}
