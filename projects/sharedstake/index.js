const sdk = require('@defillama/sdk');
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')

const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const sgtStakingPool = "0xc637dB981e417869814B2Ea2F1bD115d2D993597"
const sgt = "0x84810bcF08744d5862B8181f12d17bfd57d3b078"
const pool2StakingPool = "0x64A1DB33f68695df773924682D2EFb1161B329e8"
const sgtPool2Token = "0x3d07f6e1627DA96B8836190De64c1aED70e3FC55"

async function pool2(timestamp, block) {
  const balances = {}
  const sgtLPStaked = await sdk.api.erc20.balanceOf({
    block,
    target:sgtPool2Token,
    owner: pool2StakingPool
  })
  await unwrapUniswapLPs(balances, [{
    token: sgtPool2Token,
    balance: sgtLPStaked.output
  }], block)

  return balances
}

async function tvl(timestamp, block) {
  const eth2Supply = await sdk.api.erc20.totalSupply({
    target: '0x898bad2774eb97cf6b94605677f43b41871410b1',
    block
  })
  const sgtStaked = await sdk.api.erc20.balanceOf({
    block,
    target:sgt,
    owner: sgtStakingPool
  })

  return {
    [wethAddress]: eth2Supply.output,
    [sgt]: sgtStaked.output
  }
}

module.exports = {
  ethereum: {
    tvl,
    pool2
  },
  tvl
}