const { nullAddress } = require("../helper/unwrapLPs");

const getTvl = (target) => async (api) => {
  const totalSupply = await api.call({ target, abi: 'uint256:totalSupply' });
  return { [nullAddress]: totalSupply };
};

module.exports = {
  methodology: `Calculated based on the total supply of the rebasing token for each chain. The value represents the total underlying assets locked in the lockbox contract, which are withdrawable as pxETH on the Ethereum mainnet. `,
  sei: { tvl: getTvl('0x9faaea2cdd810b21594e54309dc847842ae301ce') },
  era: { tvl: getTvl('0x8b73bB0557C151Daa39b6ff556e281e445b296D5') },
  ink: { tvl: getTvl('0xcab283e4bb527Aa9b157Bae7180FeF19E2aaa71a') },
  flare: { tvl: getTvl('0x61Ef2d1d8637Dc24e19c2C9dA8f58f6F06C3D31E') },
  // plume: { tvl: getTvl('0xcab283e4bb527Aa9b157Bae7180FeF19E2aaa71a') },
};