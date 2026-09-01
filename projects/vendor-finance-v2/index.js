const { getLogs } = require("../helper/cache/getLogs");

const abi = {
  lendBalance: "function lendBalance() view returns (uint256)",
  colBalance: "function colBalance() view returns (uint256)"
}

async function tvl(api) {
  const { factory, fromBlock } = config[api.chain]
  const logs = await getLogs({
    api,
    target: factory,
    topics: ['0xee5c84cc965f1ed0b60a1a4a5a02cf02830b6262b89a9063fda05b63ce8b2f8b'],
    fromBlock,
    onlyArgs: true,
    eventAbi: 'event DeployPool(address poolAddress,address deployer,address implementation,(address feesManager,bytes32 strategy,address oracle,address treasury,address posTracker),(uint8 poolType,address owner,uint48 expiry,address colToken,uint48 protocolFee,address lendToken,uint48 ltv,uint48 pauseTime,uint256 lendRatio,address[] allowlist,bytes32 feeRatesAndType))'
  })

  // lend assets may be stored in AAVE if the lender chooses so we can't
  // rely on balanceOf calls to get lend balances. Each pool has a
  // lendBalance and colBalance method that returns the token balances
  // that are in the pool and are currently in AAVE that belong to the pool

  // get lend balances returned from the lendBalance method
  const lendOutput = await api.multiCall({ abi: abi.lendBalance, calls: logs.map(i => i.poolAddress), });

  // get col balances returned from the colBalance method
  const colOutput = await api.multiCall({ abi: abi.colBalance, calls: logs.map(i => i.poolAddress), });

  lendOutput.forEach((res, i) => {
    // extract collateral and lend tokens
    const lendToken = logs[i][4].lendToken;
    const colToken = logs[i][4].colToken;
    // add collateral and lend token balances returned from contract calls
    api.add(lendToken, res)
    api.add(colToken, colOutput[i])
  });
}

const config = {
  berachain: { factory: '0x914246ceAF07E1E4B22992d733a9eb3D4983233b', fromBlock: 10062470},
  arbitrum: { factory: '0x0b2B8Fbf3dfd6237921A89355cfc08f107bFbf98', fromBlock: 88774917 },
  base: { factory: '0xAf013ba5cE2e3AC97BF93Ea968031B3D0B4682Cf', fromBlock: 33429629},
  spn: { factory: '0xd03b16e994E6D877051878C676cc296eC00f171d', fromBlock: 1816958}
}

module.exports = {
  doublecounted: true,
  methodology: 'The sum of the balance of all listed collateral and lend tokens in all deployed pools.',
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
});
