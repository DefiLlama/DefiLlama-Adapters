const sdk = require("@defillama/sdk");
const {
  ContractFactory,
  ethers,
  providers,
  BigNumber,
} = require("ethers");
const { request, gql } = require("graphql-request");
const { toUSDTBalances, usdtAddress } = require("../helper/balances");


const BigNumberJs = require("bignumber.js");

const ALL_ORGS_GQL = gql`
  query allOrgs($lastID: ID) {
    organizations(first: 1000, where: { id_gt: $lastID,active:true }) {
      id
      token {
        name
        id
      }
      config {
        conviction {
          requestToken {
            id
            name
          }
          fundsManager
        }
      }
      proposalCount
      active
    }
  }
`;

const TOKEN_PRICE_QUERY = gql`
  query tokenPrice($tokenAddress: String) {
    token(id: $tokenAddress) {
      derivedETH
    }
  }
`
const ALL_TOKEN_PRICE_QUERY = gql`
query pricesTokens($tokenAddress:[ID]){
  tokens(where:{id_in:$tokenAddress}) {
    id
    derivedETH
  }
}
`

const XDAI_NODE = "https://rpc.xdaichain.com";
const abiFundManager = [
  "function balance(address _token) public view returns (uint256)",
];



async function tvl(timestamp, block, chainBlocks) {
  // let balances = BigNumber.from(0)
  let balances = {}
  let listTokens = {}

  const orgs = await request(
    "https://api.thegraph.com/subgraphs/name/1hive/gardens-xdai",
    ALL_ORGS_GQL,
    { lastID: "" }
  );

  console.log(orgs.organizations.length);
  
  for (const org of orgs.organizations) {
    let fundManagerContract = org.config.conviction?.fundsManager;
    let token = org.config.conviction?.requestToken.id;
    let name = org.config.conviction?.requestToken.name;
    if (!fundManagerContract || !token){
      continue
    }

    // let fundManagerContract = "0x4ba7362F9189572CbB1216819a45aba0d0B2D1CB";
    // let token = "0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9";

    const fundManager = ContractFactory.getContract(
      fundManagerContract,
      abiFundManager,
      new providers.StaticJsonRpcProvider(XDAI_NODE)
    );
    const output = await fundManager.balance(token);
    listTokens[token] = {
      name,
      org:org.id,
      balance: output
    }
    console.log(`Name: ${name} Balance: ${ethers.utils.formatEther(output)} OrgID: ${org.id}`);
  }

  return getUSDBalancesFromTokens(listTokens)
  // return balances;
}


async function getUSDBalancesFromTokens(tokens) {
  let balances = {};
  balances[usdtAddress] = BigNumberJs(0)
  tokensIDLowerCase = Object.keys(tokens).map(token=>token.toLowerCase())

    const resultTokenPrice = await request(
      "https://api.thegraph.com/subgraphs/name/1hive/honeyswap-v2",
      ALL_TOKEN_PRICE_QUERY,
      { tokenAddress: tokensIDLowerCase }
    );
  
    console.log(resultTokenPrice);
    let totalPrices = 0;
    for (const token of resultTokenPrice.tokens) {
      let objToken = tokens[token.id]
      
      const tokenPrice = token.derivedETH;

      const price = Number(parseFloat(tokenPrice).toFixed(2))
      
      const tokenUnits = parseFloat(ethers.utils.formatEther(objToken.balance)).toFixed(2)
      
      const totalUSD = price*tokenUnits

      objToken = {
        ...objToken,
        totalUSD
        ,tokenPrice
        ,price
        ,tokenUnits
      }
      tokens[token.id] = objToken
      
      console.log(`Price: ${price}, tokenUnits:${tokenUnits} totalUSD: ${totalUSD} token.id: ${token.id}`)
      if (totalUSD > 10000){
        totalPrices+=totalUSD
      }
    }
    console.log(tokens)
    let usdBal = toUSDTBalances(totalPrices)[usdtAddress];
    console.log(`usdBal: ${usdBal}`)
      balances[usdtAddress] = usdBal 
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  xdai: {
    tvl
  },
};
