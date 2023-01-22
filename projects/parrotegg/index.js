const { transformArbitrumAddress, transformPolygonAddress, getChainTransform, getFixBalancesSync, transformBalances, } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require('../helper/masterchef');
const STAKING_CONTRACT_ARBITRUM = "0x1cCf20F4eE3EFD291267c07268BEcbFDFd192311"; //MASTERCHEF ARBITRUM
const STAKING_CONTRACT_IOTEX = "0x83E7e97C4e92D56c0653f92d9b0c0B70288119b8";  // MASTERCHEF IOTEX
const STAKING_CONTRACT_POLYGON = "0x34E4cd20F3a4FdC5e42FdB295e5A118D4eEB0b79";  // MASTERCHEF POLYGON
const STAKING_CONTRACT_HARMONY = "0xFb15945E38a11450AF5E3FF20355D71Da72FfE8a";  // MASTERCHEF HARMONY

const arbitrumTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const transformAddress = await transformArbitrumAddress();

  await addFundsInMasterChef(
      balances, STAKING_CONTRACT_ARBITRUM, chainBlocks.arbitrum, 'arbitrum', transformAddress);
  delete balances['0x78055daa07035aa5ebc3e5139c281ce6312e1b22'];  //TOKEN ADDRESS
  delete balances['0x78055dAA07035Aa5EBC3e5139C281Ce6312E1b22']; //TOKEN ADDRESS

  return balances;
};

const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const transformAddress = await transformPolygonAddress();

  await addFundsInMasterChef(
      balances, STAKING_CONTRACT_POLYGON, chainBlocks.polygon, 'polygon', transformAddress);
  delete balances['0xb63e54f16600b356f6d62ddd43fca5b43d7c66fd'];  //TOKEN ADDRESS
  delete balances['0xB63E54F16600b356f6d62dDd43Fca5b43d7c66fd']; //TOKEN ADDRESS

  return balances;
};

const harmonyTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const transformAddress = await getChainTransform('harmony');

  await addFundsInMasterChef(
      balances, STAKING_CONTRACT_HARMONY, chainBlocks.harmony, 'harmony', transformAddress);
  delete balances['0xC36769DFcDF05B2949F206FC34C8870707D33C89'];  //TOKEN ADDRESS
  delete balances['0xC36769DFcDF05B2949F206FC34C8870707D33C89']; //TOKEN ADDRESS

  getFixBalancesSync('harmony')(balances);

  return balances;
};

const iotexTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  
  await addFundsInMasterChef(
      balances, STAKING_CONTRACT_IOTEX, chainBlocks.iotex, 'iotex', i => i);

  return transformBalances('iotex', balances);
};

module.exports={
    timetravel: true,
    arbitrum: {
        tvl: arbitrumTvl
    },
    iotex: {
        tvl: iotexTvl
    },
    polygon: {
        tvl: polygonTvl
    },
    harmony: {
        tvl: harmonyTvl
    },
}
