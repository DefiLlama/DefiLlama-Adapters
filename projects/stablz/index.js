const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");

const USDT = ADDRESSES.ethereum.USDT;
const STABLZ_CANNAVEST_RWA_POOL = "0xa030f3e984A08B5Ada0377A9f4EaAF846E6A2cB0";

async function borrowed(api) {
  const bal = await api.call({ abi: 'erc20:totalSupply', target: STABLZ_CANNAVEST_RWA_POOL })
  const usdtBal = await api.call({ abi: 'erc20:balanceOf', target: USDT, params: STABLZ_CANNAVEST_RWA_POOL, })
  api.add(USDT, bal - usdtBal)
}

module.exports = {
  ethereum: {
    borrowed,
    tvl: staking(STABLZ_CANNAVEST_RWA_POOL, USDT),
    staking: staking('0xdb6b004e34a7750e30e59e11281fcb0c73666990', '0xA4Eb9C64eC359D093eAc7B65F51Ef933D6e5F7cd')
  },
  methodology: "Gets the TVL in USDT from the Stablz Cannavest (real world asset) smart contract",
};
