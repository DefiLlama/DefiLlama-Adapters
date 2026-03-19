const ADDRESSES = require('../helper/coreAssets.json')
const { makeReadOnlyContractCall } = require('../hermetica/stacks-call')

const hBTCContract = ADDRESSES.stacks.hBTC;
const hBTCStateContract = 'SP1S1HSFH0SQQGWKB69EYFNY0B1MHRMGXR3J1FH4D.state-hbtc-v1';

module.exports = {
  methodology: 'TVL is calculated as total hBTC minted on Stacks multiplied by the current share price, expressed in BTC.',
  timetravel: false,
  stacks: {
    tvl: async () => {
      const [microhBTCSupplyStacks, microSharePrice] = await Promise.all([
        makeReadOnlyContractCall({ contract: hBTCContract, function_name: 'get-total-supply' }),
        makeReadOnlyContractCall({ contract: hBTCStateContract, function_name: 'get-share-price' })
      ]);

      const sharePrice = microSharePrice / (10 ** 8);
      const hBTCSupplyStacks = microhBTCSupplyStacks / (10 ** 8);

      return { bitcoin: hBTCSupplyStacks * sharePrice };
    }
  },
  misrepresentedTokens: false
}
