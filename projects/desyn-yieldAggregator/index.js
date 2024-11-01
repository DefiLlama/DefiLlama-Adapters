module.exports = {
  doublecounted: true,
  methodology: 'Engages with DeFi protocols like Lending, DEX, and Restaking, offering both airdrops and structured yield options.',
}

const config = {
  ethereum: {
    safePools: [
      "0xD8e839ee56981BBBAEE3C7Ef1d86f61be62388fC",          // Ether.fi ETH Restaking Fund I (3x Points)
      "0x8F92265FE1F875d1985cD9D4275dd4Cfec9eb1E7",          // DeSyn（Renzo)  ETH Restaking Fund I (3x Points)
      "0x92246d412988d62Df85AcB49efb9712326D8720A",          // Swell ETH Restaking Fund I (3x Points)
      "0x1f99D2d6007908766905975C54779E69c6603c96",          // Kelp DAO ETH Restaking Fund I (5x Points)
      "0xb4Ea811B97858e147875315D982663AE2f54dc87",          // Puffer ETH Restaking Fund I (3x Points)
      "0x24f64858eF2aD549f1339184579f64d7C5567926",          // Eigenpie Mantle ETH Restaking Fund (4x Points)
      "0xcF5997073587466E3e5b241B2580434fa8FD9dA7",          // Eigenpie Lido ETH Restaking Fund (4x Points)
      "0xafB7e9Ee92b2a6ef140CFa0B6aF2b66a6C957b92",          // Eigenpie Swell Restaking Fund (5x Points)
      "0x14063EE05E91E8f840A3F4E7DD0bA9C7013676DA",          // Eigenpie Binance ETH Restaking Fund (4x Points)
      "0x4163B2a81750De9eE468211d66E6aa21A7192671",          // StakeStone Deposit Fund I (2x Points)
      "0x6672D27310fed46665a9cBffCf1850D3A8921af8",          // StakeStone Deposit Fund II (1x Points)
      "0x328EFaaA69dD2A7d023Bb059f81f9ecCBe291397",          // AQQQ
      "0xa0a4cd696d79F6d35d10Df1a0dc92960eF79C72b",          // STK1 ezETH
      "0x26135F2eEd5793062c2020e4F418685568dAb0e6",          // Decentralized Short-term US treasury bill fund
      "0x3909be79015e97138D86f648a1fCBE3a9c6Eb18c"           // Semi Open-end 3x ETH Staking ETF
	]
  },
  arbitrum: {
    safePools: [
      "0xAE4eDB90324C56D893d13140D1F65e3DB156d3bF",          // Kelp DAO ETH Restaking Fund I- ARB(3x Points)
      "0xBdBF12b113Fd66296Eb0B82fA68a8ee5e6E8dAab",          // Ether.fi ETH Restaking Fund I -ARB(3x Points)
    ]
  },
  merlin: {
    safePools: [
      "0xA939D2815a1a90f9Dc66Cab1fdb3F8271E4004Fb",         // Merlinswap LP Fund II - SolvBTC
      "0xA38E07DEe7E1383218Fe14C556ebAf6b0f48B1D6"          // Merlinswap LP Fund I- MBTC
    ]
  },
  btr: {
    safePools:[
      "0xBDFFCBE93309cF6C4BCBA816dDA68B88Aa8F66Ef"          // dwbtc2
    ]
  },
  mode: {
    safePools: []
  },
  zklink: {
    safePools: []
  },
  core: {
    safePools: [
      "0x5F7a561fEB79274904489282fC746c54EeedA1D4",         // dubtc1
      "0xc017af8486D74c06443d01B2Fff16111A18F5943",         // dSolvbtcm1
      "0x6cB698e933f6ba140e79BFb6CB377A32b9518079",         // dsolvtcb1
      "0x5F7a561fEB79274904489282fC746c54EeedA1D4",         // dubtc1
      "0x58845ff38aeba9adfc37a2789ea0f964e906a7c4",         // dubtc2
      "0x5e69d826D3663094321E2cf3C387b7F9Dd7b44Bb",         // dobtc2
      "0xb7669c77745E79cc7B46a2218A5f8E33FD1ef23A",         // dubtc3
      "0x5d2b9cdf26c5506730ed07abdf44c1d86f242ce3"          // dubtc4
    ]
  },
  ailayer: {
    safePools: []
  }
}

// This is aSTETH, 
// before the design of the semi-closed soETH, 
// the contract in order to limit the closure of the time, 
// the user can still deposit, 
// so he was given a maximum value of the balance,
// which will become negative after adding any number, blocking the user to put in
const leverageStaking = '0x1982b2F5814301d4e9a8b0201555376e62F82428'

const abi = {
  getBalance: "function getBalance(address) view returns (uint256)"
}

Object.keys(config).forEach(chain => {
  const { safePools } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const pools = safePools
      const tokens = await api.multiCall({  abi: 'address[]:getCurrentTokens', calls: pools})
      const calls = []
      const allTokens = []
      let i = 0
      for (const pool of pools) {
        for (const token of tokens[i]) {
          if(token == leverageStaking) break
          calls.push({ target: pool, params: token })
          allTokens.push(token)
        }
        i++
      }
      const allBals = await api.multiCall({ abi: abi.getBalance, calls })
      api.add(allTokens, allBals)
    }
  }
})