const CANTO_NOTE_TOKEN_CONTRACT = '0xEe602429Ef7eCe0a13e4FfE8dBC16e101049504C';
const CANTO_WINDFALL_CONTRACT = '0x2d9dDE57Ec40baF970Dbc8f7933861013B661c93';

const BLAST_USDB_TOKEN_CONTRACT = '0x4300000000000000000000000000000000000003';
const BLAST_WETH_TOKEN_CONTRACT = '0x4300000000000000000000000000000000000004';
const BLAST_USDB_WINDFALL_CONTRACT = '0x0a4C236254C4C0bD5DD710f1fa12D7791d491358';
const BLAST_WETH_WINDFALL_CONTRACT = '0x6d89540c22868ff9e3676423162a9e909BBB2558';

async function canto_tvl(api) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: CANTO_NOTE_TOKEN_CONTRACT,
    params: [CANTO_WINDFALL_CONTRACT],
  });

  api.add(CANTO_NOTE_TOKEN_CONTRACT, collateralBalance)
}

async function blast_tvl(api) {
  const collateralBalanceUsdb = await api.call({
    abi: 'erc20:balanceOf',
    target: BLAST_USDB_TOKEN_CONTRACT,
    params: [BLAST_USDB_WINDFALL_CONTRACT],
  });

  const collateralBalanceWeth = await api.call({
    abi: 'erc20:balanceOf',
    target: BLAST_WETH_TOKEN_CONTRACT,
    params: [BLAST_WETH_WINDFALL_CONTRACT],
  });
  api.add(BLAST_USDB_TOKEN_CONTRACT, collateralBalanceUsdb)
  api.add(BLAST_WETH_TOKEN_CONTRACT, collateralBalanceWeth)
}
module.exports = {
  methodology: 'Counts the number of tokens in the Windfall contract.',
  canto: {
    start: 12330000,
    tvl: canto_tvl,
  },
  blast: {
    start: 12790000,
    tvl: blast_tvl,
  }
}; 
