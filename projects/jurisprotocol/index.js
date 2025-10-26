const { sumTokens } = require('../helper/chain/cosmos');
const abi = require('./abi.json');

const { contracts, tokens } = abi;

async function tvl(api) {
  await sumTokens({
    api,
    owner: contracts.staking,
    tokens: [
      tokens.LUNC.address,
      tokens.USTC.address,
      tokens.JURIS.address
    ]
  });
}

async function staking(api) {
  await sumTokens({
    api,
    owner: contracts.staking,
    tokens: [tokens.JURIS.address]
  });
}

module.exports = {
  methodology: `${abi.protocol.description}. TVL = JURIS governance token + native LUNC/USTC in Juris Protocol staking contract (Terra Classic).`,
  timetravel: false,
  terra: { tvl, staking }
};
