const sdk = require('@defillama/sdk')
const utils = require('../helper/utils');
const { ethers } = require("ethers");
const ADDRESSES = require('../helper/coreAssets.json')
const { USDC } = ADDRESSES.ethereum


// treasury address: 0xc47ec74a753acb09e4679979afc428cde0209639
async function tvl(_, _1, _2, { api }) {
  let balances = {};

  const toWei = async(address, balance) => {
    if (!+balance > 0) return;
    const decimals = await api.call({
      abi: 'erc20:decimals',
      target: address,
    })
    return ethers.utils.parseUnits((balance >> 0).toString(), decimals).toString()
  }

  const response = await utils.fetchURL('https://api.spiral.farm/data/eth/treasury');
  if (response.data.success) {
    for (let [address, info] of Object.entries(response.data.tokens)){
      if (address === 'eth'){
        await sdk.util.sumSingleBalance(balances, 'ethereum', info.totalAmount)
      } else {
        await sdk.util.sumSingleBalance(balances, address, await toWei(address, info.totalAmount))
      }

    }
    await sdk.util.sumSingleBalance(balances, USDC,
      await toWei(USDC, response.data.extraUsdValues.tokenRedeemContractUsdcBalance))
    await sdk.util.sumSingleBalance(balances, USDC, response.data.extraUsdValues.bribes)
  }

  return balances;
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl
  }
}