const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');

// --- CONSTANTS ---
const CHAIN = 'base';
const AERO_TOKEN = '0x940181a94A35A4569E4529A3CDfB74e38FD98631';
const VE_AERO_CONTRACT = '0xeBf418Fe2512e7E6bd9b87a8F0f294aCDC67e6B4'; // Aerodrome Voting Escrow
const CL_MANAGER = '0x827922686190790b37229fd06084350e74485b72'; // Aerodrome CL Manager

const VAULT_ADDRESS = '0x180DAB53968e599Dd43CF431E27CB01AA5C37909';
const PEG_DEFENDER = '0x7961523a81cc89beb33f2f140255213a6433cdbd';

const POOL_V2 = '0x08d49da370ecffbc4c6fdd2ae82b2d6ae238affd';

// --- ABIs ---
const ABI = {
  // Standard
  balanceOf: "erc20:balanceOf",
  token0: "function token0() view returns (address)",
  token1: "function token1() view returns (address)",
  totalSupply: "function totalSupply() view returns (uint256)",
  tokenOfOwnerByIndex: "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",

  // veAERO Specific
  ownerToNFTokenIdList: {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "index", "type": "uint256" }],
    "name": "ownerToNFTokenIdList",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  locked: {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "locked",
    "outputs": [{ "internalType": "int128", "name": "amount", "type": "int128" }, { "internalType": "uint256", "name": "end", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },

  // V2 Pool Reserves
  getReserves: "function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)",
};

async function tvl(api) {
  // 1. Identify Tokens
  const token0V2 = await api.call({ target: POOL_V2, abi: ABI.token0 });
  const token1V2 = await api.call({ target: POOL_V2, abi: ABI.token1 });
  const iAERO_TOKEN = token0V2.toLowerCase() === AERO_TOKEN.toLowerCase() ? token1V2 : token0V2;

  let totalAero = new BigNumber(0);
  let totaliAero = new BigNumber(0);

  // --- PART A: veAERO in Vault ---
  const vaultBalance = await api.call({ target: VE_AERO_CONTRACT, params: [VAULT_ADDRESS], abi: ABI.balanceOf });
  
  if (vaultBalance > 0) {
    const calls = [];
    for (let i = 0; i < vaultBalance; i++) {
      calls.push({ target: VE_AERO_CONTRACT, params: [VAULT_ADDRESS, i] });
    }
    const vaultTokenIds = await api.multiCall({ abi: ABI.ownerToNFTokenIdList, calls });

    if (vaultTokenIds.length > 0) {
      const lockedCalls = vaultTokenIds.map(id => ({ target: VE_AERO_CONTRACT, params: [id] }));
      const lockedData = await api.multiCall({ abi: ABI.locked, calls: lockedCalls });

      lockedData.forEach((data) => {
        if (data && data.amount) {
           totalAero = totalAero.plus(new BigNumber(data.amount));
        }
      });
    }
  }

  // --- PART B: V2 LP ---
  const lpBalance = await api.call({ target: POOL_V2, params: [PEG_DEFENDER], abi: ABI.balanceOf });

  let v2Res0, v2Res1;
  const lpReserves = await api.call({ target: POOL_V2, abi: ABI.getReserves });
  v2Res0 = new BigNumber(lpReserves._reserve0);
  v2Res1 = new BigNumber(lpReserves._reserve1);

  if (lpBalance > 0) {
    const lpSupply = await api.call({ target: POOL_V2, abi: ABI.totalSupply });
    const share = new BigNumber(lpBalance).div(lpSupply);

    if (token0V2.toLowerCase() === AERO_TOKEN.toLowerCase()) {
      totalAero = totalAero.plus(v2Res0.times(share));
      totaliAero = totaliAero.plus(v2Res1.times(share));
    } else {
      totaliAero = totaliAero.plus(v2Res0.times(share));
      totalAero = totalAero.plus(v2Res1.times(share));
    }
  }

  // --- PART C: CL Positions (Temporarily Disabled) ---
  // Skipped for now to unblock submission. Can be re-added once slot0 ABI issues are resolved.
  
  // --- PART D: Pricing & Consolidation ---
  let iAeroPriceInAero = new BigNumber(0);

  if (!v2Res0.isZero() && !v2Res1.isZero()) {
    if (token0V2.toLowerCase() === AERO_TOKEN.toLowerCase()) {
       iAeroPriceInAero = v2Res0.div(v2Res1);
    } else {
       iAeroPriceInAero = v2Res1.div(v2Res0);
    }
  }

  const iAeroValueInAero = totaliAero.times(iAeroPriceInAero);
  const finalAeroTvl = totalAero.plus(iAeroValueInAero);
  
  // CRITICAL FIX: Use .toFixed(0) to ensure a plain integer string is passed to SDK
  api.add(AERO_TOKEN, finalAeroTvl.toFixed(0));
}

module.exports = {
  methodology: 'TVL includes veAERO locked in the protocol vault and V2 liquidity held by the Peg Defender. iAERO is priced internally via the AERO peg.',
  [CHAIN]: {
    tvl
  }
};