const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");
const abi = require("./abi.json");

const JITU_CONTRACT_ADDRESS = "0x037BB12721A8876386411dAE5E31ff0c5bA991A8";
const WAVAX = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7';
const AVAX_KUU = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

const avaxTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const erc20TokenAddresses = (
    await utils.fetchURL(
      "https://distributor-public-data-itke7j4u7q-uc.a.run.app/getIndividualSnapshot/0x0Ba99dB0Da8201056831c359d9Ebd354f3466359"
    )
  ).data.assets.map((underlying) => underlying.underlyingTokenAddress);

  const balanceOfAssets = (
    await sdk.api.abi.multiCall({
      abi: abi.borrowableBalance,
      calls: erc20TokenAddresses.map((erc20) => ({
        target: JITU_CONTRACT_ADDRESS,
        params: erc20,
      })),
      chain: "avax",
      block: chainBlocks["avax"],
    })
  ).output.map((boa) => boa.output);

  for (let index = 0; index < erc20TokenAddresses.length; index++) {

    if(erc20TokenAddresses[index] == AVAX_KUU){
      sdk.util.sumSingleBalance(
        balances,
        `avax:${WAVAX}`,
        balanceOfAssets[index]
      );
    }else{
      sdk.util.sumSingleBalance(
        balances,
        `avax:${erc20TokenAddresses[index]}`,
        balanceOfAssets[index]
      );
    }
  }

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  avalanche: {
    tvl: avaxTvl,
  },
  tvl: sdk.util.sumChainTvls([avaxTvl]),
  methodology: `We count as TVL all the assets deposited in JITU contract`,
};
