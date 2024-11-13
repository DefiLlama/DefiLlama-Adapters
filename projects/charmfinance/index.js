const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { getConfig } = require('../helper/cache')

const { sumTokens } = require('../helper/unwrapLPs')

const vaultAbi = require("./vaultAbi.json");
const cubePoolAbi = require("./cubePoolAbi.json");

const USDC = ADDRESSES.ethereum.USDC;
const WBTC = ADDRESSES.ethereum.WBTC;
const ETH = ADDRESSES.null;

const vaults = [
  // Old alpha vault - v0
  "0x55535C4C56F6Bf373E06C43E44C0356aaFD0d21A",
  // New alpha vault - v1
  "0xE72f3E105e475D7Db3a003FfA377aFAe9c2c6c11",
  "0x9bF7B46C7aD5ab62034e9349Ab912C0345164322",
  "0xBD7c6D2edE836b6b27C461799c4e9ecB8F4e8A66"
];

const CUBE_POOL = "0x23F6A2D8d691294c3A1144EeD14F5632e8bc1B67";

async function tvl(timestamp, block) {
  let balances = {};

  const optionsContracts = (
    await getConfig('charm-finance',
      "https://raw.githubusercontent.com/charmfinance/options-protocol/main/markets.yaml"
    )
  );

  const optionsContractsWithoutComments = optionsContracts
    .split('\n')
    .map(i => i.trim())
    .filter(i => !i.startsWith('#'))  // removing comments here
    .join('')

  const OPTIONS_CONTRACTS = JSON.parse(optionsContractsWithoutComments);
  const vaultCalls = vaults.map(v => ({ target: v }))
  const { output: vaultAmts } = await sdk.api.abi.multiCall({ abi: vaultAbi.getTotalAmounts, calls: vaultCalls, block, })
  const { output: token0 } = await sdk.api.abi.multiCall({ abi: vaultAbi.token0, calls: vaultCalls, block, })
  const { output: token1 } = await sdk.api.abi.multiCall({ abi: vaultAbi.token1, calls: vaultCalls, block, })

  vaultAmts.map((vaultAmt, i) => {
    sdk.util.sumSingleBalance(balances, token0[i].output, vaultAmt.output.total0);
    sdk.util.sumSingleBalance(balances, token1[i].output, vaultAmt.output.total1);
  })

  const { output: poolBalance } = await sdk.api.abi.call({ abi: cubePoolAbi.poolBalance, target: CUBE_POOL, block, })
  sdk.util.sumSingleBalance(balances, ETH, poolBalance);

  // --- Run a check in all options contracts holdings (ETH, USDC, WBTC) ---
  const erc20_holdings = [USDC, WBTC]
  const tokensAndOwners = []
  erc20_holdings.forEach(t => OPTIONS_CONTRACTS.forEach(o => tokensAndOwners.push([t, o])))
  const { output: ethBalances } = await sdk.api.eth.getBalances({ targets: OPTIONS_CONTRACTS, block })
  Object.values(ethBalances).forEach(item => {
    sdk.util.sumSingleBalance(balances, ETH, item.balance)
  })

  return sumTokens(balances, tokensAndOwners, block)
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
  },
};
