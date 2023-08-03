const { sumTokensExport, sumTokens2, } = require("../helper/unwrapLPs");
const { getLogs, getAddress } = require('../helper/cache/getLogs');

const polygonStakingContracts = '0x3C868fe859eF46a133e032f22B443e6Efd617449';
const bscStakingContracts = '0x21224834612ecaC194c4b877b49e7794f193d2A2';
const CROWD = "0x483dd3425278C1f79F377f1034d9d2CaE55648B6";
const BscCROWD = "0xA5d4B64a639d93b660cdA04D331374dA1108F8f5";

async function tvl(_, _b, _cb, { api, }) {
  const { factory, fromBlock } = config[api.chain]

  const logs = await getLogs({
    api,
    target: factory,
    topics: ['0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'],
    fromBlock,
  })
  const pools = logs.map(i => getAddress(i.data.slice(0, 64 + 2)))
  const token0s = await api.multiCall({ abi: 'address:token0', calls: pools })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: pools })
  const tokensAndOwners = pools.map((pool, i) => [[token0s[i], pool], [token1s[i], pool]]).flat()
  return sumTokens2({ api, tokensAndOwners })
}

const config = {
  ethereum: { factory: '0xBeA843A2DC516c6F38F159a6a55e80Ec40Cf2286', fromBlock: 16882649, },
  arbitrum: { factory: '0x9ff74eea1e7f0f8ee437b70d68f7cdc1a1030642', fromBlock: 91681087, },
  polygon: { factory: '0xab7dac1daf712693539d770a967a9bc7ba47470c', fromBlock: 37984740, },
  bsc: { factory: '0x08f65111cb9b517b10e5c1e63cb2224467e7988a', fromBlock: 25927093, },
  era: { factory: '0x049D3809043d137591687170Fc323DBcDFe83283', fromBlock: 2714942, },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})

module.exports.polygon.staking = sumTokensExport({ owner: polygonStakingContracts, tokens: [CROWD] })
module.exports.bsc.staking = sumTokensExport({ owner: bscStakingContracts, tokens: [BscCROWD] })
