const ADDRESSES = require('../helper/coreAssets.json')
const { getConfig } = require('../helper/cache')

const { nullAddress, sumTokens2 } = require('../helper/unwrapLPs')

const vaultAbi = require("./vaultAbi.json");
const cubePoolAbi = require("./cubePoolAbi.json");

const USDC = ADDRESSES.ethereum.USDC;
const WBTC = ADDRESSES.ethereum.WBTC;

const vaults = [
  // Old alpha vault - v0
  "0x55535C4C56F6Bf373E06C43E44C0356aaFD0d21A",
  // New alpha vault - v1
  "0xE72f3E105e475D7Db3a003FfA377aFAe9c2c6c11",
  "0x9bF7B46C7aD5ab62034e9349Ab912C0345164322",
  "0xBD7c6D2edE836b6b27C461799c4e9ecB8F4e8A66"
];

const CUBE_POOL = "0x23F6A2D8d691294c3A1144EeD14F5632e8bc1B67";

async function tvl(api) {
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
  const vaultAmts = await api.multiCall({ abi: vaultAbi.getTotalAmounts, calls: vaults, })
  const token0 = await api.multiCall({ abi: vaultAbi.token0, calls: vaults, })
  const token1 = await api.multiCall({ abi: vaultAbi.token1, calls: vaults, })

  vaultAmts.map((vaultAmt, i) => {
    api.add(token0[i], vaultAmt.total0)
    api.add(token1[i], vaultAmt.total1)
  })

  const poolBalance = await api.call({ abi: cubePoolAbi.poolBalance, target: CUBE_POOL, })
  api.addGasToken(poolBalance)

  // --- Run a check in all options contracts holdings (ETH, USDC, WBTC) ---
  const erc20_holdings = [USDC, WBTC, nullAddress]
  return sumTokens2({ api, tokens: erc20_holdings, owners: OPTIONS_CONTRACTS })
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
  },
};
