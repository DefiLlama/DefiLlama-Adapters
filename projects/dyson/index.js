const { getUniTVL } = require('../helper/unknownTokens')

const config = {
  linea: '0xecD30C099c222AbffDaf3E2A3d2455FC8e8c739E',
  polygon_zkevm: '0x51a0d4b81400581d8722627dafcd0c1ff9357d1d',
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getUniTVL({ factory: config[chain], fetchBalances: true, useDefaultCoreAssets: true })
  }
})

const BLAST_USDB_TOKEN_CONTRACT = '0x4300000000000000000000000000000000000003';
const BLAST_WETH_TOKEN_CONTRACT = '0x4300000000000000000000000000000000000004';
const BLAST_DYSN_TOKEN_CONTRACT = '0x9CBD81b43ba263ca894178366Cfb89A246D1159C';
const BLAST_WETHUSDB_PAIR_CONTRACT = '0xdA379FE1369114936B1929Da8CDf61D9aa966452';
const BLAST_DYSNUSDB_PAIR_CONTRACT = '0xff8692b22F82b3187cB088E5328587bE12b24c51';

async function tvl(_, _1, _2, { api }) {
  const usdbBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: BLAST_USDB_TOKEN_CONTRACT,
    params: [BLAST_WETHUSDB_PAIR_CONTRACT],
  });
  const usdbBalanceInDysn = await api.call({
    abi: 'erc20:balanceOf',
    target: BLAST_USDB_TOKEN_CONTRACT,
    params: [BLAST_DYSNUSDB_PAIR_CONTRACT],
  });


  const ethBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: BLAST_WETH_TOKEN_CONTRACT,
    params: [BLAST_WETHUSDB_PAIR_CONTRACT],
  });

  const dysnBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: BLAST_DYSN_TOKEN_CONTRACT,
    params: [BLAST_DYSNUSDB_PAIR_CONTRACT],
  });

  api.add(BLAST_USDB_TOKEN_CONTRACT, usdbBalance)
  api.add(BLAST_WETH_TOKEN_CONTRACT, ethBalance)
  api.add(BLAST_DYSN_TOKEN_CONTRACT, dysnBalance)
  api.add(BLAST_USDB_TOKEN_CONTRACT, usdbBalanceInDysn)
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the number of MINT tokens in the Club Bonding contract.',
  start: 1000235,
  blast: {
    tvl,
  }
}; 