const { nullAddress } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

function staking(contract, token) {
  return async (api) => {
    api.add(token, await api.call({ target: contract, abi: 'erc20:totalSupply'}))
  }
}

WBTC = {'ethereum': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', 'arbitrum': '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', 'berachain': '0x0555e30da8f98308edb960aa94c0db47230d2b9c',}
LBTC = {'ethereum':'0x8236a87084f8b84306f72007f36f2618a5634494', 'base': '0xecac9c5f704e954931349da37f60e39f515c11c1', 'berachain': '0xecac9c5f704e954931349da37f60e39f515c11c1', }
CBBTC = {'ethereum': '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf', 'base': '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf', 'arbitrum': '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf'}

async function ebtc_staking(timestamp) {
  const api = new sdk.ChainApi({ timestamp, chain: 'ethereum' })
  const EBTC = '0x657e8C867D8B37dCC18fA4Caead9C45EB088C642'
  //ethereum, arb , berachain, base
  //'ethereum-karak':'0x468c34703F6c648CCf39DBaB11305D17C70ba011', 'ethereum-karak': '0x9C0823D3A1172F9DdF672d438dec79c39a64f448'
  let wbtc_held = 0
  let lbtc_held = 0
  let cbbtc_held = 0
  for (const chain in WBTC) {
    const api = new sdk.ChainApi({ timestamp, chain: chain })
    const token = WBTC[chain]
    const supply = await api.call({ target: token, abi: 'erc20:balanceOf', params: [EBTC] })
    wbtc_held += parseInt(supply)
  }

  for (const chain in LBTC) {
    const api = new sdk.ChainApi({ timestamp, chain: chain })
    const token = LBTC[chain]
    const supply = await api.call({ target: token, abi: 'erc20:balanceOf', params: [EBTC] })
    lbtc_held += parseInt(supply)
  }
  for (const chain in CBBTC) {
    const api = new sdk.ChainApi({ timestamp, chain: chain })
    const token = CBBTC[chain]
    const supply = await api.call({ target: token, abi: 'erc20:balanceOf', params: [EBTC] })
    cbbtc_held += parseInt(supply)
  }
  //karak and symbiotic
  const lbtc_karak = await api.call({ target: '0x468c34703F6c648CCf39DBaB11305D17C70ba011', abi: 'erc20:balanceOf', params: [EBTC] })
  const wbtc_karak = await api.call({ target: '0x126d4dBf752AaF61f3eAaDa24Ab0dB84FEcf6891', abi: 'erc20:balanceOf', params: [EBTC] })
  const lbtc_symbiotic = await api.call({ target: '0x9C0823D3A1172F9DdF672d438dec79c39a64f448', abi: 'erc20:balanceOf', params: [EBTC] })
  const wbtc_symbiotic = await api.call({ target: '0x971e5b5D4baa5607863f3748FeBf287C7bf82618', abi: 'erc20:balanceOf', params: [EBTC] })
  const holder_address = '0xd4E20ECA1f996Dab35883dC0AD5E3428AF888D45';
  const lbtc_held_holder = await api.call({ target: LBTC['ethereum'], abi: 'erc20:balanceOf', params: [holder_address] })
  lbtc_held += parseInt(lbtc_karak) + parseInt(lbtc_symbiotic) + parseInt(lbtc_held_holder)
  wbtc_held += parseInt(wbtc_karak) + parseInt(wbtc_symbiotic)

  return [lbtc_held, wbtc_held, cbbtc_held]
}

module.exports = {
  doublecounted: true,
  ethereum: {
    staking: staking("0x86B5780b606940Eb59A062aA85a07959518c0161", "0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB"), //ethfi

    tvl: async ({ timestamp }) => { 
      const [lbtc_held, wbtc_held, cbbtc_held] = await ebtc_staking(timestamp)
      console.log(lbtc_held, wbtc_held, cbbtc_held)
      const api = new sdk.ChainApi({ timestamp, chain: 'optimism' })
      const ethereum_api = new sdk.ChainApi({ timestamp, chain: 'ethereum' })
      const eth_supply = await api.call({ target: '0x6329004E903B7F420245E7aF3f355186f2432466', abi: 'uint256:getTvl' })
      const looped_tvl = await api.call({ target: '0xAB7590CeE3Ef1A863E9A5877fBB82D9bE11504da', abi: 'function categoryTVL(string _category) view returns (uint256)', params: ['liquideth'] })
      console.log("looped_tvl", looped_tvl)
      console.log("eth_supply", eth_supply)
      const etherfi_eth_tvl = eth_supply - looped_tvl
      const eusd = await ethereum_api.call({ target: '0x939778D83b46B456224A33Fb59630B11DEC56663', abi: 'uint256:totalSupply' }) / 10 ** 12
      return {
        [nullAddress]: etherfi_eth_tvl,
        [ADDRESSES.ethereum.USDC]: eusd, 
        [LBTC['ethereum']]: lbtc_held,
        [WBTC['ethereum']]: wbtc_held,
        [CBBTC['ethereum']]: cbbtc_held,
      }
    }
  },
  arbitrum: {
    staking: staking("0x86B5780b606940Eb59A062aA85a07959518c0161", "0x7189fb5b6504bbff6a852b13b7b82a3c118fdc27") //ethfi
  },
  base: { 
    staking: staking("0x86B5780b606940Eb59A062aA85a07959518c0161", "0x7189fb5b6504bbff6a852b13b7b82a3c118fdc27"), //ethfi
  },
}
