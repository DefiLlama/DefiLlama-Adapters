const { treasuryExports } = require("../helper/treasury");
const { mergeExports } = require("../helper/utils");

const TREASURY = "0xb5dB6e5a301E595B76F40319896a8dbDc277CEfB"
const owners = [TREASURY, "0x1E2cD0E5905AFB73a67c497D82be271Cc65302Eb"]

const DHEDGE_FACTORY = {
  optimism: "0x5e61a079A178f0E5784107a4963baAe0c5a680c6",
  arbitrum: "0xffFb5fB14606EB3a548C113026355020dDF27535",
  polygon: "0xfdc7b8bFe0DD3513Cc669bB8d601Cb83e2F69cB0",
  base: "0x49Afe3abCf66CF09Fab86cb1139D8811C8afe56F",
}

async function dhedgeTvl(api) {
  const factory = DHEDGE_FACTORY[api.chain]
  if (!factory) return api.getBalances()

  const allVaults = await api.call({ abi: 'function getDeployedFunds() view returns (address[])', target: factory })
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: allVaults.map(v => ({ target: v, params: [TREASURY] })), permitFailure: true })

  const held = balances.map((bal, i) => ({ vault: allVaults[i], bal })).filter(({ bal }) => bal && BigInt(bal) > 0n)
  if (!held.length) return api.getBalances()

  const summaries = await api.multiCall({ abi: 'function getFundSummary() view returns (tuple(string name, uint256 totalSupply, uint256 totalFundValue))', calls: held.map(h => h.vault), permitFailure: true })

  summaries.forEach((s, i) => {
    if (!s?.totalSupply || s.totalSupply === '0') return
    api.addUSDValue(held[i].bal / s.totalSupply * s.totalFundValue / 1e18)
  })
  return api.getBalances()
}

const config = {}
const chains = ['ethereum', 'arbitrum', 'optimism', 'polygon', 'base']
chains.forEach(chain => { config[chain] = { owners, resolveLP: true } })

const dhedgeExport = {}
Object.keys(DHEDGE_FACTORY).forEach(chain => { dhedgeExport[chain] = { tvl: dhedgeTvl } })

module.exports = {
  ...mergeExports([treasuryExports(config), dhedgeExport]),
  methodology: "Tracks Infinite Trading treasury holdings across multiple chains including token balances in multisig wallets and the treasury's share of dHEDGE vaults it manages.",
}
