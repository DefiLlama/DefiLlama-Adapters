const ADDRESSES = require('../helper/coreAssets.json')
const { addFundsInMasterChef } = require('../helper/masterchef')
const { staking } = require('../helper/staking')
const poolInfoAbi = 'function getPoolInfo(uint256 _pid) view returns (tuple(address stakingToken, uint256 stakingTokenTotalAmount, uint32 lastRewardTime, uint256[] AccRewardsPerShare, uint256[] AllocPoints))'

const tusd = ADDRESSES.ethereum.TUSD
const ifusd = "0x9fC071cE771c7B27b7d9A57C32c0a84c18200F8a"

async function tvl(api) {

  const fusd = await api.call({
    target: '0xad84341756bf337f5a0164515b1f6f993d194e1f',
    params: ifusd, abi: 'erc20:balanceOf',
  })
  const balances = {
    [tusd]: fusd
  }
  const transform = i => `fantom:${i}`
  await addFundsInMasterChef(balances, '0x5bC37CAAA3b490b65F5A50E2553f4312126A8b7e', api.block, 'fantom', transform, poolInfoAbi, [ifusd, "0xa0828eE559110b041DEdbf10Ae0cf42274251de1"])
  return balances
}

module.exports = {
  methodology: 'TVL counts the fUSD deposited to creat ifUSD and the tokens in the masterchef. Steak is counted towards staking and TUSD is used to represent fUSD since fUSD is not on CoinGecko.',
  fantom: {
    staking: staking('0xb632c5d42BD4a44a617608Ad1c7d38f597E22E3C', '0x05848b832e872d9edd84ac5718d58f21fd9c9649'),
    tvl
  },
}