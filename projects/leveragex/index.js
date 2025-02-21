const LEVERAGEX_BASE_EARN = '0xfd916d70eb2d0e0e1c17a6a68a7fbede3106b852'
const LEVERAGEX_BASE_DIAMOND = '0xBF35e4273db5692777EA475728fDbBa092FFa1B3'

async function tvl(api) {
  const config = await api.fetchList({ lengthAbi: 'tokensCount', itemAbi: "function tokens(uint256) view returns (address asset, bytes32 priceFeed, uint256 targetWeightage, bool isActive)", target: LEVERAGEX_BASE_EARN })
  const tokens = config.map(i => i.asset)
  return api.sumTokens({ owners: [LEVERAGEX_BASE_EARN, LEVERAGEX_BASE_DIAMOND], tokens, })
}

module.exports = {
  methodology: `TVL of LeverageX Trading platform leveragex.trade (LPs and Traders).`,
  hallmarks: [
    [1734547635, "Launch of LeverageX.trade"],
  ],
  base: {
    tvl,
  }
}
