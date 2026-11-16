const sdk = require('@defillama/sdk')
const abi = {
  "xalpacaTotalSupply": "uint256:supply"
};
const { getConfig } = require('../helper/cache')
const { calLyfTvl } = require("./lyf");
const aExports = require('../alpaca-finance-lend');

// ===== inlined from ./xalpaca =====
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
  start: '2020-10-07',
  methodology: 'Assets held by the leveraged yield farming workers plus idle balances in the lending vaults. Vault debt is not counted on top, only what the workers actually hold.',
  bsc: {
    tvl: sdk.util.sumChainTvls([calLyfTvl, aExports.bsc.tvl]),
    staking: calxALPACAtvl,
  },
  fantom: {
    tvl: sdk.util.sumChainTvls([calLyfTvl, aExports.fantom.tvl]),
    staking: calxALPACAtvl,
  }
};
