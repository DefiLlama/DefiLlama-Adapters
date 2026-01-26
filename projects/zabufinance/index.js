const abi = {
  "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accRewardPerShare)",
  "poolLength": "uint256:poolLength"
}
const { sumTokens2 } = require('../helper/unwrapLPs')

const FARMING_CONTRACT_ADDRESS = "0xf61b4f980A1F34B55BBF3b2Ef28213Efcc6248C4";

const avaxTvl = async (api) => {
  const  tokens = await api.fetchList({  lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: FARMING_CONTRACT_ADDRESS})
  return sumTokens2({ api, tokens: tokens.map(i => i[0]), owner: FARMING_CONTRACT_ADDRESS})
};

module.exports = {
  avax:{
    tvl: avaxTvl,
  },
  methodology:
  'The Zabu Farm Contract Address is used to obtain the balance held in every LP pair and single assets.',
};
