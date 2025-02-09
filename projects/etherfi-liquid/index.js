const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

const vaults = [
  '0xf0bb20865277aBd641a307eCe5Ee04E79073416C', //eth liq
  '0x08c6F91e2B681FaF5e17227F2a44C307b3C1364C', //usd liq
  '0x5f46d540b6eD704C3c8789105F30E075AA900726', //btc liq
  '0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88',//weeths
  '0x7223442cad8e9cA474fC40109ab981608F8c4273',//weethk
  '0x939778D83b46B456224A33Fb59630B11DEC56663', //eusd
  '0x352180974C71f84a934953Cf49C4E538a6F9c997', //exilir
  '0xeDa663610638E6557c27e2f4e973D3393e844E70', //mev
  '0xbc0f3B23930fff9f4894914bD745ABAbA9588265', //ultra
  '0x83599937c2C9bEA0E0E8ac096c6f32e86486b410', //beraEth
  '0xC673ef7791724f0dcca38adB47Fbb3AEF3DB6C80', //beraBtc
  '0xE77076518A813616315EaAba6cA8e595E845EeE9', //eigen
]

const vaultAccountant = [
  '0x0d05D94a5F1E76C18fbeB7A13d17C8a314088198', //eth liq
  '0xc315D6e14DDCDC7407784e2Caf815d131Bc1D3E7', //usd liq
  '0xEa23aC6D7D11f6b181d6B98174D334478ADAe6b0', //btc liq
  '0xbe16605B22a7faCEf247363312121670DFe5afBE', //weeths
  '0x126af21dc55C300B7D0bBfC4F3898F558aE8156b', //weethk
  '0xEB440B36f61Bf62E0C54C622944545f159C3B790', //eusd
  '0xBae19b38Bf727Be64AF0B578c34985c3D612e2Ba', //exilir
  '0x1D4F0F05e50312d3E7B65659Ef7d06aa74651e0C', //mev
  '0x95fE19b324bE69250138FE8EE50356e9f6d17Cfe', //ultra
  '0x04B8136820598A4e50bEe21b8b6a23fE25Df9Bd8', //beraEth
  '0xF44BD12956a0a87c2C20113DdFe1537A442526B5', //beraBtc
  '0x075e60550C6f77f430B284E76aF699bC31651f75', //eigen
]

async function updateEbtcTvl(api) {
  const chains = ['ethereum', 'base', 'berachain']
  for (const chain of chains) {
    let chainApi = new sdk.ChainApi({ chain: chain, timestamp: api.timestamp })
    if (chain === 'ethereum') {
      chainApi = api;
    }
    const btcBal = await chainApi.call({
      target: '0x657e8C867D8B37dCC18fA4Caead9C45EB088C642',
      abi: 'uint256:totalSupply'
    });
    const btcQuote = await chainApi.call({
      target: '0x1b293DC39F94157fA0D1D36d7e0090C8B8B8c13F',
      abi: 'uint256:getRate'
    });
    api.add(ADDRESSES.ethereum.EBTC, btcBal * btcQuote / 1e8);
  }
  return
}

async function updateVaultTvlExcludingUnderlying(asset, assetString, tvlOracleAddress, api) {
  console.log("updateVaultTvlExcludingUnderlying")
  const optimismApi = new sdk.ChainApi({ chain: 'optimism', timestamp: api.timestamp })
  const tvl = await optimismApi.call({
    target: tvlOracleAddress,
    abi: 'function categoryTVL(string _category) view returns (uint256)',
    params: ['liquid-v2-' + assetString]
  });
  const debt = await optimismApi.call({
    target: tvlOracleAddress,
    abi: 'function categoryTVL(string _category) view returns (uint256)',
    params: ['liquid-v2-' + assetString + '-debt']
  });
  console.log(asset)
  console.log(tvl)
  console.log(debt)
  api.add(asset, tvl - debt);
  return
}

async function tvl(api) {
    const tvlOracle = '0xAB7590CeE3Ef1A863E9A5877fBB82D9bE11504da'
    //Add ebtc to tvl without doublecounting
    await updateEbtcTvl(api);
    //add tvl of vaults excluding underlying assets (excluding eeth and ebtc)
    await updateVaultTvlExcludingUnderlying(ADDRESSES.ethereum.WETH, 'weth', tvlOracle, api);
    await updateVaultTvlExcludingUnderlying(ADDRESSES.ethereum.WBTC, 'wbtc', tvlOracle, api);

  //Update all liquid vaults tvl
  const supplies = await api.multiCall({ calls: vaults, abi: 'uint256:totalSupply' })
  const quotes = await api.multiCall({ calls: vaultAccountant, abi: 'uint256:getRate' })
  const bases = await api.multiCall({ calls: vaultAccountant, abi: 'address:base' })

  for (let i = 0; i < vaults.length; i++) {
    const bvSupply = supplies[i]
    let base = bases[i]
    const quote = quotes[i]
    if (base.toLowerCase() === ADDRESSES.ethereum.WETH.toLowerCase()) {
      base = ADDRESSES.ethereum.EETH //double counted
    }
    if (base.toLowerCase() === ADDRESSES.ethereum.WBTC.toLowerCase()) {
      base = ADDRESSES.ethereum.EBTC //double counted
    }
    const denominator = Math.pow(10, (String(quote).length - 1))
    api.add(base, bvSupply * quote / denominator)
  }
}

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  ethereum: {
    tvl: tvl,
  },
}