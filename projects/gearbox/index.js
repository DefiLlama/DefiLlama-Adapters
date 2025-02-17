/**
 **
 ** This file has been generated from source code in https://github.com/Gearbox-protocol/defillama repo
 ** Binary release: https://github.com/Gearbox-protocol/defillama/releases/tag/v1.4.3
 **
 **/

 const ethers = require("ethers");
 const { getLogs } = require("../helper/cache/getLogs");
 const { ADDRESS_PROVIDER_V3, CONTRACTS_REGISTER, DATA_COMPRESSOR, poolAbis, v1Abis, v2Abis, v3Abis } = require("./config");
 
  module.exports = {
   hallmarks: [[1666569600, "LM begins"]],
   methodology: `Retrieves the tokens in each Gearbox pool & value of all Credit Accounts (V1/V2/V3) denominated in the underlying token.`,
   misrepresentedTokens: true
 }

const getV1Managers = async (api) => {
  const provider = ADDRESS_PROVIDER_V3[api.chain]
  const contractsRegisterAddr = await api.call({ abi: v1Abis.getAddressOrRevert, target: provider, params: [CONTRACTS_REGISTER, 0] });
  const rawCreditManagers = await api.call({ target: contractsRegisterAddr, abi: v1Abis.getCreditManagers });
  const versions = await api.multiCall({ calls: rawCreditManagers, abi: v1Abis.version });
  const creditManagers = rawCreditManagers.filter((_, i) => versions[i] == 1);
  const underlyings = await api.multiCall({ calls: creditManagers, abi: v1Abis.underlyingToken });
  return creditManagers.map((manager, i) => ({ manager, underlying: underlyings[i] }))
}

const getV1Tvl = async (api) => {
  const managers = await getV1Managers(api)
  if (!managers.length) return;

  await Promise.all(
    managers.map(async ({ manager, underlying }) => {
      const topics = [];
      const eventsByDate = [];
      const accounts = new Set();

      const addEvent = ({ blockNumber, logIndex }, address, operation) => {
        eventsByDate.push({
          time: blockNumber * 1e5 + logIndex,
          address,
          operation,
        });
      };

      const creditFilter = await api.call({ target: manager, abi: v1Abis.creditFilter });
      const cm = new ethers.Contract(manager, v1Abis.filtersV1);
      cm.interface.forEachEvent((e) => topics.push(e.topicHash));
      const rawLogs = await getLogs({ target: manager, fromBlock: 13854983, api, topics: [topics] });
      const logs = rawLogs.map((log) => ({ ...cm.interface.parseLog(log), blockNumber: log.blockNumber, logIndex: log.logIndex }));

      logs.forEach((log) => {
        const { name, args } = log;
        switch (name) {
          case "OpenCreditAccount":
            addEvent(log, args.onBehalfOf, "add");
            break;
          case "RepayCreditAccount":
            addEvent(log, args.borrower, "delete");
            break;
          case "TransferAccount":
            addEvent(log, args.oldOwner, "delete");
            addEvent(log, args.newOwner, "add");
            break;
        }
      });

      eventsByDate
        .sort((a, b) => a.time - b.time)
        .forEach(({ address, operation }) => {
          if (operation === "add") accounts.add(address);
          else accounts.delete(address);
        });

      const openCredits = Array.from(accounts).map(
        (borrower) =>
          logs.find((log) => log.args?.onBehalfOf === borrower)?.args.creditAccount
      );

      const totalValues = await api.multiCall({
        abi: v1Abis.calcTotalValue,
        target: creditFilter,
        calls: openCredits.filter((i) => i !== "0xaBBd655b3791175113c1f1146D3B369494A2b815")
      });

      api.add(underlying, totalValues.reduce((a, c) => a + Number(c), 0));
    })
  );
};

const getV2Managers = async (api) => {
  const provider = ADDRESS_PROVIDER_V3[api.chain];
  const dataCompressor210 = await api.call({ abi: v2Abis.getAddressOrRevert, target: provider, params: [DATA_COMPRESSOR, 210] });
  return api.call({ abi: v2Abis.getCreditManagersV2List, target: dataCompressor210 });
};

const getV2Tvl = async (api) => {
  const managers = await getV2Managers(api);
  if (!managers.length) return;

  await Promise.all(
    managers.map(async ({ addr, underlying }) => {
      const topics = [];
      const eventsByDate = [];
      const accounts = new Set();

      const addEvent = ({ blockNumber, logIndex }, address, operation) => {
        eventsByDate.push({ time: blockNumber * 1e5 + logIndex, address, operation });
      };

      const creditFacade = await api.call({ abi: v2Abis.creditFacade, target: addr });
      const ccLogs = await getLogs({ target: addr, fromBlock: 13854983, api, onlyArgs: true, eventAbi: v2Abis.newConfigurator });
      const ccAddrs = ccLogs.map((log) => log[0]);

      const cfAddrs = [];
      for (const cca of ccAddrs) {
        const cfLogs = await getLogs({ target: cca, fromBlock: 13854983, api, onlyArgs: true, eventAbi: v2Abis.creditFacadeUpgraded });
        if (cfLogs.length) cfAddrs.push(...cfLogs.map((log) => log[0]));
      }

      const logs = [];
      for (const cfAddr of cfAddrs) {
        const cf = new ethers.Contract(cfAddr, v2Abis.filtersV2);
        cf.interface.forEachEvent((e) => topics.push(e.topicHash));
        const rawLogs = await getLogs({ target: cfAddr, fromBlock: 13854983, api, topics: [topics] });
        const cfLogs = rawLogs.map((log) => ({ ...cf.interface.parseLog(log), blockNumber: log.blockNumber, logIndex: log.logIndex }));
        if (cfLogs.length) logs.push(...cfLogs);
      }

      logs.forEach((log) => {
        const { name, args } = log;
        switch (name) {
          case "OpenCreditAccount":
            addEvent(log, args.onBehalfOf, "add");
            break;
          case "LiquidateExpiredCreditAccount":
            addEvent(log, args.borrower, "delete");
            break;
          case "TransferAccount":
            addEvent(log, args.oldOwner, "delete");
            addEvent(log, args.newOwner, "add");
            break;
        }
      });

      eventsByDate
        .sort((a, b) => a.time - b.time)
        .forEach(({ address, operation }) => {
          if (operation === "add") accounts.add(address);
          else accounts.delete(address);
        });

      const openCredits = Array.from(accounts).map(
        (borrower) =>
          logs
            .sort((a, b) => b.blockNumber - a.blockNumber)
            .find((log) => log.args?.onBehalfOf === borrower)?.args.creditAccount
      );

      const totalValues = await api.multiCall({ abi: v2Abis.calcTotalValue, target: creditFacade, calls: openCredits });
      api.add(underlying, totalValues.reduce((a, c) => a + Number(c), 0));
    })
  );
};

const getV3Data = async (api, type) => {
  const dc300 = await api.call({ abi: v3Abis.getAddressOrRevert, target: ADDRESS_PROVIDER_V3[api.chain], params: [DATA_COMPRESSOR, 300] });
  const poolV3Datas = await api.call({ target: dc300, abi: v3Abis.getPoolsV3List });

  poolV3Datas.forEach(({ totalAssets, totalBorrowed, underlying }) => {
    const balance = type === 'supplied' ? totalAssets : totalBorrowed;
    api.add(underlying, balance);
  });
};
 
const tvl = async (api) => {
  if (api.chain === 'ethereum') {
    await getV1Tvl(api),
    await getV2Tvl(api)
  }

  await getV3Data(api, 'supplied')
}

const borrowed = async (api) => {
  return getV3Data(api, 'borrowed')
}
 
['ethereum', 'arbitrum', 'optimism'].forEach((chain) => {
   module.exports[chain] = { tvl, borrowed }
})