const { openStreamDeck } = require('elgato-stream-deck')
const Screen = require("./screen.js")
//const ioHook = require('iohook');
const ConfigCache = require("./configcache")

class Deck {


    constructor(config) {
        this.device = openStreamDeck()
        this.device.clearAllKeys()
        this.config = config
        this.screenStack = []
        this.configCache = new ConfigCache(this, this.device)

        this.device.on('down', keyIndex => {
        })

        this.device.on('up', keyIndex => {
            this.handleKeyPress(keyIndex)
            //console.log('key %d up', keyIndex)
        })

        this.device.on('error', error => {
            console.error(error)
        })

        /*
        ioHook.on("keyup", event => {
            this.setModifier(null)
        })
        ioHook.on("keydown", event => {
            // only respond to raw modifier events, not any other keys to reduce redraws
            if (event.rawcode > 65000) {
                if (event.altKey) {
                    this.setModifier("alt")
                }
                if (event.shiftKey) {
                    this.setModifier("shift")
                }
                if (event.ctrlKey) {
                    this.setModifier("ctrl")
                }
            }
        });
        ioHook.start(false)
        */
    }

    getIsActiveScreen(screen) {
        return this.getCurrentScreen() === screen
    }

    getCurrentScreen() {
        return this.screenStack[this.screenStack.length-1]
    }

    setModifier(modifier) {
        this.getCurrentScreen().setModifier(modifier)
    }

    handleKeyPress(index) {
       this.getCurrentScreen().handleKeyPress(index)
    }

    pushScreen(config) {
        const screen = this.configCache.getScreenForConfig(config)
        screen.redrawKeys()
        this.screenStack.push(screen)
    }

    popScreen() {
        this.screenStack.pop()
        const newLastScreen = this.screenStack[this.screenStack.length-1]
        newLastScreen.redrawKeys()
    }

}

module.exports = Deck