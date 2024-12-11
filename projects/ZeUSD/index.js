const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json')


const ZeUSD = '0xf9Cb28aca07B76941c461833AA7CBD2909F24640';

// async function tvl(api) {
//   const strategyBalance = await api.call({
//     abi: 'erc20:totalSupply',
//     target: ZeUSD,
//     chain: "ethereum",
//   });


//  api.add(ADDRESSES.ethereum.USDC, strategyBalance)

// }

async function tvlEth(api) {
  const balances = {}

    const totalSupply = (
      await sdk.api.abi.call({
        abi: 'erc20:totalSupply',
        target: ZeUSD,
        chain: "ethereum",
      })
    ).output;

    
    const totalSupplyManta = (
      await sdk.api.abi.call({
        abi: 'erc20:totalSupply',
        target: ZeUSD,
        chain: "manta",
      })
    ).output;

    const total = (totalSupply - totalSupplyManta)/10**18;
    // balances[ ZeUSD] = total
    sdk.util.sumSingleBalance(balances, ADDRESSES.ethereum.USDC, total,"ethereum")
    return  balances
}

async function tvlManta() {
    const balances = {}

    const total = (
      await sdk.api.abi.call({
        abi: 'erc20:totalSupply',
        target: ZeUSD,
        chain: "manta",
      })
    ).output;

    // balances[ADDRESSES.manta.ZeUSD] = total/10**18
    sdk.util.sumSingleBalance(balances, ADDRESSES.ethereum.USDC, total/10**18,"manta")
    return  balances
}

module.exports = {
  methodology: "Total ZeUSD Supply",
  ethereum: {
    tvl:tvlEth,
  },
  manta: {
    tvl:tvlManta,
  },
};
