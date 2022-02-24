const { PublicKey } =require("@solana/web3.js");
const { AccountLayout, u64, MintInfo, MintLayout } = require("@solana/spl-token");

const getAccountInfo = async (connection, pubKey) => {
  const info = await connection.getAccountInfo(pubKey);
  if (info === null) {
    throw new Error("Failed to find mint account");
  }

  const buffer = Buffer.from(info.data);

  const data = deserializeAccount(buffer);

  const details = {
    pubkey: pubKey,
    account: {
      ...info,
    },
    info: data,
  };

  return details;
};

const getMultipleAccountInfo = async (connection, pubKeys) => {
  let array = [];
  var pubList = pubKeys.reduce((resultArray, item, index) => { 
    const chunkIndex = Math.floor(index/100)
  
    if(!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [] // start a new chunk
    }
  
    resultArray[chunkIndex].push(item)
  
    return resultArray
  }, [])

  for await (const subPubList of pubList) {
    const info = await connection.getMultipleAccountsInfo(subPubList);
    if (info === null) {
      throw new Error("Failed to find mint account");
    }
    
    info.forEach(buf => {
      if (buf != null) {
        const buffer = Buffer.from(buf.data);
        const data = deserializeAccount(buffer);
      
        const details = {
          pubkey: subPubList[info.indexOf(buf)],
          account: {
            ...buf,
          },
          info: data,
        };

        array.push(details);
      }
    });
  }

  return array;
};


// TODO: expose in spl package
const deserializeAccount = (data) => {
  const accountInfo = AccountLayout.decode(data);
  accountInfo.mint = new PublicKey(accountInfo.mint);
  accountInfo.owner = new PublicKey(accountInfo.owner);
  accountInfo.amount = u64.fromBuffer(accountInfo.amount);

  if (accountInfo.delegateOption === 0) {
    accountInfo.delegate = null;
    accountInfo.delegatedAmount = new u64(0);
  } else {
    accountInfo.delegate = new PublicKey(accountInfo.delegate);
    accountInfo.delegatedAmount = u64.fromBuffer(accountInfo.delegatedAmount);
  }

  accountInfo.isInitialized = accountInfo.state !== 0;
  accountInfo.isFrozen = accountInfo.state === 2;

  if (accountInfo.isNativeOption === 1) {
    accountInfo.rentExemptReserve = u64.fromBuffer(accountInfo.isNative);
    accountInfo.isNative = true;
  } else {
    accountInfo.rentExemptReserve = null;
    accountInfo.isNative = false;
  }

  if (accountInfo.closeAuthorityOption === 0) {
    accountInfo.closeAuthority = null;
  } else {
    accountInfo.closeAuthority = new PublicKey(accountInfo.closeAuthority);
  }

  return accountInfo;
};


const getMintInfo = async (connection, pubKey) => {
  const info = await connection.getAccountInfo(pubKey);
  if (info === null) {
    throw new Error("Failed to find mint account");
  }

  const data = Buffer.from(info.data);

  return deserializeMint(data);
};

const getMultipleMintInfo = async (connection, pubKeys) => {
  const info = await connection.getMultipleAccountsInfo(pubKeys);
  if (info === null) {
    throw new Error("Failed to find mint account");
  }

  return info.map(v => {
    if (v != null) {
      const data = Buffer.from(v.data);
      return {
        key: pubKeys[info.indexOf(v)].toBase58(),
        data: deserializeMint(data)
      };
    } 
    return null;
  })
};


// TODO: expose in spl package
const deserializeMint = (data) => {
  if (data.length !== MintLayout.span) {
    throw new Error("Not a valid Mint");
  }

  const mintInfo = MintLayout.decode(data);

  if (mintInfo.mintAuthorityOption === 0) {
    mintInfo.mintAuthority = null;
  } else {
    mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority);
  }

  mintInfo.supply = u64.fromBuffer(mintInfo.supply);
  mintInfo.isInitialized = mintInfo.isInitialized !== 0;

  if (mintInfo.freezeAuthorityOption === 0) {
    mintInfo.freezeAuthority = null;
  } else {
    mintInfo.freezeAuthority = new PublicKey(mintInfo.freezeAuthority);
  }

  return mintInfo;
};

module.exports={ getMultipleAccountInfo, getMultipleMintInfo }