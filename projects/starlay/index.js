const { getReserves, getStarlayTvl } = require("./starlay");
const BigNumber = require("bignumber.js");
const { getBorrowed } = require("../helper/aave");
const { TOKENS, DOT_TOKEN, DOT_DECIMALS, DEFAULT_DECIMALS, LAY_ADDRESS } = require("./constanrs");
const { getLockedLAY } = require("./ve");

const transferFromAddress = (underlying) => TOKENS[underlying]

function astar(borrowed) {
  return async (timestamp, block) => {
    const balances = {};
    const [lTokens, reserveTokens, validProtocolDataHelpers] =
      await getReserves(block);
    const chain = "astar";

    if (borrowed) {
      await getBorrowed(
        balances,
        block,
        chain,
        reserveTokens,
        validProtocolDataHelpers,
        transferFromAddress
      );
    } else {
      await getStarlayTvl(
        balances,
        block,
        chain,
        lTokens,
        reserveTokens,
        transferFromAddress
      );
    }

   return Object.keys(balances).reduce((res, key) => {
      if (key.startsWith("0x"))
        return { ...res, [key]: balances[key] };
      if (key === DOT_TOKEN)
        return { ...res, [key]: new BigNumber(balances[key]).shiftedBy(-DOT_DECIMALS) };
      return { ...res, [key]: new BigNumber(balances[key]).shiftedBy(-DEFAULT_DECIMALS) };
    }, {});
  };
}

async function staking(_timestamp, _block, {astar: block}) {
  const chain = "astar"
  const stakedLay = await getLockedLAY(chain, block)
  return {
    [transferFromAddress(LAY_ADDRESS)]: stakedLay.shiftedBy(-DEFAULT_DECIMALS)
  }
}


module.exports = {
  timetravel: true,
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.`,
  astar: {
    tvl: astar(false),
    borrowed: astar(true),
    staking,
  },
};
