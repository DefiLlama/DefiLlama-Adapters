const { getLogs } = require('../helper/cache/getLogs')
const USDb = "0x1623A55e0BA2384afD7511D6d7f77CF28790B5c5";

const abis = {
  mint: "event Mint(address indexed user, uint256 indexed amount)",
  burn: "event Burn(address indexed user, uint256 indexed amount)"
}

const tvl = async (api) => {
  const [mintedLogs, burntLogs] = await Promise.all([
    getLogs({ api, target: USDb, extraKey: 'mint', eventAbi: abis.mint, onlyArgs: true, fromBlock: 21637199 }),
    getLogs({ api, target: USDb, extraKey: 'burn', eventAbi: abis.burn, onlyArgs: true, fromBlock: 21637199 })
  ])

  const tvlValue = mintedLogs.reduce((sum, log) => sum + log[1], 0n) - burntLogs.reduce((sum, log) => sum + log[1], 0n)
  api.addUSDValue(Number(tvlValue) / 10 ** 18)
}

module.exports = {
  ethereum : { tvl }
}
