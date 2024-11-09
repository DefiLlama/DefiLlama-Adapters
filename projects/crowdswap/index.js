const { sumTokensExport, sumTokens2, } = require("../helper/unwrapLPs");
const { getLogs, getAddress } = require('../helper/cache/getLogs');

const polygonStakingContracts = '0x3C868fe859eF46a133e032f22B443e6Efd617449';
const bscStakingContracts = '0x21224834612ecaC194c4b877b49e7794f193d2A2';
const CROWD = "0x483dd3425278C1f79F377f1034d9d2CaE55648B6";
const BscCROWD = "0xA5d4B64a639d93b660cdA04D331374dA1108F8f5";

async function tvl(api) {
  const { factories } = config[api.chain]
  const ownerTokens = []

  for (const { factory, fromBlock } of factories) {
    const logs = await getLogs({
      api,
      target: factory,
      topics: ['0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'],
      fromBlock,
    })
    const pools = logs.map(i => getAddress(i.data.slice(0, 64 + 2)))
    const token0s = await api.multiCall({ abi: 'address:token0', calls: pools })
    const token1s = await api.multiCall({ abi: 'address:token1', calls: pools })
    pools.map((pool, i) => ownerTokens.push([[token0s[i], token1s[i]], pool]))
  }
  return sumTokens2({ api, ownerTokens })
}

const config = {
  ethereum: { factories: [{ factory: '0xBeA843A2DC516c6F38F159a6a55e80Ec40Cf2286', fromBlock: 16882649, },], },
  arbitrum: { factories: [{ factory: '0x9ff74eea1e7f0f8ee437b70d68f7cdc1a1030642', fromBlock: 91681087, }, { factory: '0xd61B1c7974DFBC4eD60ea5625f0Ba08E7C80D99a', fromBlock: 114501051, },], },
  polygon: { factories: [{ factory: '0xab7dac1daf712693539d770a967a9bc7ba47470c', fromBlock: 37984740, }, { factory: '0x14Fb5ABeA0578B37D9E1A831Bb7e77Bd3d7684a6', fromBlock: 45261628, },], },
  bsc: { factories: [{ factory: '0x08f65111cb9b517b10e5c1e63cb2224467e7988a', fromBlock: 25927093, },], },
  era: { factories: [{ factory: '0x049D3809043d137591687170Fc323DBcDFe83283', fromBlock: 2714942, },], },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})

module.exports.polygon.staking = sumTokensExport({ owner: polygonStakingContracts, tokens: [CROWD] })
module.exports.bsc.staking = sumTokensExport({ owner: bscStakingContracts, tokens: [BscCROWD] })
