  const ADDRESSES = require('../helper/coreAssets.json')
  const BigNumber = require('bignumber.js');

  const v1Tokens = [
    ADDRESSES.ethereum.WETH,
    ADDRESSES.ethereum.WBTC,
    ADDRESSES.ethereum.LINK,
    ADDRESSES.ethereum.SAI,
    ADDRESSES.ethereum.DAI,
    ADDRESSES.ethereum.USDC,
    '0x39AA39c021dfbaE8faC545936693aC917d5E7563', // cUSDC
    '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643', // cDAI
  ]

  async function v1TVL(api) {
    return api.sumTokens({ tokens: v1Tokens, owner: '0x5B67871C3a857dE81A1ca0f9F7945e5670D986Dc'})
  }

  const SUPPLY_SCALE = BigNumber("10").pow(18)

  const getSets = "address[]:getSets"
  const getPositions = 'function getPositions() view returns (tuple(address component, address module, int256 unit, uint8 positionState, bytes data)[])';
  const totalSupply = "uint256:totalSupply";

  async function v2TVL(api) {

    const setAddresses = await api.call({ abi: getSets, target: '0xa4c8d221d8BB851f83aadd0223a8900A6921A349', })

    let supplies = await api.multiCall({ abi: totalSupply, calls: setAddresses, })

    let positionsForSets = await api.multiCall({ abi: getPositions, calls: setAddresses, })

    positionsForSets.forEach(function (positionForSet, i) {
      const setSupply = BigNumber(supplies[i]);
      positionForSet.forEach((position) => {
        const componentAddress = position[0];
        const positionUnits = BigNumber(position[2]);
        const bal = positionUnits.times(setSupply).div(SUPPLY_SCALE)
        api.add(componentAddress, bal.toNumber())
      });
    });
  }

  async function tvl(api) {
    await v1TVL(api);
    await v2TVL(api);
  }

  module.exports = {
    start: '2019-04-10',  // 04/09/2019 @ 10:29pm (UTC)
    ethereum: { tvl }
  }
