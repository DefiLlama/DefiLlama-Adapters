const { default: axios } = require("axios");
var BigNumber = require("big-number");

const {
  sumTokensAndLPsSharedOwners,
  addTokensAndLPs,
} = require("../helper/unwrapLPs");
const {
  transformFantomAddress,
  transformAvaxAddress,
  transformPolygonAddress,
} = require("../helper/portedTokens.js");

const { createClient } = require("urql");
const { ethers } = require("ethers");
const fetch = require("isomorphic-unfetch");

const HOLDERS = {
  ethereum: "0xA81bd16Aa6F6B25e66965A2f842e9C806c0AA11F",
  polygon: "0x3cCc20d960e185E863885913596b54ea666b2fe7",
  fantom: "0x3923E7EdBcb3D0cE78087ac58273E732ffFb82cf",
  avax: "0x955a88c27709a1EEf4ACa0df0712c67B48240919",
};

const MIN_BLOCK = {
  ethereum: 0,
  polygon: 0,
  fantom: 32894036,
  avax: 0,
};

const providers = {
  fantom: "https://rpc.ftm.tools/",
};

async function mainnetTVL(time, block) {
  const tokenRes = await axios.get(
    "https://defi-llama-feed.vercel.app/api/address"
  );

  const APIURL =
    "https://api.thegraph.com/subgraphs/name/revest-finance/revest-mainnet-subgraph";

  const balances = await queryGraph("", APIURL, tokenRes);

  await calculateTVL(tokenRes, balances, block);
  return balances;
}

async function polygonTVL(time, block) {
  const tokenRes = await axios.get(
    "https://defi-llama-feed.vercel.app/api/address?chainId=137"
  );
  const balances = {};
  const transform = await transformPolygonAddress();
  await calculateTVL(tokenRes, balances, block, "polygon", transform);
  return balances;
}

async function fantomTVL(time, block) {
  const tokenRes = await axios.get(
    "https://defi-llama-feed.vercel.app/api/address?chainId=250"
  );

  const transform = await transformFantomAddress();

  const APIURL =
    "https://api.thegraph.com/subgraphs/name/revest-finance/revestfantomtvl";

  const balances = await queryGraph("fantom:", APIURL, tokenRes);

  await calculateTVL(tokenRes, balances, block, "fantom", transform);

  return balances;
}

async function avaxTVL(time, block) {
  const tokenRes = await axios.get(
    "https://defi-llama-feed.vercel.app/api/address?chainId=43114"
  );
  const balances = {};
  const transform = await transformAvaxAddress();
  await calculateTVL(tokenRes, balances, block, "avax", transform);
  return balances;
}

function sumTvl(tvlList = []) {
  return async (...args) => {
    const results = await Promise.all(tvlList.map((fn) => fn(...args)));
    return results.reduce((a, c) => Object.assign(a, c), {});
  };
}

async function queryGraph(chain, graph_api, tokenRes) {
  let balances = {};
  //for each token we care about in the array
  for (let i = 0; i < tokenRes.data.body.length; i++) {
    let totalBalance = 0;
    let skipAmount = 0;
    let objReturned = 0;

    do {
      const tokensQuery = `
      query {
        tokenVaultInteractions (
            where: {
              token: \"${tokenRes.data.body[i]}"
            }
            skip: ${skipAmount}
        ) {
          isDeposit
          amountTokens
        }
      }
    `;

      const client = createClient({
        url: graph_api,
      });

      const data = await client.query(tokensQuery).toPromise();

      for (let y = 0; y < data.data.tokenVaultInteractions.length; y++) {
        let bal = Number(
          ethers.utils.formatEther(
            data.data.tokenVaultInteractions[y].amountTokens
          )
        );
        if (data.data.tokenVaultInteractions[y].isDeposit == true) {
          // console.log(Number(ethers.utils.formatEther(data.data.tokenVaultInteractions[y].amountTokens)))
          totalBalance += bal;
        } else {
          totalBalance -= bal;
        }
      }

      // console.log(`Length: ${data.data.tokenVaultInteractions.length}`)
      skipAmount += 100;
      objReturned = data.data.tokenVaultInteractions.length;
    } while (objReturned != 0);
    // console.log(`Total Balance ${tokenRes.data.body[i]}: ${totalBalance}`)
    if (totalBalance < 0) {
      balances[chain + tokenRes.data.body[i]] = ethers.utils
        .parseEther("0")
        .toString();
    } else {
      balances[chain + tokenRes.data.body[i]] = ethers.utils
        .parseEther(totalBalance.toString())
        .toString();
    }
  }

  return balances;
}

async function calculateTVL(
  tokenRes,
  balances,
  block,
  network = "ethereum",
  transform = (id) => id
) {
  let amountPrim = {};
  let holder = HOLDERS[network];
  await sumTokensAndLPsSharedOwners(
    amountPrim,
    tokenRes.data.body.map((t) => [t, false]),
    [holder],
    block[network],
    network,
    transform
  );
  amountPrim = Object.entries(amountPrim);
  const amounts = {
    output: amountPrim.map((element) => {
      return { output: element[1] };
    }),
  };
  const tokens = {
    output: tokenRes.data.body.map((element) => {
      return { output: element };
    }),
  };

  await addTokensAndLPs(
    balances,
    tokens,
    amounts,
    block[network],
    network,
    transform
  );
}

module.exports = {
  methodology: "We list all tokens in our vault and sum them together",

  ethereum: {
    tvl: mainnetTVL,
  },
  polygon: {
    tvl: polygonTVL,
  },
  fantom: {
    tvl: fantomTVL,
  },
  avalanche: {
    tvl: avaxTVL,
  },
  tvl: sumTvl([mainnetTVL, polygonTVL, fantomTVL, avaxTVL]),
};
