const abi = {
  "getCurrentTokenId": "function currentTokenId() view returns (uint)",
  "getPositions": "function positions(uint256 tokenId) view returns (uint96 nonce,address operator,address token0,address token1,uint24 fee,int24 tickLower,int24 tickUpper,uint128 liquidity,uint256 feeGrowthInside0LastX128,uint256 feeGrowthInside1LastX128,uint128 tokensOwed0,uint128 tokensOwed1)",
  "getAmountsForTicks": "function getAmountsForTicks(int24,int24,uint128) view returns (uint256,uint256)"
}

const managers = [
  '0x69a3e2f167B35c88C9778F59Ce8C1fFc546c8078',
  '0xe3f50A03525EF520818B111beC1F8c5D67fe307E',
  '0x0F7E99716625FF6E47A4382CB177039ddc6c6Ef4',
  '0x4878Acd29D8eFdF8D3E36f90D00fe242CAD792E5',
  '0xbdf672C6895013c41F134F6b9B1fc51c74Fef9Ee',
  '0xF33e335981F42fe4d93b8C23E3517E33Bd61C7e2',
  '0x385D32300C3D500FC9Ab28010a98b039E0FF2c26',
  '0x9000F4E184Aa2e0bDD1657d78c325c67508555D3',
  '0x1A0E998eF8611142906230050ed3E75882313DAe',
  '0x6EeFc6ceF687783F9eD767637Ae3cf06693c0A82',
  '0x6205A335C76F3dE01f5D75a27E9C90b49A5C69dc',
  '0x54250F1cb24304136A5B05fAbfb0C3Fb1E980169',
  '0x0F6EEFd958287FDF80F5B1D4Ea79B928F9Ae933d',

  '0xc291Ecf279714b7f56b0E5a2051DE4C533184A4E',
  '0x562e92916103a9866b5139dE5269c46d6d3f3117',
  '0x4142B8B00713CE9A441B8e3bd40D692BE56137C3',
  '0xa05b2b641A904292E4D835f882235AF4D3E34e7c',
  '0x3c3260a79a50ECD154d2e2F00C857A06dD0e5619',
  '0x75346B1CF609d2FaCBb6e0b187e658869dd3aE83',

  '0xa5E4A293E90fac283E24b2b6446b8d3bE377e52e',
  '0xEc695B2F9e06A5647a51d733beC0186804cbA991',
  '0x3501512Efc4E051A022c7c255D6f9c33b178E29f',
  '0x2a5075229e02939d4b8888725DF01Cb7374970e8',
  '0x0994b93ae05F904F98F59bb64d9266188543fda5',
  '0x3bBA41A6069F539B7540141460584194De2154Ce',
  '0x4664dc8E1710116ff46693FEB42f16CBe58f8237',
  '0xCF49168017096dB97Eb14552bd0af6eE9a27e76A',
  '0x899DF9d131D2276Db3c5f392ce2b396d9b1BFa8c'
]

async function tvl(api) {
  const positionManagers = await api.multiCall({  abi: 'address:positionManager', calls: managers})
  const tokenIds = await api.multiCall({  abi: abi.getCurrentTokenId, calls: managers})
  const liquidities = await api.multiCall({  abi: abi.getPositions, calls: positionManagers.map((v, i) => ({ target: v, params: tokenIds[i]})) })
  const tokenAmounts = await api.multiCall({  abi: abi.getAmountsForTicks, calls: liquidities.map((v, i) => ({ target: managers[i], params: [v.tickLower, v.tickUpper, v.liquidity]})) })
  
  liquidities.forEach((v, i) => {
    api.add(v.token0, tokenAmounts[i][0])
    api.add(v.token1, tokenAmounts[i][1])
  })
  return api.getBalances()
}

module.exports = {
  doublecounted: true,
  arbitrum: { tvl },
};
