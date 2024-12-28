const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress } = require("../helper/tokenMapping");

const UNIIOTX_TOKEN_CONTRACT = ADDRESSES.bob.uniBTC;
const IOTX_STAKING_CONTRACT = "0x2c914Ba874D94090Ba0E6F56790bb8Eb6D4C7e5f";

async function tvl(api) {
  const totalSupply = await api.call({
    abi: 'erc20:totalSupply',
    target: UNIIOTX_TOKEN_CONTRACT,
  });

  const exchangeRatio = await api.call({
    abi: 'function exchangeRatio() external view returns (uint ratio)',
    target: IOTX_STAKING_CONTRACT,
  });

  api.add(nullAddress, totalSupply * exchangeRatio / 1e18)
}

module.exports = {
  methodology: 'Counts the total amount of IOTX under management by the IOTXStaking contract.',
  iotex: {
    tvl,
  }
};
