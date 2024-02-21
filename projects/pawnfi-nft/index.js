const { sumTokens2, sumTokensExport } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

module.exports = {
  ethereum: {
    tvl: async function tvl(_, _b, _cb, { api, }) {
      const logs = await getLogs({
        api,
        target: '0x82cac2725345ea95a200187ae9a5506e48fe1c5d',
        topics: ['0x0e9af31ba332bde3bd4bd41172ead69274cb4263d5a6f2fa934a14dacefed4b1'],
        eventAbi: 'event PieceTokenCreated (address token, address pieceToken, uint256 pieceTokenLength)',
        onlyArgs: true,
        fromBlock: 17107816,
      })
      return sumTokens2({ api, tokensAndOwners: logs.map(log=>[log.token, log.pieceToken])})
    }, 
    pool2: sumTokensExport({ owner: '0x0f41eAdEc8FA71787516CCC5CEAcBD6430848f9E', resolveUniV3: true})
  }
}
