const { sumTokens2 } = require('../helper/unwrapLPs')

const POOLS = [
  '0x38847b47dD95a97B48F480c20B988b050Cdc80Ab',  // 500 MON
  '0x4C5F83411AfA37e11DD274C8bFa2B7a052A4D3e4',  // 5,000 MON
  '0x273fFc1ab2873b8A1A7cc73dAF92eCc144C67a2e',  // 50,000 MON
  '0xBc8C4062B8e898C2AeE7f0AF686cE3C189392E22',  // 500,000 MON
  '0xd063fdF34a389557bB8E6b94343d7F6BBB66776e',  // 5,000,000 MON
]

async function tvl(api) {
  return sumTokens2({ 
    api, 
    owners: POOLS, 
    tokens: ['0x0000000000000000000000000000000000000000'] // Native MON
  })
}

module.exports = {
  methodology: 'TVL is calculated by summing the native MON balance in all Ghost Protocol privacy pools.',
  monad: {
    tvl
  }
}
