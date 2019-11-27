const Screen = require("./screen")
const md5 = require("md5")

class configcache {

    constructor (deck, device) {
        this.deck = deck
        this.device = device
        this.hashTable = {}
    }

    getScreenForConfig(config) {
        const hash = md5(JSON.stringify(config))
        if (!this.hashTable.hasOwnProperty(hash)) {
            //console.log("writing cache")
            this.hashTable[hash] = new Screen(config, this.deck, this.device)
        }
        //console.log("reading cache", Object.keys(this.hashTable))
        return this.hashTable[hash]
    }

}

module.exports = configcache