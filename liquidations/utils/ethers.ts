import { providers } from "@defillama/sdk/build/general";
import { Contract, Event, EventFilter } from "ethers";
import { ethers } from "ethers";

const queryEvents = async (
  contract: Contract,
  event: EventFilter,
  startBlock = 0,
  endBlock: ethers.providers.BlockTag = "latest"
) => {
  let allEvents: Event[] = [];
  let __endBlock = (await contract.provider.getBlock(endBlock)).number;

  for (let i = startBlock; i < __endBlock; i += 5000) {
    const _startBlock = i;
    const _endBlock = Math.min(__endBlock, i + 4999);
    const events = await contract.queryFilter(event, _startBlock, _endBlock);
    allEvents = [...allEvents, ...events];
    console.log(`${allEvents.length} events found at block ${_endBlock}`);
  }
  return allEvents;
};

export { providers, queryEvents };
