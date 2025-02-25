const ADDRESSES = require('../helper/coreAssets.json')
const { getMultipleAccounts, getProvider } = require('../helper/solana')
const { Program, BN } = require("@project-serum/anchor")
const { PublicKey } = require("@solana/web3.js")

const TOKEN_INFO = {
  USDC: {
    mint: ADDRESSES.solana.USDC,
    decimals: 6,
  },
  SOL: {
    mint: ADDRESSES.solana.SOL,
    decimals: 9,
  },
  JLP: {
    mint: '27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4',
    decimals: 6,
  },
  BTC: {
    mint: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh',
    decimals: 8,
  },
  ETH: {
    mint: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    decimals: 8,
  },
}

function getTokenInfo(isSpotMarket, marketIndex) {
  if (isSpotMarket) {
    switch (marketIndex) {
      case 0:
        return TOKEN_INFO['USDC']
      case 1:
        return TOKEN_INFO['SOL']
      case 19:
        return TOKEN_INFO['JLP']
    }
  }
  else {
    switch (marketIndex) {
      case 0:
        return TOKEN_INFO['SOL']
      case 1:
        return TOKEN_INFO['BTC']
      case 2:
        return TOKEN_INFO['ETH']
    }
  }
  return undefined
}

async function tvl(api) {

  const vaultUserAddresses = [
    '3Wg1GaW4Szame9bzKScxM56DHgDAKTq4c9674LPEuNNP', // DeltaNeutral-JLP-USDC-SOL-KT1
    'FmrEVTqKUG9npwaQBbrHKt1VXL5LJPPhzQazjCh1fwwB', // DeltaNeutral-JLP-USDC-EVM-KT4
    'J5VbheCue9U4hW7u9DZzwgo5h7BhnBqL8rF9c71MDsfC', // DeltaNeutral-JLP-USDC-SVM-KT5
    'AcN9Mct9dLYQVDsyQinbbHKbsXYB4Tnaq5DgKwzrWaY4', // DeltaNeutral-JLP-SOL-SVM-KT6
    'B84ppdVLsqk8L2rGPYkV1R3w1UxL71RCmuDQJHNLZGHT', // DeltaNeutral-JLP-USDC-KT9
  ];

  const accounts = await getMultipleAccounts(vaultUserAddresses)

  const idl = require("./drift_idl.json")
  const programId = new PublicKey('dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH')
  const provider = getProvider()
  const program = new Program(idl, programId, provider)    

  for (const account of accounts) {
      const userData = program.coder.accounts.decode("User", account.data);
      for (const spotPosition of userData.spotPositions) {
        if (!new BN(spotPosition.scaledBalance).isZero()) {
          const marketIndex = spotPosition.marketIndex
          const balanceType = Object.keys(spotPosition.balanceType ?? {})?.[0]
          const scaledBalance = new BN(spotPosition.scaledBalance)
          const token = getTokenInfo(true, marketIndex)
          if (!token) continue;
          const balance = scaledBalance
            .mul(new BN(balanceType === 'deposit' ? 1 : -1))
            .div(new BN(10).pow(new BN(token.decimals - 9)));
  
          api.add(token.mint, balance.toString()) 
        }        
      }
      for (const perpPosition of userData.perpPositions) {
        if (!new BN(perpPosition.baseAssetAmount).isZero()) {
          const marketIndex = perpPosition.marketIndex
          const token = getTokenInfo(false, marketIndex)
          if (!token) continue;
          const baseAssetAmount = new BN(perpPosition.baseAssetAmount)
            .div(new BN(10).pow(new BN(token.decimals - 9))); 
          const quoteAssetAmount = new BN(perpPosition.quoteAssetAmount)
          api.add(TOKEN_INFO['USDC'].mint, quoteAssetAmount.toString())
          api.add(token.mint, baseAssetAmount.toString())
        }        
      }
  }
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: "SPOT balance + PERP positions unsettled PNLs",
  solana: { tvl },
};
