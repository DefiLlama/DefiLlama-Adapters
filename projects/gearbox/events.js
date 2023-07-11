const { api, api2 } = require("@defillama/sdk");
const { Contract, BigNumber } = require("ethers");
const sdk = require('@defillama/sdk')

const abi = require("./abi.json");

function getProvider(network) {
  const chainApi = new sdk.ChainApi(network)
  return chainApi.provider
}

const getV2CAs = async (creditManager, block) => {
  const eventsByDate = [];
  const accounts = new Set();

  const cm = new Contract(
    creditManager,
    abi["creditManagerV2"],
    getProvider("ethereum")
  );
  const creditFacade = await cm.creditFacade();

  const ccAddrs = (
    await cm.queryFilter(
      {
        address: creditManager,
        topics: [cm.interface.getEventTopic("NewConfigurator")],
      },
      undefined
    )
  ).map((e) => e.args.newConfigurator);

  const cfAddrs = [];

  for (let cca of ccAddrs) {
    const cc = new Contract(
      cca,
      abi["creditConfiguratorV2"],
      getProvider("ethereum")
    );

    const cfs = (
      await cc.queryFilter(
        {
          address: cca,
          topics: [cc.interface.getEventTopic("CreditFacadeUpgraded")],
        },
        undefined
      )
    ).map((e) => e.args.newCreditFacade);

    cfAddrs.push(...cfs);
  }

  const addToEvents = (e, address, operation) => {
    eventsByDate.push({
      time: e.blockNumber * 100000 + e.logIndex,
      address,
      operation,
      ca: e.args.creditAccount ? e.args.creditAccount : null,
      cf: creditFacade,
    });
  };

  const logs = [];

  for (let cfAddr of cfAddrs) {
    const cf = new Contract(cfAddr, abi["filtersV2"], getProvider("ethereum"))

    const topics = {
      OpenCreditAccount: cf.interface.getEventTopic("OpenCreditAccount"),
      CloseCreditAccount: cf.interface.getEventTopic("CloseCreditAccount"),
      LiquidateCreditAccount: cf.interface.getEventTopic(
        "LiquidateCreditAccount"
      ),
      LiquidateExpiredCreditAccount: cf.interface.getEventTopic(
        "LiquidateExpiredCreditAccount"
      ),
      TransferAccount: cf.interface.getEventTopic("TransferAccount"),
    };
    const l = (
      await cf.queryFilter(
        {
          address: cfAddr,
          topics: [Object.values(topics)],
        },
        undefined
      )
    ).map((log) => ({
      ...cf.interface.parseLog(log),
      blockNumber: log.blockNumber,
      logIndex: log.logIndex,
    }));

    logs.push(...l);
  }

  logs.forEach((log) => {
    switch (log.name) {
      case "OpenCreditAccount":
        addToEvents(log, log.args.onBehalfOf, "add");
        break;
      case "CloseCreditAccount":
      case "LiquidateCreditAccount":
      case "LiquidateExpiredCreditAccount":
        addToEvents(log, log.args.borrower, "delete");
        break;
      case "TransferAccount":
        addToEvents(log, log.args.oldOwner, "delete");
        addToEvents(log, log.args.newOwner, "add");
        break;
    }
  });

  eventsByDate
    .sort((a, b) => {
      return a.time - b.time;
    })
    .forEach((e) => {
      if (e.operation === "add") {
        accounts.add(e.address);
      } else {
        accounts.delete(e.address);
      }
    });

  const openCAs = Array.from(accounts.values()).map(
    (borrower) =>
      logs
        .sort((a, b) => b.blockNumber - a.blockNumber)
        .find((log) => log.args.onBehalfOf && log.args.onBehalfOf === borrower)
        .args.creditAccount
  );

  const { output: totalValue } = await api.abi.multiCall({
    abi: abi["calcTotalValue"],
    calls: openCAs.map((addr) => ({
      target: creditFacade,
      params: [addr],
    })),
    block,
  });

  return totalValue[0]
    ? totalValue
        .map((t) => t.output)
        .reduce((a, c) => a.add(BigNumber.from(c)), BigNumber.from("0"))
        .toString()
    : "0";
};

const getV1CAs = async (creditManager, block) => {
  const eventsByDate = [];
  const accounts = new Set();

  const addToEvents = (e, address, operation) => {
    eventsByDate.push({
      time: e.blockNumber * 100000 + e.logIndex,
      address,
      operation,
    });
  };

  const cm = new Contract(
    creditManager,
    abi["filtersV1"],
    getProvider("ethereum")
  );
  const cf = await cm.creditFilter();

  const topics = {
    OpenCreditAccount: cm.interface.getEventTopic("OpenCreditAccount"),
    CloseCreditAccount: cm.interface.getEventTopic("CloseCreditAccount"),
    RepayCreditAccount: cm.interface.getEventTopic("RepayCreditAccount"),
    LiquidateCreditAccount: cm.interface.getEventTopic(
      "LiquidateCreditAccount"
    ),
    TransferAccount: cm.interface.getEventTopic("TransferAccount"),
  };

  const logs = (
    await cm.queryFilter(
      {
        address: creditManager,
        topics: [Object.values(topics)],
      },
      undefined
    )
  ).map((log) => ({
    ...cm.interface.parseLog(log),
    blockNumber: log.blockNumber,
    logIndex: log.logIndex,
  }));

  logs.forEach((log) => {
    switch (log.name) {
      case "OpenCreditAccount":
        addToEvents(log, log.args.onBehalfOf, "add");
        break;
      case "CloseCreditAccount":
      case "LiquidateCreditAccount":
      case "RepayCreditAccount":
        addToEvents(log, log.args.borrower, "delete");
        break;
      case "TransferAccount":
        addToEvents(log, log.args.oldOwner, "delete");
        addToEvents(log, log.args.newOwner, "add");
        break;
    }
  });
  eventsByDate
    .sort((a, b) => {
      return a.time - b.time;
    })
    .forEach((e) => {
      if (e.operation === "add") {
        accounts.add(e.address);
      } else {
        accounts.delete(e.address);
      }
    });

  const openCAs = Array.from(accounts.values()).map(
    (borrower) =>
      logs.find(
        (log) => log.args.onBehalfOf && log.args.onBehalfOf === borrower
      ).args.creditAccount
  );

  const totalValue = await api2.abi.multiCall({
    abi: abi["calcTotalValue"],
    target: cf,
    calls: openCAs.filter(
      (i) => i !== "0xaBBd655b3791175113c1f1146D3B369494A2b815"
    ), // filtered out address throwing error
    block,
  });

  return totalValue
    .reduce((a, c) => a.add(BigNumber.from(c)), BigNumber.from("0"))
    .toString();
};

module.exports = { getV1CAs, getV2CAs };