const { sumTokensExport, sumTokens } = require("../helper/unwrapLPs");

const SPOKE_CONTRACT = "0x1E04dA9329A755E77B4c138224Ec5C75cd86439c";
const DAI_CONTRACT = "0x18A39cDd1bFD592F40e4862728DF8879e84bBC91";

async function tvl(_, _1, _2, { api }) {
  const collateralBalance = await api.call({
    abi: "erc20:balanceOf",
    target: DAI_CONTRACT,
    params: [SPOKE_CONTRACT],
  });

  return sumTokensExport({ SPOKE_CONTRACT, DAI_CONTRACT });
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "counts the number of DAI tokens in the spoke contract.",
  wan: {
    tvl,
  },
};
