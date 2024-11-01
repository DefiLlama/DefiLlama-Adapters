module.exports = {
  hallmarks: [
    [1719734400, "Launched on Merlin Chain"],
    [1718092800, "DeSyn KelpDAO Restaking Fund Launched"],
    [1713340800, "Restaking Fund Series Launched"]
  ],
  methodology: 'Focused on airdrops from DeSyn and new chains.',
}

const config = {
  ethereum: {
    safePools: ["0x231be62bcFCEfF4f5A7580077543BF9607722c31"]     // IBTC-ETF-BLACKROCK
  },
  arbitrum: {
    safePools: ["0x73c66EC16721b25aF025E280a6353e9f17dd3ceA"]     // SolvBTC Deposit Fund I
   
  },
  merlin: {
    safePools: [
      "0xE9Ea7b95204eA6176519D590fEED5d69F2ed68F2",    // Merl Deposit Fund I
      "0x0F577043BCCb11395daC7481b8B2aB8733FC2A3C",    // SolvBTC Deposit Fund I
      "0x1B47fbF57Cc5dD6F29C0455976AC45b590366aa9"     // solvbtc-1
    ]
  },
  btr: {
    safePools:[
      "0x7be507eA4DD2e7885b7577fc602EeE92016aD9c6",    // dwbtc 
      "0xDA8c0bb4c00C187c6DB4Cdb12ddf5b4a37B3e95d",    // dwstETH1
      "0xa6e398c4E3dE5dbf3B6EDf13c4b90b71d26E5602",    // NAKAMOTO Deposit Fund
      "0x0e1ED27eB508cB7473F634A73BC4f47B7697A63e",    // Dog Deposit Fund
      "0x3e134e41217a27d3949374182Fba39f0A1b7A466",    // ORDI Deposit Fund
      "0x76657FeE7bBC6DEbdBBC90fc43925D451d11ea40",    // Rats Deposit Fund
      "0x3cC90488DbdB9897907379C519768344bc3FCbC4"     // Sats Deposit Fund
    ]
  },
  mode: {
    safePools: [
      "0x557aa8CfcfBA38d1B38a31aE0Fd7baC5Db719aA6",    // dMBTC
      "0xB70752C4526518B2aE094276C969e900bF1C3444"     // duBTC
    ]
  },
  zklink: {
    safePools: [
      "0xb663e25569013BdaEf091E8f454734152eDd5dFd",    // NodeDAO-nETH
      "0x1ccc2353d0cC1C0B201Cf4566141188cD6F335d6",    // NodeDAO-rnETH
      "0x32eE6cb2e0d5B47fab19601Df1A821c4c46393f3"     // ZKL Deposit
    ]
  },
  core: {
    safePools: ["0x9CA0106B58ADE2368cB6bfdb524D92eFBF9a5A72"]     // dOBTC
   
  },
  ailayer: {
    safePools: [
      "0x4BF9D50e81Fcca18f6539e62cb57b41aFaB6244A",    // BBTC Deposit Fund
      "0x7be507eA4DD2e7885b7577fc602EeE92016aD9c6"     // BFBTC Despoit Fund
    ]
  }
}

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