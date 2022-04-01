import React, { useState } from 'react';
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import {Contract} from "@ethersproject/contracts";
import { ethers } from "ethers";
import { parseEther}from "@ethersproject/units"
import { formatEther}from "@ethersproject/units"
import {VAULTS} from "abi/VAULTS"
import {FARMS} from "abi/FARMS"
import {WFTM_ABI} from "abi/WFTM_ABI"
import {TOMBVAULTS} from "abi/TOMBVAULTS"
import {LP_ABI} from "abi/LP_ABI"

async function TVL(){
  const { account, active, library} = useWeb3React<Web3Provider>()
  const [tvl,setTvl] = useState<string>("")

  const fetchData = async () => {
    if(!(active && account && library)) return

    const ftmvault_address = '0x344231DC9ea535Fd11ccCedC3567E614563c21B4'
    const tombvault_address = '0xd5B7Ee6628d478a494a73c00EbbC0f7A3C2fF86D'
    const avaxvault_address = '0x26afcBA425Ea975FD1B9304B0B30D54b5A493392'
    const ethvault_address = '0xEF66d9E6A4326a720488EEea5046b8923485B6FA'
    const farms_address = '0xE44D075C8F993Ac5Da7bdeF9046785B6686776ce'

    //USDC
    const addressCollateral = "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E"
    //WFTM
    const addressWFTM = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"
    const addressAVAXFTMLP = "0x5DF809e410d9CC577f0d01b4E623C567C7aD56c1"
    const addressTOMBFTMLP = "0x2a651563c9d3af67ae0388a5c8f89b867038089e"
    //FTMDAI
    const addressFTMUSDCLP = "0xe120ffBDA0d14f3Bb6d6053E90E63c572A66a428"
    //AVAX
    const addressAvax = "0x511D35c52a3C244E7b8bd92c0C297755FbD89212"
    //TOMB
    const addressTomb = "0x6c021Ae822BEa943b2E66552bDe1D2696a53fbB7"

    //address of the contract requesting approval (DAI-STAKE1 LP)
    const daistake1_address = '0xb2f9Aa6DC86Bf22AF317b39F2675B794e2BF4b32'

    //address of the contract requesting approval (FTM-STAKE1 LP)
    const ftmstake1_address = '0xb485E403BfEe11BD347564684170a559C71D4ec0'

    const ftmvault = new ethers.Contract(ftmvault_address, VAULTS, library.getSigner());
    const avaxvault = new ethers.Contract(avaxvault_address, TOMBVAULTS, library.getSigner());
    const tombvault = new ethers.Contract(tombvault_address, TOMBVAULTS, library.getSigner());
    const ethvault = new ethers.Contract(ethvault_address, VAULTS, library.getSigner());
    const farms = new ethers.Contract(farms_address, FARMS, library.getSigner());
    
    const ftm_staked = await ftmvault.see_s1ftm_circ()
    const ftm_price = await ftmvault.getLatestPrice()
    const ftm_tvl = ftm_price*ftm_staked

    const eth_staked = await ethvault.see_s1ftm_circ()
    const eth_price = await ethvault.getLatestPrice()
    const eth_tvl = eth_price*eth_staked

    const dai = new ethers.Contract(addressCollateral, WFTM_ABI, library.getSigner());

    const dai_in_ftmvault = await dai.balanceOf(ftmvault_address)
    const dai_in_ethvault = await dai.balanceOf(ethvault_address)
    const dai_in_avaxvault = await dai.balanceOf(avaxvault_address)
    const dai_in_tombvault = await dai.balanceOf(tombvault_address)

    const dai_in_ftmvault_formatted = formatEther(dai_in_ftmvault)
    const dai_in_ethvault_formatted = formatEther(dai_in_ethvault)
    const dai_in_avaxvault_formatted = formatEther(dai_in_avaxvault)
    const dai_in_tombvault_formatted = formatEther(dai_in_tombvault)

    //get avax price

    const avax = new ethers.Contract(addressAvax, WFTM_ABI, library.getSigner());

    const ftmusdclp = new ethers.Contract(addressFTMUSDCLP, WFTM_ABI, library.getSigner());
    const avaxftmlp = new ethers.Contract(addressAVAXFTMLP, WFTM_ABI, library.getSigner());
    const wftm = new ethers.Contract(addressWFTM, WFTM_ABI, library.getSigner());
    const usdc = new ethers.Contract(addressCollateral, WFTM_ABI, library.getSigner());

    const usdc_in_ftmusdc = await usdc.balanceOf(addressFTMUSDCLP)
    const ftm_in_ftmusdc = await wftm.balanceOf(addressFTMUSDCLP)
    const ftm_in_avaxftm = await wftm.balanceOf(addressAVAXFTMLP)
    const avax_in_avaxftm = await avax.balanceOf(addressAVAXFTMLP)

    const wftm_price = (Number(usdc_in_ftmusdc)/Number(ftm_in_ftmusdc))
    const avax_price = ((Number(ftm_in_avaxftm)/Number(avax_in_avaxftm))*wftm_price).toFixed(4)

    const avax_staked = await avaxvault.see_s1tomb_circ()
    const s1avaxcirc2 = formatEther(avax_staked)
    const s1avaxcirc3 = Number(s1avaxcirc2).toFixed(2)
    const avax_tvl = Number(s1avaxcirc3)*Number(avax_price)

    //get tomb price

    const tomb = new ethers.Contract(addressTomb, WFTM_ABI, library.getSigner());
    const tombftmlp = new ethers.Contract(addressTOMBFTMLP, WFTM_ABI, library.getSigner());

    const ftm_in_tombftm = await wftm.balanceOf(addressTOMBFTMLP)
    const tomb_in_tombftm = await tomb.balanceOf(addressTOMBFTMLP)

    const tomb_price = ((Number(ftm_in_tombftm)/Number(tomb_in_tombftm))*wftm_price).toFixed(4)

    const tomb_staked = await tombvault.see_s1tomb_circ()
    const s1tombcirc2 = formatEther(tomb_staked)
    const s1tombcirc3 = Number(s1tombcirc2).toFixed(2)
    const tomb_tvl = Number(s1tombcirc3)*Number(tomb_price)

    //LPs TVL
    //STAKE1-DAI
    const token_deposited = new ethers.Contract(daistake1_address, LP_ABI, library.getSigner());

    const native_in_lp = await farms.see_native_in_native_stable_lp()
    const usdc_in_lp = await farms.see_usdc_in_native_stable_lp()
    const token_price = usdc_in_lp/native_in_lp

    const lp_ftm_price_num = await farms.see_native_in_native_stable_lp()
    const lp_ftm_price_den = await farms.see_native_stable_lp_supply()
    const lp_ftm_price = 2*lp_ftm_price_num*token_price/lp_ftm_price_den

    const lpstaked = await token_deposited.balanceOf(farms_address)
    const lpstaked_format = Number(formatEther(lpstaked)).toFixed(2);

    const stake1daitvl = Number(lpstaked_format)*Number(lp_ftm_price)

    //STAKE1-FTM

    const token_deposited2 = new ethers.Contract(ftmstake1_address, LP_ABI, library.getSigner());

    const lp_price_num = await farms.see_native_in_native_stable_lp()
    const lp_price_den = await farms.see_native_stable_lp_supply()
    const lp_price = 2*lp_price_num*token_price/lp_price_den

    const ftmlpstaked = await token_deposited2.balanceOf(farms_address)
    const ftmlpstaked_format = Number(formatEther(ftmlpstaked)).toFixed(2);

    const stake1ftmtvl = Number(ftmlpstaked_format)*Number(lp_price)

    const totaltvl = ((+ftm_tvl + +eth_tvl)/(100000000*1000000000000000000)) + +avax_tvl + +tomb_tvl +stake1daitvl + +stake1ftmtvl + +Number(dai_in_ftmvault_formatted) + +Number(dai_in_ethvault_formatted) + +Number(dai_in_avaxvault_formatted) + +Number(dai_in_tombvault_formatted);

    return totaltvl
  }

module.exports={
    fantom:{
        tvl
    }
}

