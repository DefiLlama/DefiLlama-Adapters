const ADDRESSES = require('../helper/coreAssets.json')
const { call } = require('../helper/chain/stacks-api')

const hBTCContract = ADDRESSES.stacks.hBTC;
const hBTCStateContract = 'SP1S1HSFH0SQQGWKB69EYFNY0B1MHRMGXR3J1FH4D.state-hbtc-v1';

module.exports = {
  methodology: 'TVL is calculated as total hBTC minted on Stacks multiplied by the current share price, expressed in BTC.',
  timetravel: false,
  stacks: {
    tvl: async () => {
      const [microhBTCSupplyStacks, microSharePrice] = await Promise.all([
        call({ target: hBTCContract, abi: 'get-total-supply' }),
        call({ target: hBTCStateContract, abi: 'get-share-price' })
      ]);

      const sharePrice = Number(microSharePrice) / (10 ** 8);
      const hBTCSupplyStacks = Number(microhBTCSupplyStacks.value) / (10 ** 8);

      return { bitcoin: hBTCSupplyStacks * sharePrice };
    }
  },
  misrepresentedTokens: false
}
