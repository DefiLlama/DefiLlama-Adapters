const ADDRESSES = require('../helper/coreAssets.json')

// https://docs.alphasec.trade/for-developers/contract-addresses
const BRIDGE = '0xF31CE581A8440f0f4850eDEb343a28372572a088'       // Native KAIA lockup
const L1_ERC20_GATEWAY = '0x483A9ed25747711F38778a69d4d99b7e5365e506' // ERC20 token lockup

async function tvl(api) {
  return api.sumTokens({
    tokensAndOwners: [
      [ADDRESSES.null, BRIDGE],                                      // KAIA (native)
      [ADDRESSES.klaytn.USDT_1, L1_ERC20_GATEWAY],                  // USDT
      [ADDRESSES.klaytn.WETH, L1_ERC20_GATEWAY],                    // WETH
      [ADDRESSES.klaytn.BORA, L1_ERC20_GATEWAY],                    // BORA
      ['0x18bc5bcc660cf2b9ce3cd51a404afe1a0cbd3c22', L1_ERC20_GATEWAY], // IDRX
      ['0x15d9f3ab1982b0e5a415451259994ff40369f584', L1_ERC20_GATEWAY], // BTCB
    ],
  })
}

module.exports = {
  methodology: 'TVL is the total value of tokens locked in the AlphaSec bridge gateway contracts on Kaia L1.',
  klaytn: {
    tvl,
  },
}
