const { staking } = require("../helper/staking.js");

const STAKING_BASE = '0xE420BBb4C2454f305a3335BBdCE069326985fb5b'
const FREEZER_BASE = '0x03e225D2bd32F5ecE539005B57F9B94A743ADBFB'
const VESTING_BASE = '0x42a40321843220e9811A1385D74d9798436f7002'
const JAV_BASE = '0xEdC68c4c54228D273ed50Fc450E253F685a2c6b9'
const LEVERAGEX_BASE_EARN = '0xfd916d70eb2d0e0e1c17a6a68a7fbede3106b852'
const LEVERAGEX_BASE_DIAMOND = '0xBF35e4273db5692777EA475728fDbBa092FFa1B3'

async function tvl(api) {
  const config = await api.fetchList({ lengthAbi: 'tokensCount', itemAbi: "function tokens(uint256) view returns (address asset, bytes32 priceFeed, uint256 targetWeightage, bool isActive)", target: LEVERAGEX_BASE_EARN })
  const tokens = config.map(i => i.asset)
  return api.sumTokens({ owners: [LEVERAGEX_BASE_EARN, LEVERAGEX_BASE_DIAMOND], tokens, })
}

module.exports = {
  methodology: `We count the TVL of LeverageX Trading platform leveragex.trade (LPs and Traders). And TVL from staking and freezer of javsphers native token JAV.`,
  hallmarks: [
    [1733837635, "Migration to BASE"],
  ],
  base: {
    tvl,
    staking: staking([STAKING_BASE, FREEZER_BASE], JAV_BASE),
    vesting: staking(VESTING_BASE, JAV_BASE)
  },
  defichain_evm: {
    tvl: () => { },
    staking: () => { },
  },
  defichain: {
    tvl: () => { },
  },
}
