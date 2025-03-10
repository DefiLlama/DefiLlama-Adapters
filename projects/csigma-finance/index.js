const { getLogs } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')
const { sumUnknownTokens } = require('../helper/unknownTokens')

const {
  instituitionalContractAddress,
  edgeContractAddress,
  pdnContractAddress,
  invalidPDNPaymentIds
} = require('./config.js');

async function getPDNTvl(api) {
  const { address: factory, startBlock } = pdnContractAddress;
  const logs = await getLogs({
    api,
    target: factory,
    topics: [],
    eventAbi: `event PaymentAdded(
      string indexed _paymentId,
      string _lenderId,
      string _poolId,
      uint256 _principal,
      uint256 _coupon,
      uint8 _paymentType,
      uint64 _timeStamp
    )`,
    fromBlock: startBlock,
    onlyArgs: true,
  })

  const validLogs = logs.filter(log => !invalidPDNPaymentIds.includes(log[0].hash));
  const investments = validLogs.filter(log => log[5] === 0n);
  const payments = validLogs.filter(log => log[5] === 1n);
  const totalInvestments = investments.reduce((acc, cur) => acc + BigInt(cur[3]), BigInt(0));
  const totalPayments = payments.reduce((acc, cur) => acc + BigInt(cur[3]), BigInt(0));
  const totalTvl = Number(totalInvestments - totalPayments)/100;
  api.addCGToken('usd', totalTvl);
}

async function institutionalTvl(api) {
  const chain = api.chain;
  const { address: factory, startBlock } = instituitionalContractAddress[chain];
  const lastPaymentId = await api.call({
    target: factory,
    abi: 'function getLastPaymentId() internal view returns (uint256)'
  });
  const paymentIds = Array.from({ length: Number(lastPaymentId) + 1 }, (_, i) => i);
  const payments = await Promise.all(paymentIds.map(async id => {
    const payment = await api.call({
      target: factory,
      abi: `function getPayment(string calldata _paymentId) internal view returns (tuple(
        string roleId,
        string creditPoolId,
        uint8 paymentType, 
        uint64 timeStamp,
        address from,
        address to,
        uint256 amount
      )  memory)`,
      params: [`${id}`]
    });
    return payment;
  }));

  const lenderIDs = payments.filter(payment => +payment[2] === 2).map(payment => payment[0]);
  const uniqeLenderIDs = [...new Set(lenderIDs)];
  const investments = payments.filter(payment => +payment[2] === 0 && !!payment[1]);
  const investemntLenderIds = investments.map(investment => investment[0]);
  const principalPaid = payments.filter(payment => (+payment[2] === 5 || +payment[2] === 6) && !!payment[1]).filter(payment => investemntLenderIds.includes(payment[0]));
  const poolIDs = [
    ...new Set([
      ...investments.map(investment => investment[1]),
      ...principalPaid.map(principal => principal[1])
    ])
  ];
  const poolTokens = (await Promise.all(poolIDs.map(async poolID => {
    const poolToken = await api.call({
      target: factory,
      abi: `function getPoolToken(string memory _poolId) internal view returns (address)`,
      params: [poolID]
    });
    return { poolID, poolToken };
  }))).reduce((acc, cur) => {
    acc[cur.poolID] = cur.poolToken
    return acc;
  }, {});

  await Promise.all(uniqeLenderIDs.map(async lenderID => {
    const [usdtBalance, usdcBalance] = await Promise.all([
      api.call({
        target: factory,
        abi: 'function getTokenBalance(string calldata _roleId, address _token) external view returns (uint256)',
        params: [lenderID, ADDRESSES[chain].USDT]
      }),
      api.call({
        target: factory,
        abi: 'function getTokenBalance(string calldata _roleId, address _token) external view returns (uint256)',
        params: [lenderID, ADDRESSES[chain].USDC]
      }),
    ]);
    api.add(ADDRESSES[chain].USDT, usdtBalance);
    api.add(ADDRESSES[chain].USDT, usdcBalance);
  }));

  const totalInvestments = {};
  investments.forEach(i => {
    const poolId = i[1];
    const amount = i[6];
    totalInvestments[poolTokens[poolId]] = BigInt(totalInvestments[poolTokens[poolId]] || 0) + BigInt(amount);
  })

  const totalPrincipalPaid = {};
  principalPaid.forEach(p => {
    const poolId = p[1];
    const amount = p[6];
    totalPrincipalPaid[poolTokens[poolId]] = BigInt(totalPrincipalPaid[poolTokens[poolId]] || 0) + BigInt(amount);
  })

  Object.keys(totalInvestments).forEach(token => {
    const remainingBalance = totalInvestments[token] - totalPrincipalPaid[token];
    api.add(token, remainingBalance);
  });
}

async function edgeTvl(api) {
  const chain = api.chain;
  // TVL of edge
  const { address: factory, startBlock } = edgeContractAddress[chain];
  const logs = await getLogs({
    api,
    target: factory,
    topics: ['0xbc6f53152e9aa8c4c80947b978ba84ae6d4f83b9762aa13cddad1d22cf26d173'],
    eventAbi: `event PoolCreated(address _pool, address indexed _poolManager, address _fundManager, address indexed _poolToken,
        address indexed _oracleManager,
        uint256 _poolAPY,
        uint256 _poolSize
    )`,
    onlyArgs: true,
    fromBlock: startBlock,
  })
  const pools = logs.map(log => log[0]);

  const tokens = await Promise.all(pools.map(async pool => {
    const poolToken = await api.call({
      target: pool,
      abi: "address:poolToken"
    });
    return poolToken
  }));
  await api.sumTokens({ owners: pools, tokens: [...new Set(tokens)], chain, block: 'latest' })
}

async function getTvl(api) {
  await institutionalTvl(api);
  await edgeTvl(api);
  const chain = api.chain;
  if(chain === 'arbitrum') {
    await getPDNTvl(api);
    return;
  }
}

module.exports = {
  'arbitrum': { tvl: getTvl },
  'ethereum': { tvl: getTvl },
  'base': { tvl: getTvl },
  methodology: `The TVL of Csigma Finance is calculated by querying smart contracts on Ethereum, Arbitrum, and Base. It includes the total investments in institutional pools, balances in Edge pools, and private debt network investments (on Arbitrum) while subtracting repayments. Token balances (USDT/USDC) are fetched on-chain, and the final TVL is derived by summing these values.`,
}