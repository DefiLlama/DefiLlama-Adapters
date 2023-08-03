const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { getConfig } = require('../helper/cache')

async function getProcolXAlpacaAddresses(chain) {
  if (chain == "bsc") {
    return (
      await getConfig('alpaca-finance/x-bsc',
        "https://raw.githubusercontent.com/alpaca-finance/xALPACA-contract/main/.mainnet.json"
      )
    )
  }
  if (chain == "fantom") {
    return (
      await getConfig('alpaca-finance/x-fantom',
        "https://raw.githubusercontent.com/alpaca-finance/xALPACA-contract/main/.fantom_mainnet.json"
      )
    )
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