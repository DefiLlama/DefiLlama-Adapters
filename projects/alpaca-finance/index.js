const abi = {
  "xalpacaTotalSupply": "uint256:supply"
};
const { getConfig } = require('../helper/cache')
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
  methodology: 'Base token balances held by the lending vaults. Vault debt is not counted.',
  bsc: {
    tvl: aExports.bsc.tvl,
    staking: calxALPACAtvl,
  },
  fantom: {
    tvl: aExports.fantom.tvl,
    staking: calxALPACAtvl,
  }
};
