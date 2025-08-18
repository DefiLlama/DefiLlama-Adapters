const { default: BigNumber } = require('bignumber.js');

const JOYBOT_STAKING_CONTRACT = "0x498B8524c7C309471b65aEAC4f16551776B80e0F"

const staking = async (api) => {
  const total = await api.call({ target: JOYBOT_STAKING_CONTRACT, abi: "uint256:_totalSupply", })
  const floorPrice = 500; // 500 JOY to mint an NFT
  return { 'joystick1': BigNumber(total).multipliedBy(floorPrice) }
}

module.exports = {
  deadFrom: '2024-01-01',
  methodology: "Total value of NFTs sent to staking contract is counted towards staking metric",
  smartbch: {
    tvl: () => ({}),
    staking: staking,
  },
}
