const { nullAddress } = require('../helper/unwrapLPs')

const TREASURY_V1 = '0xc7220C3004662ef3942aef43452893086b9D6fB5'
const TREASURY_V2 = '0x8dD84F1901BD74A4D137f0f6a5A3A90E686AAB1D'
const UFG = '0xEfAb538Cf3C29237A47c6aFB145D50Ddf204A0A3'

// sfrxETH on Robinhood Chain is the LayerZero OFT of Frax, 1:1 with sfrxETH shares on Ethereum.
const SFRXETH = '0x00000000883279097A49dB1f2af954EAd0C77E3c'
const SFRXETH_ETHEREUM = 'ethereum:0xac3E018457B222d93114458476f3E3416Abbe38F'

// v1 holds native ETH, v2 holds sfrxETH. A holder burns $UFG for a share of both.
async function tvl(api) {
  await api.sumTokens({ owner: TREASURY_V1, tokens: [nullAddress] })
  const shares = await api.call({ abi: 'erc20:balanceOf', target: SFRXETH, params: TREASURY_V2 })
  api.add(SFRXETH_ETHEREUM, shares, { skipChain: true })
}

// v2 lends sfrxETH against $UFG collateral. Loans count at principal, as in the contract.
async function borrowed(api) {
  const principal = await api.call({ abi: 'uint256:principalOutstanding', target: TREASURY_V2 })
  api.add(SFRXETH_ETHEREUM, principal, { skipChain: true })
}

// $UFG that borrowers posted as collateral in v2.
async function staking(api) {
  const collateral = await api.call({ abi: 'uint256:totalCollateral', target: TREASURY_V2 })
  api.add(UFG, collateral)
}

module.exports = {
  methodology:
    'TVL is the native ETH held by UFG treasury v1 and the sfrxETH held by UFG treasury v2 on Robinhood Chain. Holders of $UFG can burn the token to redeem a pro-rata share of both treasuries. Borrowed is the sfrxETH principal that treasury v2 has lent against $UFG collateral. Staking is the $UFG posted as collateral in treasury v2.',
  start: '2026-08-30',
  robinhood: { tvl, borrowed, staking },
}
