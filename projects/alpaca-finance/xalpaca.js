const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const axios = require("axios");

async function getProcolXAlpacaAddresses(chain) {
  if (chain == "bsc") {
    return (
      await axios.get(
        "https://raw.githubusercontent.com/alpaca-finance/xALPACA-contract/main/.mainnet.json"
      )
    ).data;
  }
  if (chain == "fantom") {
    return (
      await axios.get(
        "https://raw.githubusercontent.com/alpaca-finance/xALPACA-contract/main/.fantom_mainnet.json"
      )
    ).data;
  }
}
  

async function calxALPACAtvl(chain, block) {
  const xalpacaAddresses = await getProcolXAlpacaAddresses(chain);

  const xalpacaTVL = (
    await sdk.api.abi.multiCall({
      block,
      abi: abi.xalpacaTotalSupply,
      calls: [
        {
          target: xalpacaAddresses["xALPACA"],
        },
      ],
      chain,
    })
  ).output;
  const alpacaAddress = xalpacaAddresses["Tokens"]["ALPACA"];
  return { [`${chain}:${alpacaAddress}`]: xalpacaTVL[0].output };
}

module.exports = {
  calxALPACAtvl,
}