const abi = require("./abi.json");

GOLDLINK_GMX_VAULT_ADDRESS = '0xd8dd54df1a7d2ea022b983756d8a481eea2a382a'
USDC_TOKEN_ADDRESS = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'

async function getTotalDeposits(api, block) {
    const totalAmount = await api.call({
        block,
        target: GOLDLINK_GMX_VAULT_ADDRESS,
        abi: abi.totalAssets,
        chain: 'arbitrum'
      })

    api.add(USDC_TOKEN_ADDRESS, totalAmount);
}

async function getBorrows(api, block) {
  const totalAmount = await api.call({
    block,
    target: GOLDLINK_GMX_VAULT_ADDRESS,
    abi: abi.utilizedAssets_,
    chain: 'arbitrum'
  })

  api.add(USDC_TOKEN_ADDRESS, totalAmount);
}

async function borrowed(timestamp, ethBlock, {arbitrum: block}, {api}) {
  return await getBorrows(api, block)
}


async function tvl(timestamp, ethBlock, {arbitrum: block}, {api}) {
  return await getTotalDeposits(api, block)
}


module.exports = {
    methodology: 'Delta neutral farming in GMX Vault',
    timetravel: true,
    start: 1716638498,
    arbitrum: {
      tvl: tvl,
      borrowed: borrowed,
    },
}