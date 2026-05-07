const { getLogs } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  ethereum: {
    institutional: { address: '0xF80bA51189763B7AC484A23f7d7695345B1149C9', startBlock: 18467881 },
    edge: { address: '0xb5337C2e320D61bE3511216b9b4d32b2c41F3e55', startBlock: 20882902 },
  },
  arbitrum: {
    institutional: { address: '0x45dCf4F9d1B47C138Bc1E490a878790932d66caf', startBlock: 188232859 },
    edge: { address: '0x4C28F5c87e5557db971c9a2F862BfdCf9f561Bd4', startBlock: 273904688 },
  },
  base: {
    institutional: { address: '0x07D7bf6dCc4A2f03E82E3da52eBfBAe871443322', startBlock: 23596015 },
    edge: { address: '0xe76C20761BFCD471196bB61f68250DAf3dA3568B', startBlock: 23604031 },
  },
  hedera: {
    institutional: { address: '0xF80bA51189763B7AC484A23f7d7695345B1149C9', startBlock: 84085356 },
    edge: { address: '0x78B17FbE17925622139382FE7809A9D687C5e7Bd', startBlock: 84093455 },
  },
}

const pdnContract = { address: '0x67A1fc35961dD0E293BB4481b48491aDF95b1395', startBlock: 218221531 }

const vaults = {
  csUSD: {
    ethereum: [
      { vault: '0xd5d097f278a735d0a3c609deee71234cac14b47e', underlyings: ['USDC'] },
      { vault: '0xbd3f0befa86794b999b29a91d201124d8fbdf777', underlyings: ['USDT'] },
    ],
    hedera: [
      { vault: '0x4896a087f78E1DcB44B9231f9a6f35EA2aA0c8AC', underlyings: ['USDC'] },
    ],
  },
  csLYD: {
    ethereum: [
      { vault: '0xead9190db1a6a5f4262572845cf75c31e474fd4c', underlyings: ['USDC'] },
      { vault: '0x1922d16cc88cd60499906915b30ec891ceb6e151', underlyings: ['USDT'] },
    ],
  },
}

const invalidPDNPaymentIds = [
  "0x99460d3affdd3d92b7947811ee9d3081c9c2f0a9d0ee9b30af2d842f4423dd83",
  "0x0d299443084dc8cc186ef3b641a82b05067687b94c03317345c3b2f25847de38",
  "0x2f795b76f222b3e7a5bdf6e03f34972a72ff55ee893e70af58e638e7fb3a24d2",
  "0x25faefe8041a9e5e6da9bea88c188c3bd563e09b3db3515034ecf54dbfd77eed",
  "0xe206373ef521d6a43c1501252d4b93a77ca2c73219645561d93f8c1285ace4e3",
  "0xf7105def091d0d87b5ec278b039017addf64a8c16f405adccd58204a20ee9f75",
  "0x95487262748ad72d4ce68ef6df658e88c4194d4752d9d1c9f34994f41f047255",
  "0x732e6bb2ec07cfaa156fbe35e1e5240e129ac568eb2df4e343497c9c7500113c",
]

const abis = {
  getLastPaymentId: 'function getLastPaymentId() internal view returns (uint256)',
  getPayment: 'function getPayment(string calldata _paymentId) internal view returns (tuple(string roleId, string creditPoolId, uint8 paymentType, uint64 timeStamp, address from, address to, uint256 amount) memory)',
  getPoolToken: 'function getPoolToken(string memory _poolId) internal view returns (address)',
  getTokenBalance: 'function getTokenBalance(string calldata _roleId, address _token) external view returns (uint256)',
}

const eventAbis = {
  PaymentAdded: 'event PaymentAdded(string indexed _paymentId, string _lenderId, string _poolId, uint256 _principal, uint256 _coupon, uint8 _paymentType, uint64 _timeStamp)',
  PoolCreated: 'event PoolCreated(address _pool, address indexed _poolManager, address _fundManager, address indexed _poolToken, address indexed _oracleManager, uint256 _poolAPY, uint256 _poolSize)',
}

async function getPDNTvl(api) {
  const { address: factory, startBlock } = pdnContract;
  const logs = await getLogs({ api, target: factory, topics: [], eventAbi: eventAbis.PaymentAdded, fromBlock: startBlock, onlyArgs: true })
  const validLogs = logs.filter(log => !invalidPDNPaymentIds.includes(log[0].hash));
  const totalInvestments = validLogs.filter(log => log[5] === 0n).reduce((acc, cur) => acc + BigInt(cur[3]), 0n);
  const totalPayments = validLogs.filter(log => log[5] === 1n).reduce((acc, cur) => acc + BigInt(cur[3]), 0n);
  api.addUSDValue(Number(totalInvestments - totalPayments) / 100);
}

async function institutionalTvl(api) {
  const chain = api.chain;
  const { address: factory } = config[chain].institutional;
  const lastPaymentId = await api.call({ target: factory, abi: abis.getLastPaymentId });
  const payments = await api.multiCall({ target: factory, abi: abis.getPayment, calls: Array.from({ length: Number(lastPaymentId) + 1 }, (_, i) => `${i}`) });
  const usdtAddress = chain === 'hedera' ? ADDRESSES.hedera.USDT_HTS : ADDRESSES[chain].USDT;
  const usdcAddress = ADDRESSES[chain].USDC;

  // Fetch lender token balances
  const lenderIDs = [...new Set(payments.filter(p => +p[2] === 2).map(p => p[0]))];
  const balanceCalls = lenderIDs.flatMap(id => [
    { target: factory, params: [id, usdtAddress] },
    { target: factory, params: [id, usdcAddress] },
  ]);
  const balances = await api.multiCall({ abi: abis.getTokenBalance, calls: balanceCalls });
  balances.forEach((bal, i) => api.add(i % 2 === 0 ? usdtAddress : usdcAddress, bal));

  // Compute remaining investment balances per pool token
  const investments = payments.filter(p => +p[2] === 0 && !!p[1]);
  const investmentLenderIds = new Set(investments.map(i => i[0]));
  const principalPaid = payments.filter(p => (+p[2] === 5 || +p[2] === 6) && !!p[1] && investmentLenderIds.has(p[0]));

  const poolIDs = [...new Set([...investments, ...principalPaid].map(p => p[1]))];
  const poolTokensList = await api.multiCall({ target: factory, abi: abis.getPoolToken, calls: poolIDs });
  const poolTokens = Object.fromEntries(poolIDs.map((id, i) => [id, poolTokensList[i]]));

  const netByToken = {};
  for (const i of investments) {
    const token = poolTokens[i[1]];
    netByToken[token] = (netByToken[token] || 0n) + BigInt(i[6]);
  }
  for (const p of principalPaid) {
    const token = poolTokens[p[1]];
    netByToken[token] = (netByToken[token] || 0n) - BigInt(p[6]);
  }
  Object.entries(netByToken).forEach(([token, amount]) => api.add(token, amount));
}

async function edgeTvl(api) {
  const { address: factory, startBlock } = config[api.chain].edge;
  const logs = await getLogs({ api, target: factory, topics: ['0xbc6f53152e9aa8c4c80947b978ba84ae6d4f83b9762aa13cddad1d22cf26d173'], eventAbi: eventAbis.PoolCreated, onlyArgs: true, fromBlock: startBlock })
  const pools = logs.map(log => log[0]);
  const fundManagers = logs.map(log => log[2]);
  const tokens = await api.multiCall({ abi: 'address:poolToken', calls: pools });

  const balances = await api.multiCall({ abi: 'function balanceOf(address) view returns (uint256)', calls: fundManagers.map((fm, i) => ({ target: tokens[i], params: [fm] })) });
  balances.forEach((balance, i) => api.add(tokens[i], balance));

  await api.sumTokens({ owners: pools, tokens: [...new Set(tokens)] });
}

async function sumVaultTvl(api, vaultConfig) {
  const cfg = vaultConfig?.[api.chain];
  if (!cfg) return;

  const calls = [];
  const tokens = [];
  for (const { vault, underlyings } of cfg) {
    if (!vault || !Array.isArray(underlyings)) continue;
    for (const t of underlyings) {
      const token = ADDRESSES[api.chain][t] || t;
      if (!token) continue;
      calls.push({ target: token, params: [vault] });
      tokens.push(token);
    }
  }
  if (!calls.length) return;

  const balances = await api.multiCall({ abi: 'function balanceOf(address) view returns (uint256)', calls });
  balances.forEach((balance, i) => api.add(tokens[i], balance));
}

async function getTvl(api) {
  await institutionalTvl(api);
  await edgeTvl(api);
  await sumVaultTvl(api, vaults.csUSD);
  await sumVaultTvl(api, vaults.csLYD);
  if (api.chain === 'arbitrum') await getPDNTvl(api);
}

module.exports = { methodology: `The TVL of Csigma Finance is calculated by querying smart contracts on Ethereum, Arbitrum, and Base. It includes the total investments in institutional pools, balances in Edge pools, and private debt network investments (on Arbitrum) while subtracting repayments. Token balances (USDT/USDC) are fetched on-chain, and the final TVL is derived by summing these values. The TVL also includes the value of our yield-bearing tokens, csUSD and csLYD.` }

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: getTvl }
})
