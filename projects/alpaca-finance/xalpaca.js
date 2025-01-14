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


async function calxALPACAtvl(api) {
  const xalpacaAddresses = await getProcolXAlpacaAddresses(api.chain);

  const xalpacaTVL = await api.call({ abi: abi.xalpacaTotalSupply, target: xalpacaAddresses["xALPACA"], })
  const alpacaAddress = xalpacaAddresses["Tokens"]["ALPACA"];
  api.add(alpacaAddress, xalpacaTVL)
}

module.exports = {
  calxALPACAtvl,
}