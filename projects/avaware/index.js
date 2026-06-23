const abi = {
    "poolCount": "uint256:poolCount",
    "getPool": "function getPool(uint256 id) view returns (tuple(address pool, string name, uint256 rewardAmount, bool legacy, bool active))",
    "stakingToken": "address:stakingToken"
  };

const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require('../helper/staking');

const FarmPoolManager = "0x7ec4AeaeB57EcD237F35088D11C59525f7D631FE";
const treasuryAddress = "0x9300736E333233F515E585c26A5b868772392709";
const AVE = "0x78ea17559B3D2CF85a7F9C2C704eda119Db5E6dE";

/*** farms TVL portion ***/
const avaxTvl = async (api) => {
  const chain = 'avax'

  const CountOfPools = await api.call({ abi: abi.poolCount, target: FarmPoolManager, })

  const indices = []

  for (let index = 0; index < CountOfPools; index++) {
    if (index == 14) {
      continue // 14 isn't a normal pool, it's NFT staking rewards
    }
    indices.push(index)
  }

  const pools = (await api.multiCall({ target: FarmPoolManager, abi: abi.getPool, calls: indices, })).map(i => i.pool)
  const tokens = await api.multiCall({ abi: abi.stakingToken, calls: pools, })
  return sumTokens2({ api, tokensAndOwners2: [tokens, pools], resolveLP: true, })
};

module.exports = {
  avax: {
    staking: staking(treasuryAddress, AVE),
    tvl: avaxTvl,
  },
  methodology: `We count TVL that is on the Farms threw FarmPoolManager contract 
    and the portion of staking the native token (AVE) by treasury contract`,
};
