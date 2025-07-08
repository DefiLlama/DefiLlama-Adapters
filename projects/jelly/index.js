const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");

const jelly = "0xf5f06fFa53Ad7F5914F493F16E57B56C8dd2eA80"
const USDC = ADDRESSES.ethereum.USDC
const jellyUsdcLP = "0x64C2F792038f1FB55da1A9a22749971eAC94463E"
const sweetPool = '0xF897C014a57298DA3453f474312079cC6cB140c0'
const royalPool = '0xcC43331067234a0014d298b5226A1c22cb0ac66a'


module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on Sushiswap. Staking accounts for the JELLY locked in our farming contracts',
  ethereum: {
    pool2: staking([sweetPool, royalPool], [jellyUsdcLP]),
    tvl: () => ({}),
  },
}
