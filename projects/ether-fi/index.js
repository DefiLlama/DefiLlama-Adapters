const { nullAddress } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

function staking(contract, token) {
  return async (api) => {
    api.add(token, await api.call({ target: contract, abi: 'erc20:totalSupply'}))
  }
}

function multiAssetStaking(contracts, tokens) {
  return async (api) => {
    for (let i = 0; i < contracts.length; i++) {
      api.add(tokens[i], await api.call({ target: contracts[i], abi: 'erc20:totalSupply'}))
    }
  }
}

module.exports = {
  doublecounted: true,
  ethereum: {
    //etherfi stake page is supply of staked : eeth, ebtc, eusd, ethfi 
    staking: staking("0x86B5780b606940Eb59A062aA85a07959518c0161", "0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB"), //ethfi
    staking: staking("0x35fA164735182de50811E8e2E824cFb9B6118ac2", "0x35fA164735182de50811E8e2E824cFb9B6118ac2"), //eeth
    staking: staking("0x657e8C867D8B37dCC18fA4Caead9C45EB088C642", "0x657e8C867D8B37dCC18fA4Caead9C45EB088C642"), //ebtc
    staking: staking("0x939778D83b46B456224A33Fb59630B11DEC56663", "0x939778D83b46B456224A33Fb59630B11DEC56663"), //eusd

    //total tvl (not stake tvl)
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
    staking: staking("0x86B5780b606940Eb59A062aA85a07959518c0161", "0x7189fb5b6504bbff6a852b13b7b82a3c118fdc27") //ethfi
  },
  base: { //etherfi stake should increase these as they are not on ethereum mainnet
    staking: staking("0x86B5780b606940Eb59A062aA85a07959518c0161", "0x7189fb5b6504bbff6a852b13b7b82a3c118fdc27"), //ethfi
    staking: staking("0x657e8C867D8B37dCC18fA4Caead9C45EB088C642", "0x657e8C867D8B37dCC18fA4Caead9C45EB088C642"), //ebtc,  
  },
  berachain: { //etherfi stake should increase these as they are not on ethereum mainnet
    staking: staking("0x657e8C867D8B37dCC18fA4Caead9C45EB088C642", "0x657e8C867D8B37dCC18fA4Caead9C45EB088C642") //ebtc 
  },
  scroll: { //etherfi stake should increase these as they are not on ethereum mainnet
    staking: staking("0x657e8C867D8B37dCC18fA4Caead9C45EB088C642", "0x657e8C867D8B37dCC18fA4Caead9C45EB088C642"), //ebtc,  
    staking: staking("0x939778D83b46B456224A33Fb59630B11DEC56663", "0x939778D83b46B456224A33Fb59630B11DEC56663") //eusd
  }
}
