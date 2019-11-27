const Deck = require("./deck")
const fs = require("fs")
const getConfig = require("./configParser")

const config = getConfig()

const deck = new Deck()
deck.pushScreen(config)
