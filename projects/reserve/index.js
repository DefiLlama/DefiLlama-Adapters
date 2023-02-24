const { Contract, BigNumber, ethers } = require("ethers");
const { providers } = require("@defillama/sdk/build/general");

const { sumTokens2 } = require("../helper/unwrapLPs.js");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const abi = require("./abi.json");

const vault = "0xaedcfcdd80573c2a312d15d6bb9d921a01e4fb0f";
const deployerAddress = "0xFd6CC4F251eaE6d02f9F7B41D1e80464D3d2F377";
const rsr = "0x320623b8E4fF03373931769A31Fc52A4E78B5d70";

async function tvl(_time, block) {
  // First section is for RSV which will soon be deprecated
  const balances = {};
  await sumTokensAndLPsSharedOwners(
    balances,
    [
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", //usdc
      "0x8e870d67f660d95d5be530380d0ec0bd388289e1", //pax
      "0x0000000000085d4780B73119b644AE5ecd22b376", //tusd
      "0x4Fabb145d64652a948d72533023f6E7A623C7C53", //busd
    ].map((t) => [t, false]),
    [vault],
    block
  );

  const deployer = new Contract(
    deployerAddress,
    abi["deployer"],
    providers["ethereum"]
  );

  const deploymentTopic = deployer.interface.getEventTopic("RTokenCreated");

  const creationLogs = await deployer.queryFilter(
    {
      address: deployerAddress,
      topics: [deploymentTopic],
    },
    undefined,
    block
  );

  // staticWrapperMappings is used to map wrapped tokens to their underlying
  const staticWrapperMappings = {};
  const rTokenAddresses = creationLogs.map((log, i) => {
    return { rToken: log.args.rToken, main: log.args.main };
  });

  // rToken + backingManager contracts can hold funds
  // so we push them to the owners array
  const rTokenInfo = await Promise.all(
    rTokenAddresses.map(async (rToken, i) => {
      const main = new Contract(
        rToken.main,
        abi["main"],
        providers["ethereum"]
      );
      const backingManagerAddr = await main.backingManager();
      const basketHandlerAddr = await main.basketHandler();

      const basketHandler = new Contract(
        basketHandlerAddr,
        abi["basketHandler"],
        providers["ethereum"]
      );

      // stRSR contract holds staked RSR
      const stRSR = await main.stRSR();

      const basket = await basketHandler.quote(0, 0);

      // basket[0] is the tokens
      const basketTokens = basket[0];

      // check if token bytecode contains ATOKEN
      // indicating it's a wrapped token
      await Promise.all(
        basketTokens.map(async (token) => {
          const bytecode = await providers["ethereum"].getCode(token);
          const tokenInterface = new ethers.utils.Interface(abi["staticToken"]);
          const selector = tokenInterface.getSighash("ATOKEN()");
          if (bytecode.includes(selector.slice(2, 10))) {
            const staticToken = new Contract(
              token,
              abi["staticToken"],
              providers["ethereum"]
            );
            const underlying = await staticToken.ATOKEN();
            staticWrapperMappings[token] = underlying;
          }
        })
      );

      return {
        owners: [rToken.rToken, backingManagerAddr, stRSR],
        tokens: basketTokens,
      };
    })
  );

  const { owners, tokens } = rTokenInfo.reduce(
    (acc, cur) => {
      return {
        owners: acc.owners.concat(cur.owners),
        tokens: acc.tokens.concat(cur.tokens),
      };
    },
    {
      owners: [...Object.keys(staticWrapperMappings)],
      tokens: [...Object.values(staticWrapperMappings), rsr],
    }
  );

  const rTokenSums = await sumTokens2({
    tokens,
    owners,
    block,
  });

  const ret = sumObjectsByKey(balances, rTokenSums);
  return ret;
}

module.exports = {
  ethereum: { tvl },
  methodology: `Gets the tokens on ${vault}`,
};

const sumObjectsByKey = (...objs) => {
  return objs.reduce((a, b) => {
    for (let k in b) {
      if (b.hasOwnProperty(k)) a[k] = ((+a[k] || 0) + +b[k]).toString();
    }
    return a;
  }, {});
};
