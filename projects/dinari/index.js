const config = {
  arbitrum: {
    "AAPL.d": { oracle: "0x8d0CC5f38f9E802475f2CFf4F9fc7000C2E1557c", token: '0xCe38e140fC3982a6bCEbc37b040913EF2Cd6C5a7' },
    "AAPL.d1": { oracle: "0x8d0CC5f38f9E802475f2CFf4F9fc7000C2E1557c", token: '0x2414faE77CF726cC2287B81cf174d9828adc6636' },
    "AMZN.d": { oracle: "0xd6a77691f071E98Df7217BED98f38ae6d2313EBA", token: '0x5a8A18673aDAA0Cd1101Eb4738C05cc6967b860f' },
    "AMZN.d1": { oracle: "0xd6a77691f071E98Df7217BED98f38ae6d2313EBA", token: '0x8240aFFe697CdE618AD05c3c8963f5Bfe152650b' },
    "GOOGL.d": { oracle: "0x1D1a83331e9D255EB1Aaf75026B60dFD00A252ba", token: '0x9bd7A08cD17d10E02F596Aa760dfE397C57668b4' },
    "GOOGL.d1": { oracle: "0x1D1a83331e9D255EB1Aaf75026B60dFD00A252ba", token: '0x8E50D11a54CFF859b202b7Fe5225353bE0646410' },
    "Meta.d": { oracle: "0xcd1bd86fDc33080DCF1b5715B6FCe04eC6F85845", token: '0xa40c0975607BDbF7B868755E352570454b5B2e48' },
    "Meta.d1": { oracle: "0xcd1bd86fDc33080DCF1b5715B6FCe04eC6F85845", token: '0x519062155B0591627C8A0C0958110A8C5639DcA6' },
    "MSFT.d": { oracle: "0xDde33fb9F21739602806580bdd73BAd831DcA867", token: '0x20f11c1aBca831E235B15A4714b544Bb968f8CDF' },
    "MSFT.d1": { oracle: "0xDde33fb9F21739602806580bdd73BAd831DcA867", token: '0x77308F8B63A99b24b262D930E0218ED2f49F8475' },
    "TSLA.d": { oracle: "0x3609baAa0a9b1f0FE4d6CC01884585d0e191C3E3", token: '0x2888c0aC959484e53bBC6CdaBf2b8b39486225C6' },
    "TSLA.d1": { oracle: "0x3609baAa0a9b1f0FE4d6CC01884585d0e191C3E3", token: '0x36d37B6cbCA364Cf1D843efF8C2f6824491bcF81' },
    // "COIN.d": { oracle: "", token: '0x46b979440AC257151EE5a5bC9597B76386907FA1' },
  }
}

Object.keys(config).forEach(chain => {
  const tokens = Object.values(config[chain]).map(v => v.token)
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const bals = await api.multiCall({  abi: 'erc20:totalSupply', calls: tokens})
      api.add(tokens, bals)
    }
  }
})