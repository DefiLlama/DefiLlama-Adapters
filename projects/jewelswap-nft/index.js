const NFT_LENDING_SC_ABI_JSON = require("./jewel-nft-lending.abi.json");
const { sumTokens, queryContractWithAbi } = require("../helper/chain/elrond");
const { nullAddress } = require("../helper/tokenMapping");


const LENDING_POOL = "erd1qqqqqqqqqqqqqpgqhpauarfmx75nf4pwxh2fuy520ym03p8e8jcqt466up";

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  elrond: {
    tvl: () => sumTokens({ owners: [LENDING_POOL] }),
    borrowed,
  }
};

async function borrowed(api) {
  const commonSettings = await queryContractWithAbi({
    target: LENDING_POOL,
    funcName: 'viewCommonSettings',
    outputType: 'CommonSettings',
    abiTypes: NFT_LENDING_SC_ABI_JSON.types,
  })
  api.add(nullAddress, commonSettings.total_loan_amount)
}
