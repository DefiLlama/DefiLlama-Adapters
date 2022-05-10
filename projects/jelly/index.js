const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl');
const { staking, stakingPricedLP } = require("../helper/staking");


const factory = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac"
const jelly = "0xf5f06fFa53Ad7F5914F493F16E57B56C8dd2eA80"
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
const jellyUSDCLP = "0x64C2F792038f1FB55da1A9a22749971eAC94463E"
const sweetPool = '0xF897C014a57298DA3453f474312079cC6cB140c0'

// need to include royal also once working
const royalPool = '0xcC43331067234a0014d298b5226A1c22cb0ac66a'


module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on Sushiswap. Staking accounts for the JELLY locked in our farming contracts',
  ethereum: {
    tvl: calculateUsdUniTvl(factory, "ethereum", USDC, [jelly], USDC, 18, true) ,
    staking: stakingPricedLP(sweetPool, jelly, "ethereum", jellyUSDCLP, USDC, true)
  },
}