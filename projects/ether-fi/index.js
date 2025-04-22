const { nullAddress } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk')

async function updateEbtcTvl(api) {
  const chains = ['ethereum', 'base', 'berachain', 'corn', 'scroll']
  for (const chain of chains) {
    let chainApi = new sdk.ChainApi({ chain: chain, timestamp: api.timestamp })
    if (chain === 'ethereum') {
      chainApi = api;
    }
    const btcBal = await chainApi.call({
      target: '0x657e8C867D8B37dCC18fA4Caead9C45EB088C642',
      abi: 'uint256:totalSupply'
    });
    api.add(ADDRESSES.ethereum.EBTC, btcBal);
  }
  return
}

async function updateEusdTvl(api) {
  const chains = ['ethereum', 'scroll']
  for (const chain of chains) {
    let chainApi = new sdk.ChainApi({ chain: chain, timestamp: api.timestamp })
    if (chain === 'ethereum') {
      chainApi = api;
    }
    const eusdBal = await chainApi.call({
      target: '0x939778D83b46B456224A33Fb59630B11DEC56663',
      abi: 'uint256:totalSupply'
    });
    api.add(ADDRESSES.ethereum.EUSD, eusdBal);
  }
  return
}

function staking(contract, token) {
  return async (api) => {
    api.add(token, await api.call({ target: contract, abi: 'erc20:totalSupply'}))
  }
}

module.exports = {
  doublecounted: true,
  ethereum: {
    staking: staking("0x86B5780b606940Eb59A062aA85a07959518c0161", "0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB"),
    tvl: async ({ timestamp }) => {
      let etherfi_tvl = 0
      const api = new sdk.ChainApi({ timestamp, chain: 'optimism' })
      const block = await api.getBlock()
      //total tvl not stake tvl 
      if (block < 122693890) {
        etherfi_tvl = await api.call({ target: '0x6329004E903B7F420245E7aF3f355186f2432466', abi: 'uint256:getTvl' })
      } else {
        etherfi_tvl = await api.call({ target: '0xAB7590CeE3Ef1A863E9A5877fBB82D9bE11504da', abi: 'function categoryTVL(string _category) view returns (uint256)', params: ['tvl'] })
      }

      return {
        [nullAddress]: etherfi_tvl
      }
    }
  },
  arbitrum: {
    staking: staking("0x86B5780b606940Eb59A062aA85a07959518c0161", "0x7189fb5b6504bbff6a852b13b7b82a3c118fdc27")
  },
  base: {
    staking: staking("0x86B5780b606940Eb59A062aA85a07959518c0161", "0x6C240DDA6b5c336DF09A4D011139beAAa1eA2Aa2")
  }
}
