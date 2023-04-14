const sdk = require("@defillama/sdk");
// const ethers = require("ethers");

async function tvl(_timestamp, _b, { thundercore: block }) {
  const { output: ttBalances } = await sdk.api.eth.getBalances({
    targets: ["0xC3C857a9E5Be042C8acF4F2827Aa053e93b5d039"],
    chain: "thundercore",
    block,
  });
  const ttTvl = ttBalances[0].balance;
  return {
    "thunder-token": ttTvl / 1e18,
  };
}

module.exports = {
  timetravel: true,
  methodology: "calculate the total amount of TT locked in the veTT contract",
  thundercore: {
    tvl,
  },
};
