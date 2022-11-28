"use strict"

class ScraperLightBlock {
	// @return URL for the site that we'll scrape
    URL() {
    	return "https://lightblock.me/lightning-network-stats";
    }

    // @return scraped BTC amount as string
    scrape(parsedHTML) {     
        // find the tab for network capacity   
        let networkCapacityTabNode = parsedHTML.querySelector("#total-live-network-capacity");
        // grab the tab's child index 1 text and trim it
        let capacity = networkCapacityTabNode.childNodes[1].text.trim();
        // strip out trailing BTC
        let delimiter = " BTC";
        let delimeterIndex = capacity.indexOf(delimiter);
        let amount = capacity.substring(0, delimeterIndex);

        return amount;
    }
};

module.exports = ScraperLightBlock;