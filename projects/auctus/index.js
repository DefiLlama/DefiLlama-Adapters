const ADDRESSES = require('../helper/coreAssets.json')
/*==================================================
  Modules
  ==================================================*/

  const sdk = require('@defillama/sdk');

  const abi = require('./abi.json');
  const { default: BigNumber } = require('bignumber.js');
  const { getLogs } = require('../helper/cache/getLogs')

  const START_BLOCK = 10104891;
  const FACTORY = '0x176b98ab38d1aE8fF3F30bF07f9B93E26F559C17';
  const POOLS_FACTORY = '0xe28520DDB1b419Ac37eCDBB2c0F97c8Cf079CCC3';
  const VAULTS = '0x2Ce43b4570Ad9DEAb8CFE6258B42DB7301e3b6C0';
  const ETHER_ADDRESS = ADDRESSES.null;

/*==================================================
  TVL
  ==================================================*/

  const getTokenAddressFromNewAcoTokenLogData = data => '0x' + data.substring(154, 194);

  const getPoolAddressFromNewAcoPoolLogData = data => '0x' + data.substring(26, 66);

  const getVaultAddressFromSetAcoVaultLogData = data => '0x' + data.substring(26, 66);

  const getUnderlyingAddressFromNewAcoPoolLogData = data => '0x' + data.substring(26, 66);
  const getStrikeAssetAddressFromNewAcoPoolLogData = data => '0x' + data.substring(26, 66);

  async function tvl(timestamp, block, _, { api }) {
    var logsPromises = await Promise.all([
      getLogs({
        api,
        target: FACTORY,
        fromBlock: START_BLOCK,
        topic: 'NewAcoToken(address,address,bool,uint256,uint256,address,address)',
      }),
      getLogs({
        api,
        target: FACTORY,
        fromBlock: START_BLOCK,
        topic: 'NewAcoTokenData(address,address,bool,uint256,uint256,address,address,address)',
      }),
      getLogs({
        api,
        target: POOLS_FACTORY,
        fromBlock: START_BLOCK,
        topic: 'NewAcoPool(address,address,bool,address,address)',
      }),
      getLogs({
        api,
        target: VAULTS,
        fromBlock: START_BLOCK,
        topic: 'AcoVault(address,bool)',
      })
    ])

    const logs = logsPromises[0];

    let acoOptionsAddresses = [];
    logs.forEach((log) => {
      const address = getTokenAddressFromNewAcoTokenLogData(log.data);
      acoOptionsAddresses.push(address)
    });

    const logs2 = logsPromises[1];
    logs2.forEach((log) => {
      const address = getTokenAddressFromNewAcoTokenLogData(log.data);
      acoOptionsAddresses.push(address)
    });

    let collateralResult = await sdk.api.abi.multiCall({
      block,
      calls: acoOptionsAddresses.map((option) => ({
        target: option
      })),
      abi: abi.collateral,
    });

    let collateralAddressMap = {}

    collateralResult.output.forEach((result) => {
        collateralAddressMap[result.input.target] = result.output;
    });

    let totalCollateralResult = await sdk.api.abi.multiCall({
      block,
      calls: acoOptionsAddresses.map((option) => ({
        target: option
      })),
      abi: abi.totalCollateral,
    });

    let balances = {}
    balances[ETHER_ADDRESS] = "0"

    totalCollateralResult.output.forEach((result) => {
        var colateralAddress = collateralAddressMap[result.input.target].toLowerCase()
        if (!balances[colateralAddress]) {
          balances[colateralAddress] = "0"
        }
        const existingBalance = new BigNumber(balances[colateralAddress]);
        balances[colateralAddress] = existingBalance.plus(new BigNumber(result.output)).toFixed()
    });

    const newAcoPoolLogs = logsPromises[2];

    let acoPools = {};
    newAcoPoolLogs.forEach((log) => {
      const address = getPoolAddressFromNewAcoPoolLogData(log.data).toLowerCase();
      const underlyingAddress = getUnderlyingAddressFromNewAcoPoolLogData(log.topics[1]).toLowerCase();
      const strikeAssetAddress = getStrikeAssetAddressFromNewAcoPoolLogData(log.topics[2]).toLowerCase();
      acoPools[address] = {underlying: underlyingAddress, strikeAsset: strikeAssetAddress}
    });

    let poolCallsMap = Object.entries(acoPools).map(([poolAddress, poolData]) => ({
      target: poolData.underlying,
      params: poolAddress,
    }))

    poolCallsMap = poolCallsMap.concat(Object.entries(acoPools).map(([poolAddress, poolData]) => ({
      target: poolData.strikeAsset,
      params: poolAddress,
    })))

    let erc20CallsMap = poolCallsMap.filter((f) => f.target !== ETHER_ADDRESS)

    let poolBalances = await sdk.api.abi.multiCall({
      block,
      calls: erc20CallsMap,
      abi: 'erc20:balanceOf',
    });
    sdk.util.sumMultiBalanceOf(balances, poolBalances);

    let ethCallsMap = poolCallsMap.filter((f) => f.target === ETHER_ADDRESS)
    await (
      Promise.all(ethCallsMap.map(async (ethCall) => {
        const balance = (await sdk.api.eth.getBalance({target: ethCall.params, block})).output;
        balances[ETHER_ADDRESS] = BigNumber(balances[ETHER_ADDRESS]).plus(new BigNumber(balance)).toFixed();
      }))
    );

    const setVaultLog = logsPromises[3];

    let acoVaultsAddresses = [];
    setVaultLog.forEach((log) => {
      const address = getVaultAddressFromSetAcoVaultLogData(log.topics[1]);
      acoVaultsAddresses.push(address)
    });

    let balancesResult = await sdk.api.abi.multiCall({
      block,
      calls: acoVaultsAddresses.map((vault) => ({
        target: vault
      })),
      abi: abi.balance,
    });

    let tokensResult = await sdk.api.abi.multiCall({
      block,
      calls: acoVaultsAddresses.map((vault) => ({
        target: vault
      })),
      abi: abi.token,
    });

    balancesResult.output.forEach((result, index) => {
        var token = tokensResult.output[index].output.toLowerCase()
        var balance = result.output;
        balances[token] = BigNumber(balances[token]).plus(new BigNumber(balance)).toFixed();
    });

    return balances;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    start: 1590014400,   // 05/20/2020 @ 08:10:40pm (UTC)
    ethereum: { tvl }
  }
