const abi = require('./abi.json');
const { getLogs } = require('../helper/cache/getLogs')

const START_BLOCK = 10104891;
const FACTORY = '0x176b98ab38d1aE8fF3F30bF07f9B93E26F559C17';
const POOLS_FACTORY = '0xe28520DDB1b419Ac37eCDBB2c0F97c8Cf079CCC3';
const VAULTS = '0x2Ce43b4570Ad9DEAb8CFE6258B42DB7301e3b6C0';

const getTokenAddressFromNewAcoTokenLogData = data => '0x' + data.substring(154, 194);
const getPoolAddressFromNewAcoPoolLogData = data => '0x' + data.substring(26, 66);
const getVaultAddressFromSetAcoVaultLogData = data => '0x' + data.substring(26, 66);
const getUnderlyingAddressFromNewAcoPoolLogData = data => '0x' + data.substring(26, 66);
const getStrikeAssetAddressFromNewAcoPoolLogData = data => '0x' + data.substring(26, 66);

async function tvl(api) {
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

  let collateralResult = await api.multiCall({ calls: acoOptionsAddresses, abi: abi.collateral, });

  let collateralAddressMap = {}

  collateralResult.forEach((result, i) => {
    collateralAddressMap[acoOptionsAddresses[i]] = result;
  });

  let totalCollateralResult = await api.multiCall({ calls: acoOptionsAddresses, abi: abi.totalCollateral, });

  totalCollateralResult.forEach((result, i) => {
    const colateralAddress = collateralAddressMap[acoOptionsAddresses[i]]
    api.add(colateralAddress, result)
  });

  const newAcoPoolLogs = logsPromises[2];
  const ownerTokens = []

  newAcoPoolLogs.forEach((log) => {
    const address = getPoolAddressFromNewAcoPoolLogData(log.data)
    const underlyingAddress = getUnderlyingAddressFromNewAcoPoolLogData(log.topics[1])
    const strikeAssetAddress = getStrikeAssetAddressFromNewAcoPoolLogData(log.topics[2])
    ownerTokens.push([[underlyingAddress, strikeAssetAddress], address])
  });

  await api.sumTokens({ ownerTokens })

  const setVaultLog = logsPromises[3];

  let acoVaultsAddresses = [];
  setVaultLog.forEach((log) => {
    const address = getVaultAddressFromSetAcoVaultLogData(log.topics[1]);
    acoVaultsAddresses.push(address)
  });
  const tokens = await api.multiCall({ abi: abi.token, calls: acoVaultsAddresses })
  const bals = await api.multiCall({ abi: abi.balance, calls: acoVaultsAddresses })
  api.add(tokens, bals)
}

module.exports = {
  start: '2020-05-21',   // 05/20/2020 @ 08:10:40pm (UTC)
  ethereum: { tvl }
}
