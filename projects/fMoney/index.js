
const { compoundExports2 } = require('../helper/compound')
const sdk = require("@defillama/sdk");

const abi = {
  depositToken: "address:depositToken",
  totalDeposits: "uint256:totalDeposits",
  totalSupply: "uint256:totalSupply",
  balanceOf: "uint256:balanceOf",
}

const addresses = {
  beetsVault: "0x8166994d9ebBe5829EC86Bd81258149B87faCfd3",
  fuBUX: "0xcf211d1022f0B1aEC7CbAdCa1472fc20E6dFe3c6",
  fBUX80lzUSDC20: "0x2ddcd6916ee7ccc6300cb0fe2919a341be0ee8bb"
}

async function staking(timestamp, block, chainBlocks, { api }) {  
  if (!api) {
    api = new sdk.ChainApi({ chain: 'fantom', block, })
  }
  const balances = api.getBalances();
  // 8020 token is wrapped into fuBUX 1:1
  const [lpSupply, lpTokens] = await api.batchCall([
    { abi: "erc20:totalSupply", target: addresses.fuBUX },
    { abi: "erc20:balanceOf", target: addresses.fBUX80lzUSDC20, params: [addresses.beetsVault] },
  ])
  if (+lpTokens === 0) return balances
  const ratio = lpTokens / lpSupply

  const poolId = await api.call({ abi: 'function getPoolId() view returns (bytes32)', target: addresses.fBUX80lzUSDC20 })
  const vault = await api.call({ abi: 'address:getVault', target: addresses.fBUX80lzUSDC20 })
  const [tokens, bals] = await api.call({ abi: 'function getPoolTokens(bytes32) view returns (address[], uint256[],uint256)', target: vault, params: poolId })
  tokens.forEach((v, i) => {
    sdk.util.sumSingleBalance(balances, v, bals[i] * ratio, api.chain)
  })

  return balances;
}

const config = {
	fantom: '0xB911d8064c0AA338241f349eD802Ad4bae6ec034',
}

let modulesToExport = {};

Object.keys(config).forEach(chain => {
	modulesToExport[chain] = compoundExports2({ comptroller: config[chain] })
});

modulesToExport.fantom.staking = staking;

module.exports = modulesToExport;