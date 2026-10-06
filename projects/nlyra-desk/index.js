const ADDRESSES = require('../helper/coreAssets.json')

// NLYRA Desk (https://nlyra.xyz): trading bots, OTC desk and prediction rounds on Robinhood Chain.
// Every contract below is an escrow that holds user funds until the user stops the bot, cancels the
// order or the round settles. All are verified and listed in https://nlyra.xyz/docs (Contracts & Security).
const ESCROWS = [
  '0x9730274e9aB060eB2C9CC3417f85A323aeF7bB6C', // Ladder
  '0x056A87cB9974f78fa4185BCe2e14807cBE357F8F', // Martingale v2
  '0xad55Ab54B38F6eE5aB8408de627C0CE20aeF5Cef', // Martingale v1 (legacy, still holds open cycles)
  '0xC0A3cE7e18FeE382432a18F750756E296D44dD4b', // Spot Grid v1 (legacy)
  '0x994Cf0A4f0E876f52f3b76a2856D93924DA71511', // Spot Grid v3
  '0xF8ef52605FBcc968B24b7FdBD7e93c752A659D5f', // Spot Grid v4
  '0xdd13354cfE3E79a944d8F93476176F016f6311e4', // Spot Grid USDG
  '0x5B8555f254AbD8c4B2a25ca6595Cc4025308584c', // Infinity Grid v1 (legacy)
  '0x6C56f98FF2A3867B43aFf8Cad47EC2b6da81E1ab', // Infinity Grid v2 (legacy)
  '0x177a8837c0444e18677b618624C2a853573d2D7D', // Infinity Grid v3
  '0xBdC77e3D589D161489f7C986d8f654F30b88DDeb', // Infinity Grid v4
  '0x551C66EF613c283FC439AE21DFa9C54c6f6b19a3', // Infinity Grid USDG
  '0x07D52Ced2EA760187Fa83D5AA96A4B8174124a0d', // DCA v1 (legacy)
  '0x630d58f9B8Cb55D8e246268F52596AFc3471fc1d', // DCA v2
  '0xF8bE45D8da70745B9Df1CF17848dfcDD4b4C2309', // TWAP
  '0xE26dd0A09Cd7bA2F7d0a31e4B625E983B0B1B3D2', // Shadow (copy trading)
  '0x6B30B0946743eF8A2D323127c8CfaC9966b5C84c', // Sniper
  '0x9656513aC910a9839B51dB7c92a6914ABB4F52e8', // OTC Desk
  '0x688c265886776005eaF321c7121bF2D1b76676A1', // Predict (BTC up/down rounds)
]

// $NLYRA staking contracts (single-sided)
const NLYRA = '0xb9d3824149ad8ac984153ceec91d5a2405d1fb95'
const STAKING = [
  '0x5e63228add4390f77BbcDb364F6A7b42bA7Aa3ef', // Staking v1 (Synthetix StakingRewards)
  '0x5CB0Cb16cA019bcff4E494b32575848E4CdB5aF8', // Real Yield Staking v2
]

async function tvl(api) {
  const { WETH, USDG, USDe } = ADDRESSES.robinhood
  return api.sumTokens({ owners: ESCROWS, tokens: [ADDRESSES.null, WETH, USDG, USDe] })
}

async function staking(api) {
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', target: NLYRA, calls: STAKING })
  const total = balances.reduce((a, b) => a + Number(b), 0)
  api.addCGToken('neron-lyra', total / 1e18)
}

module.exports = {
  methodology: 'TVL counts the ETH, WETH, USDG and USDe that users keep in the NLYRA Desk escrow contracts (grid, infinity, DCA, TWAP, martingale, ladder, copy-trading and sniper bots, the OTC desk and open Predict rounds). Other tokens held in the escrows (NLYRA itself, and small-cap or look-alike tokens without a reliable price) are not counted. Staking counts the NLYRA deposited in the NLYRA staking contracts.',
  robinhood: {
    tvl,
    staking,
  },
}
