const { addUSDCBalance } = require("../helper/chain/stellar");
const solana = require("../helper/solana");
const suiTx = require("./suiTx");

const data = require("./contracts");

const solanaTvl = async (api) => {
  const tokens = data['solana'].tokens;
  return solana.sumTokens2({ tokensAndOwners: tokens.map(i => [i.tokenAddress, i.poolAddress])});
}

const suiTvl = async (api) => {
  const suiData = data['sui'];
  for (const token of suiData.tokens) {
    const balance = await suiTx.getPoolTokenBalance(token.tokenAddress, suiData.bridgeAddress, suiData.bridgeId);
    api.add(token.tokenAddress, balance);
  }
}

function getTVLFunction(chain) {
  if (chain === 'solana') return solanaTvl;
  if (chain === 'sui') return suiTvl;

  return async function evmTvl(api) {
    const tokensData = data[chain].tokens;
    const tokensAndOwners = tokensData.map(t => [t.tokenAddress, t.poolAddress]);
    return api.sumTokens({ tokensAndOwners, })
  };
}

module.exports = {
  methodology: "All tokens locked in Allbridge Core pool contracts.",
  timetravel: false,
  stellar: { tvl: stellarTvl },
}

Object.keys(data).forEach(chain => {
  module.exports[chain] = {
    tvl: getTVLFunction(chain),
  }
})


async function stellarTvl(api) {
  await addUSDCBalance(api, 'CAOTMWRKNMV5GWSVOMWCTCM5ZZFEQFUSWNLCZXA2KAXD4YG5A4DIPNFT')
}
