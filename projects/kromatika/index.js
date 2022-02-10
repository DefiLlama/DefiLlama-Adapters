const sdk = require("@defillama/sdk");
const { getBlock } = require('../helper/getBlock');
const BigNumber = require('bignumber.js');

const contracts = {
  optimism: {
    KROM: '0xf98dcd95217e15e05d8638da4c91125e59590b07',
    position: '0x7314Af7D05e054E96c44D7923E68d66475FfaAb8'
  }
}

tvl = (chain) => async function (timestamp, ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, chain, chainBlocks, false)
  const underlying = contracts[chain].KROM;
  const {output: balance} = await sdk.api.erc20.balanceOf({
    target: underlying,
    owner: contracts[chain].position,
    block,
    chain
  });
  const balances = {};
  sdk.util.sumSingleBalance(balances, 'kromatika', BigNumber(balance).div(1e18).toFixed(0));
  return balances
}

module.exports = {
  methodology: "Kromatika KROM held by contract",
  optimism: {
    tvl: tvl('optimism')
  }
};
