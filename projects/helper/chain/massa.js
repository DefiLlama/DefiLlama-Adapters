const {
  Client,
  ProviderType,
  strToBytes,
  bytesToU256, 
  bytesToU64
} = require("@massalabs/massa-web3");

const { TokenAmount, Token } = require("@dusalabs/sdk");

const RPC_ENDPOINT = "https://mainnet.massa.net/api/v2";
const ERC20_KEYS = ['SYMBOL', 'NAME', 'OWNER', 'TOTAL_SUPPLY', 'DECIMALS'];

const providers = [
  { url: RPC_ENDPOINT, type: ProviderType.PUBLIC },
  { url: RPC_ENDPOINT, type: ProviderType.PRIVATE },
];

const baseClient = new Client({
  providers,
  retryStrategyOn: false,
});

function u8ArrayToString(array) {
  let str = "";
  for (const byte of array) {
    str += String.fromCharCode(byte);
  }
  return str;
}


const getPairAddress = async (factoryAddress) => {
  if (!factoryAddress) {
    throw new Error("factoryAddress is undefined");
  }
  return await baseClient
    .publicApi()
    .getDatastoreEntries([
      {
        address: factoryAddress,
        key: strToBytes("ALL_PAIRS"),
      },
    ])
    .then((r) => {
      if (r[0].candidate_value && r[0].final_value){
        const poolAddresses = [u8ArrayToString(r[0].candidate_value)];
          if (poolAddresses[0].startsWith(":")) {
            poolAddresses[0] = poolAddresses[0].substring(1);
          }
          const pools = poolAddresses[0].split(":");
            return pools
      }
      return [];
    })
    .catch((e) => {
      console.error("error", e);
      return [""];
    });
};

async function getPairAddressTokens(poolAddress) {
  return baseClient
    .publicApi()
    .getDatastoreEntries([
      {
        address: poolAddress,
        key: strToBytes("TOKEN_X"),
      },

      {
        address: poolAddress,
        key: strToBytes("TOKEN_Y"),
      },
    ])
    .then((r) => {
      if (r[0].candidate_value && r[1].candidate_value) {
        return [
          u8ArrayToString(r[0].candidate_value),
          u8ArrayToString(r[1].candidate_value),
        ];
      } else {
        console.error("error in getPairAddressTokens", r);
        return [];
      }
    })
    .catch((e) => {
      console.error("error", e);
      return [""];
    });
}

const getDatastoreEntries = async (tokenAddress) => {
  return baseClient
    .publicApi()
    .getDatastoreEntries([
      {
        address: tokenAddress,
        key: strToBytes("DECIMALS"),
      },
    ])
    .then((res) => {
      if (!res[0].candidate_value) throw new Error("No token info found");
      return res[0].candidate_value;
    });
};


const toDatastoreInput = (address, keys) =>
	keys.map((key) => ({ address, key: strToBytes(key) }));

const bytesToBigInt = (bytes) => {
	try {
		return bytesToU256(bytes);
	} catch (e) {
		try {
			return bytesToU64(bytes);
		} catch (e) {
			return 0n;
		}
	}
};
async function getTokenBalance(tokenAddress, ownerAddress) {
  const tokens = await baseClient
    .publicApi()
    .getAddresses([tokenAddress])
    .then((res) =>
      res[0].final_datastore_keys
        .map((v) => String.fromCharCode(...v))
        .sort((a, b) => a.localeCompare(b))
        .filter((entry) => entry.startsWith('BALANCE'))
    )
    .catch((err) => {
      console.error(err);
      return [];
    });

  const keys = [...new Set([...ERC20_KEYS, ...tokens.slice(0, 1000)])];
  const r = await baseClient
    .publicApi()
    .getDatastoreEntries(
      
      toDatastoreInput(tokenAddress, keys)
    )

  const balanceEntries = r.filter(
      (entry, i) => keys[i].startsWith('BALANCE') && entry.candidate_value !== null
  );

  const balances= balanceEntries
  .map((entry) => ({
    address: keys[r.indexOf(entry)].slice(7),
    value: bytesToBigInt(entry.candidate_value)
  }))
  .sort((a, b) => Number(b.value - a.value));

  const tokenBalance = balances.find((entry) => entry.address === ownerAddress);

  if (tokenBalance === undefined) {
    return {[tokenAddress]: 0n}
  }
  else {
    return {[tokenAddress]: tokenBalance.value};
  } 
}

async function sumTokens2(toa,api){
  let balances = {};
  for (const i in toa){
    let balance = await getTokenBalance(toa[i][0], toa[i][1]);
    const tokenBalance = (balance[toa[i][0]]);
    if (balances[toa[i][0]] === undefined) {
      const decimal = await getDatastoreEntries(toa[i][0]);
      const token = new Token("", "", Number(decimal), "", ""); 
      balances[toa[i][0]] = Math.round(Number(new TokenAmount(token, tokenBalance).toFixed(Number(decimal))));
    } else {
      
      const decimal = await getDatastoreEntries(toa[i][0]);
      const token = new Token("", "", Number(decimal), "", "");
      balances[toa[i][0]] += Math.round(Number(new TokenAmount(token, tokenBalance).toFixed(Number(decimal))));
    }
  }
  return balances;
}

async function formatBalances(balances, api){
  const formattedBalances = {};
  for (const j in balances){
    formattedBalances['massa:'+j.toString()] = balances[j];
    console.log('j', j);
    
    api.addTokens(j, balances[j]);
  }
  return formattedBalances;
}


module.exports = {
  getPairAddressTokens,
  formatBalances,
  getPairAddress,
  sumTokens2,
  getTokenBalance
};