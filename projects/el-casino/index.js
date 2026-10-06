const { sumTokens2 } = require('../helper/unwrapLPs')

// EL-Casino — on-chain casino on Robinhood Chain. Every room (roulette, crash, blackjack, slots, keno, …) is its own
// contract deployed by a game factory; it holds its own token pool that pays winnings and is funded by stakers
// ("become the house"). Rooms are listed from the factories themselves (getTotalGames / getGames).
const ELCAS = '0xE73f12D9d81ff6b11c1d0261F440c2EA4C400E18' // the protocol's own token: rooms in $ELCAS are excluded

const FACTORIES = [
  // V4 game factories
  '0x0a6A06F446CC02Da7a60f5626CC2b9aA27b875f9', '0xEffAbF2a88Ce69175dE0800f9b8Eeb3622ac43b9', '0x9CD4669Ec061f02D594807eE6ADC9502E7d5042b',
  '0x2E615291ecb0a9EF73b8c35771D4746C255aDEfA', '0x2Cd48ACA526D1C68967b5B7ABBc6C48Ef74f4955', '0x72dc6929D0EC4f519B351D4f12E578D17993cf5e',
  '0xE22Ce157f4b8c07311320050f2aC1D0902AD3b27', '0x86E96B1E6bD78279E60cFF9a9b67794d1F33eb6d', '0x0FFCed9E20A00B05eC142C41239AB6a046c9Cecc',
  '0x89B404BA6ED15FC98684Ed34548B3A6c2146b4f5', '0x8166D47477278E0114FDB89C30362214539C4F18',
  // V5 game factories (CasinoHubV5 0xF844142E6F0474a115712d650e58F238f760555d)
  '0x5B9dF3831d50af1b02AE0bdF3061C744C45087b0', '0xbf976d1b6efF1B047f8aE2A5d6259D689b4A536B', '0x4E83A441F280fE9a07DeB88a4a3F4D14Bf5400Eb',
  '0x9b5037eF17598Ff5B6C16d6a9e027c72897828eB', '0x08A9DF94F9C5DE378A283cC4a44Da09909CE3Ab6', '0xCa6F1bE59C06EA6E14412A387eD5f3bCb71B2248',
  '0x5231c0282025799aB38b317F89470C6b7C153A77', '0x7E8bA129e445771dc7a514D5F9E1179a23c1beb4', '0x31929aCE4FBa4C9c98A29559b1aA8D5cf18414a7',
  '0x15DdCF1C6F7CB8A7dfBb9aca792F6CbAcABAa27f', '0xd2Bf1fe7D418C011c8A2b2bD64298Dd3ed9cEF80', '0xae7994D4e25f2965367B55950A1a95a930Aa554A',
  '0x10e02DD0F131Cbb55a97fef5b724541B8A6b378C', '0x6751dD9ADBCE7913Fea529FDe5E561422D017725', '0x553220711d5683205a2644a77755Ba6f7E34b31b',
  '0x25Ac8B77B8e32B1eA9C431127679e4Ff11eC4FA4', '0x7C7ad1370a26E1a7e67A778E9C9820637f76BC1d', '0x796d695569520BE3963CB620A3a3c53b92B606a4',
  '0x64D84eAcEdEe214995d1b30febD8720131DAEE9f', '0x2935fDb03C2F4f4fb32D29032F46357706519268', '0x6dFF48299Ac1Ff559DcEdDDf28AF3B1e5140c6A4',
]
const getGames = 'function getGames(uint256 offset, uint256 limit) view returns (tuple(address gameAddress, address owner, address creator, address token, string tokenLogoUrl, string betName, uint256 createdAt)[])'
const PAGE = 200

async function rooms(api) {
  const totals = await api.multiCall({ abi: 'uint256:getTotalGames', calls: FACTORIES })
  const calls = []
  FACTORIES.forEach((f, i) => { for (let o = 0; o < Number(totals[i]); o += PAGE) calls.push({ target: f, params: [o, PAGE] }) })
  return (await api.multiCall({ abi: getGames, calls })).flat()
}

async function tvl(api) {
  const tokensAndOwners = (await rooms(api)).filter((g) => g.token.toLowerCase() !== ELCAS.toLowerCase()).map((g) => [g.token, g.gameAddress])
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology: 'Sums the tokens held by every EL-Casino room, listed from the V4 and V5 game factories: each room\'s token pool pays winnings and is funded by stakers ("become the house"). Rooms whose pool is in $ELCAS, the protocol\'s own token, are excluded.',
  start: '2026-09-01',
  robinhood: { tvl },
}
