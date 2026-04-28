/**
 * Phoenix Protocol — Soroban (Stellar) TVL adapter
 *
 * Phoenix is a concentrated-liquidity AMM DEX on Soroban. Pool addresses are
 * sourced from the verified mainnet deploy manifest:
 * https://github.com/Phoenix-Protocol-Group/phoenix-contracts/blob/main/scripts/upgrade_mainnet.sh
 *
 * Each pool's USD value is resolved via stellar.expert contract balance API.
 *
 * Factory: CB4SVAWJA6TSRNOJZ7W2AWFW46D5VR4ZMFZKDIKXEINZCZEGZCJZCKMI
 */

'use strict'

const axios = require('axios')
const methodologies = require('../helper/methodologies')

const STELLAR_EXPERT = 'https://api.stellar.expert/explorer/public/contract'

// All pools registered in the Phoenix factory as of 2026-04-28.
// Source: Phoenix-Protocol-Group/phoenix-contracts upgrade_mainnet.sh
const POOLS = [
  'CBHCRSVX3ZZ7EGTSYMKPEFGZNWRVCSESQR3UABET4MIW52N4EVU6BIZX', // XLM-USDC
  'CBCZGGNOEUZG4CAAE7TGTQQHETZMKUT4OIPFHHPKEUX46U4KXBBZ3GLH', // XLM-PHO
  'CBISULYO5ZGS32WTNCBMEFCNKNSLFXCQ4Z3XHVDP4X4FLPSEALGSY3PS', // XLM-EURC
  'CDQLKNH3725BUP4HPKQKMM7OO62FDVXVTO7RCYPID527MZHJG2F3QBJW', // USDC-VEUR
  'CBW5G5SO5SDYUGQVU7RMZ2KJ34POM3AMODOBIV2RQYG4KJDUUBVC3P2T', // USDC-VCHF
  'CDMXKSLG5GITGFYERUW2MRYOBUQCMRT2QE5Y4PU3QZ53EBFWUXAXUTBC', // XLM-USDX
  'CD5XNKK3B6BEF2N7ULNHHGAMOKZ7P6456BFNIHRF4WNTEDKBRWAE7IAA', // PHO-USDC
  'CC6MJZN3HFOJKXN42ANTSCLRFOMHLFXHWPNAX64DQNUEBDMUYMPHASAV', // EURX-USDC
  'CB5QUVK5GS3IU23TMFZQ3P5J24YBBZP5PHUQAEJ2SP5K55PFTJRUQG2L', // XLM-EURX
  'CCKOC2LJTPDBKDHTL3M5UO7HFZ2WFIHSOKCELMKQP3TLCIVUBKOQL4HB', // XLM-GBPX
  'CCUCE5H5CKW3S7JBESGCES6ZGDMWLNRY3HOFET3OH33MXZWKXNJTKSM3', // GBPX-USDC
]

async function tvl(api) {
  const results = await Promise.all(
    POOLS.map(async (pool) => {
      try {
        const { data } = await axios.get(`${STELLAR_EXPERT}/${pool}/value`)
        return data?.total > 0 ? data.total / 1e7 : 0
      } catch {
        return 0
      }
    })
  )
  results.forEach(v => { if (v > 0) api.addUSDValue(v) })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: `${methodologies.dexTVL}. Each pool's USD value is sourced from stellar.expert contract balance API. Pool list verified against the Phoenix factory on Soroban mainnet.`,
  stellar: { tvl },
}
