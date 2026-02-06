const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
<<<<<<< HEAD
const { ZeroAddress } = require("ethers");
=======

>>>>>>> 2a4f43188a6cf52d2ab336d5ef4b3928382da581

//Supported chain subgraphs configuration for Verified Network
//TODO: add more chains
const chainsConfig = {
  base: {
    subgraphUrl:
      "https://api.studio.thegraph.com/query/77016/vault-base/version/latest",
  },
  ethereum: {
<<<<<<< HEAD
    address: "0x9347CEb82BC0c554Ed21411d8c5390B7f4aeECdd",
    subgraphUrl:
      "https://api.studio.thegraph.com/query/77016/vault-mainnet/version/latest",
  },
  near: {
    address: "e72c57c01534e440d51a245368bb4b160f2be48c337cb089c71a784b062cbfa4"
  },
  solana: {
    address: "A6UcQUsYSYsHh7frmfJsY6UGK2rSE6WKJCv15MnrgYoB"
  }
};

//Fetch pools with at least 1 primarySubscriptions or orders or marginOrders
const fetchAllPools = async (url) => {
=======
    subgraphUrl:
      "https://api.studio.thegraph.com/query/77016/vault-mainnet/version/latest",
  },
};


//Fetch pools with at least 1 primarySubscriptions or orders or marginOrders
const getChainSecurities = async (url) => {
>>>>>>> 2a4f43188a6cf52d2ab336d5ef4b3928382da581
  let allPools = [];
  let skip = 0;
  const pageSize = 1000;
  let hasMore = true;

  const QUERY = (skip) => gql`
    query {
      pools: pools(
        first: ${pageSize}
        skip: ${skip}
        where: {
          or: [
            { primarySubscriptions_: { executionDate_gt: 0 } }
            { orders_: { timestamp_gt: 0 } }
            { marginOrders_: { timestamp_gt: 0 } }
          ]
        }
      ) {
        security
        currency
        tokens {
          symbol
          name
          decimals
          index
          address
        }
        orders {

          tokenIn { address }
          amountOffered
          timestamp
        }
        primarySubscriptions {
          subscription
          assetIn { address }
          executionDate
        }
        marginOrders {
          tokenIn { address }
          amountOffered
          timestamp
        }
      }
    }
  `;

<<<<<<< HEAD

=======
>>>>>>> 2a4f43188a6cf52d2ab336d5ef4b3928382da581
  while (hasMore) {
    try {
      const data = await request(url, QUERY(skip));
      const pools = data?.pools || [];
      allPools.push(...pools);
      skip += pageSize;
      hasMore = pools.length === pageSize;
    } catch (err) {
      console.error("GraphQL fetch error:", err);
      break;
    }
  }

  return allPools;
};


// Format TVL using DefiLlama SDK
const getChainTvls = (chain) => {
  const subgraphUrl = chainsConfig[chain].subgraphUrl;

  return async (_, __, ___) => {
    const balances = {};
<<<<<<< HEAD
    const pools = await fetchAllPools(subgraphUrl);
=======
    const pools = await getChainSecurities(subgraphUrl);
>>>>>>> 2a4f43188a6cf52d2ab336d5ef4b3928382da581

    for (const pool of pools) {
      const currency = pool?.currency?.toLowerCase();

      const currencyToken = pool?.tokens.find(
        (tkn) => tkn?.address?.toLowerCase() === currency
      );
      if (!currencyToken || !currencyToken?.decimals) continue;

      const decimals = Number(currencyToken.decimals);

      const addBalance = (amount, tokenAddress) => {
        const token = `${chain}:${tokenAddress.toLowerCase()}`;
        const scaledAmount = Number(amount) * (10 ** decimals);
        sdk.util.sumSingleBalance(balances, token, scaledAmount);
      };

      // Primary Subscriptions
      pool.primarySubscriptions?.forEach((sub) => {
        if (sub?.assetIn?.address?.toLowerCase() === currency) {
          addBalance(sub.subscription, sub.assetIn.address);
        }
      });

      // Orders 
      pool.orders?.forEach((ord) => {
        if (ord?.tokenIn?.address?.toLowerCase() === currency) {
          addBalance(ord.amountOffered, ord.tokenIn.address);
        }
      });

      // Margin Orders
      pool.marginOrders?.forEach((ord) => {
        if (ord?.tokenIn?.address?.toLowerCase() === currency) {
          addBalance(ord.amountOffered, ord.tokenIn.address);
        }
      });
    }

<<<<<<< HEAD

    if(chainsConfig[chain].address) {
      //if address exist on chain fetch it balance and compute new TVL
      const chainBalance = await getAddressTvl(chain, chainsConfig[chain].address)();
     Object.keys(chainBalance).map((tk) => {
      balances[tk] = balances[tk]  ? balances[tk] + chainBalance[tk] : chainBalance[tk]
     })
    }
  return balances;
  };
};
// Fetch address ETH balance and compute TVL using DefiLlama SDK
const getEthBalance = (address) => {
  return async (_, __, ___) => { 
  const res = await fetch("https://eth-mainnet.public.blastapi.io", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getBalance",
      params: [address, "latest"],
    }),
  });

  const data = await res.json();

  let balances = {};

   const token = `ethereum:${ZeroAddress?.toLowerCase()}`;
  sdk.util.sumSingleBalance(balances, token, Number(data.result));

  return balances;
}
}
// Helper function to get Near from yocto
const yoctoToNear = (amount) => {
  const yocto = BigInt(amount);
  const base = 10n ** 24n;

  const whole = yocto / base;
  const frac = yocto % base;

  const fracStr = frac
    .toString()
    .padStart(24, "0")
    .replace(/0+$/, "");

  return fracStr ? `${whole}.${fracStr}` : whole.toString();
};
// Fetch address Near balance and compute TVL using DefiLlama SDK
const getNearBalance = (address) => {
  return async (_, __, ___) => { 
    const res = await fetch("https://rpc.mainnet.near.org", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "query",
      params: {
        request_type: "view_account",
        finality: "final",
        account_id: address,
      },
    }),
  });

  const data = await res.json();

  let balances = {};

   const token = `near:${ZeroAddress?.toLowerCase()}`;
  sdk.util.sumSingleBalance(balances, token, Number(yoctoToNear(data.result.amount)) * 10 ** 18);

  return balances;
  }
  
}
// Fetch address Solana balance and compute TVL using DefiLlama SDK
const getSolBalance = (address) => {
  return async (_, __, ___) => { 
  const res = await fetch("https://api.mainnet-beta.solana.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [address],
    }),
  });

  const data = await res.json();

  let balances = {};

  const token = `solana:${ZeroAddress?.toLowerCase()}`;
  sdk.util.sumSingleBalance(balances, token, Number(data.result.value));

  return balances;
}
}
// Fetch address balance using chain and compute TVL using DefiLlama SDK
const getAddressTvl = (chain, address) => {
  switch (chain) {
    case 'ethereum':
      return  getEthBalance(address)
    case 'near':
      return  getNearBalance(address)
    case 'solana':
      return  getSolBalance(address)
    default:
      throw new Error(`chain: "${chain}" is not supported. List of supported chains are: ${Object.keys(chainsConfig)?.join(", ")}`);
  }
}
=======
    return balances;

  };
};
>>>>>>> 2a4f43188a6cf52d2ab336d5ef4b3928382da581

module.exports = {
  methodology:
    "TVL is digital assets paid in to purchase security tokens on the Verified Network",
  timetravel: true,
  misrepresentedTokens: false,
};

<<<<<<< HEAD

Object.keys(chainsConfig).forEach((chain) => {
  if(chainsConfig[chain]?.subgraphUrl) {
    module.exports[chain] = {
    tvl: getChainTvls(chain)
  };
  }else if(chainsConfig[chain]?.address) {
    module.exports[chain] = {
    tvl: getAddressTvl(chain, chainsConfig[chain]?.address),
  };
  }
  
=======
Object.keys(chainsConfig).forEach((chain) => {
  module.exports[chain] = {
    tvl: getChainTvls(chain),
  };
>>>>>>> 2a4f43188a6cf52d2ab336d5ef4b3928382da581
});
