const sdk = require("@defillama/sdk");
const { providers } = require("@defillama/sdk/build/general");
const { Contract } = require("ethers");
const { paginatedEventQuery, getConfig } = require("./utils");

const mpcAbi = require("./mpcAbi.json");
const ogAbi = require("./ogAbi.json");

const ethAddress = "0x0000000000000000000000000000000000000000";

async function tvl(_, _1, _2, api) {
  const balances = {};

  const url =
    "https://raw.githubusercontent.com/md0x/DefiLlama-Adapters/main/projects/osnap/config.json";
  const config = await getConfig(url);

  const {
    masterCopyAddress,
    masterCopyDeploymentBlock,
    mpcAddress,
    tokens,
    logMaxBlockLookBack,
    avatars,
  } = config[api.chain];

  let avatarList;
  if (avatars) {
    avatarList = avatars;
  } else {
    const mpc = new Contract(mpcAddress, mpcAbi, providers[api.chain]);
    const filter = mpc.filters.ModuleProxyCreation(null, masterCopyAddress);

    const events = await paginatedEventQuery(
      mpc,
      filter,
      {
        fromBlock: masterCopyDeploymentBlock,
        toBlock: await providers[api.chain].getBlockNumber(),
        maxBlockLookBack: logMaxBlockLookBack,
      },
      0
    );
    const avatarsFromEvents = await Promise.all(
      events.map(async (event) => {
        const proxy = event.args.proxy;
        const og = new Contract(proxy, ogAbi, providers[api.chain]);
        const avatar = await og.avatar();
        return avatar;
      })
    );
    // remove duplicates
    avatarList = [...new Set(avatarsFromEvents)];
  }

  await Promise.all(
    avatarList.map(async (avatar) => {
      // eth balance
      const { output: balance } = await sdk.api.eth.getBalance({
        target: avatar,
        block: api.block,
      });
      await sdk.util.sumSingleBalance(balances, ethAddress, balance);

      // erc20 balances
      await Promise.all(
        tokens.map(async (token) => {
          const balance = await api.api.call({
            abi: "erc20:balanceOf",
            target: token,
            params: [avatar],
          });
          await sdk.util.sumSingleBalance(balances, token, balance, api.chain);
        })
      );
    })
  );

  return balances;
}

module.exports = {
  methodology:
    "Calculates the total value held by the Avatars of all deployed OGs modules",
  ethereum: {
    tvl,
  },
  polygon: {
    tvl,
  },
  avax: {
    tvl,
  },
  arbitrum: {
    tvl,
  },
  optimism: {
    tvl,
  },
  xdai: {
    tvl,
  },
};
