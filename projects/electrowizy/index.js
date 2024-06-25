const sdk = require("@defillama/sdk");

const WIZY_STAKING_CONTRACT = '0x41692d4141A98401F3F0CB729D4886AcBD811a66'
const USDC_TOKEN = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
const WIZY_STAKING_ABI = 'function getTotalStaked() view returns (uint256)'

const tvl = async (api) => {
    const balances = {};

    const totalAssets = await api.call({
        abi: WIZY_STAKING_ABI,
        target: WIZY_STAKING_CONTRACT,
    })

    sdk.util.sumSingleBalance(balances, USDC_TOKEN, totalAssets, api.chain);

    return balances
  };

module.exports = {
    polygon: {
      tvl,
    }
}
  