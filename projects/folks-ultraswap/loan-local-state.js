const { encodeAddress } = require("../helper/chain/algorandUtils/address");
const { parseUint64s, getParsedValueFromState } = require("./utils");

function loanLocalState(state) {
  // standard
  const userAddress = encodeAddress(
    Buffer.from(String(getParsedValueFromState(state, "u")), "base64")
  );
  const colPls = parseUint64s(String(getParsedValueFromState(state, "c")));
  const borPls = parseUint64s(String(getParsedValueFromState(state, "b")));
  const colBals = parseUint64s(String(getParsedValueFromState(state, "cb")));
  const borAms = parseUint64s(String(getParsedValueFromState(state, "ba")));
  const borBals = parseUint64s(String(getParsedValueFromState(state, "bb")));
  const lbii = parseUint64s(String(getParsedValueFromState(state, "l")));
  const sbir = parseUint64s(String(getParsedValueFromState(state, "r")));
  const lsc = parseUint64s(String(getParsedValueFromState(state, "t")));

  // custom
  const collaterals = [];
  const borrows = [];
  for (let i = 0; i < 15; i++) {
    // add collateral
    collaterals.push({
      poolAppId: Number(colPls[i]),
      fAssetBalance: colBals[i],
    });

    // add borrow
    borrows.push({
      poolAppId: Number(borPls[i]),
      borrowedAmount: borAms[i],
      borrowBalance: borBals[i],
      latestBorrowInterestIndex: lbii[i],
      stableBorrowInterestRate: sbir[i],
      latestStableChange: lsc[i],
    });
  }

  return {
    userAddress,
    collaterals,
    borrows,
  };
}

module.exports = {
  loanLocalState,
};
