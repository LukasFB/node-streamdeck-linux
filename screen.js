const exec = require("child_process").exec
const PImage = require('pureimage')
const Key = require("./key")
const path = require("path")
const x11 = require('x11');

class Screen {

    constructor(config, deck, device) {
        this.config = config
        this.deck = deck
        this.device = device
        this.modifier = null
        this.activeWindowTitle = null
        this.keys = []
        this.font = PImage.registerFont(path.resolve(__dirname, 'fixtures/NotoSans-Bold.ttf'), 'Font')
        this.font.load(() => {
            // create and initially draw all keys after the font has been loaded
            this.config.elements.map(keyConfig => {
                this.keys.push(new Key(keyConfig, this.deck, this.device, this))
            })
        })

        const _this = this
        x11.createClient(function(err, display) {
            const X = display.client;
            const root = display.screen[0].root;
            X.ChangeWindowAttributes(root, { eventMask: 0x00400000 });
            X.on('event', function(ev) {
                // no need to update anything else than the current screen
                if (!_this.deck.getIsActiveScreen(this)) return
                //console.log(ev);
                exec("xdotool getactivewindow getwindowname",
                    function(error, stdout, stderr){
                        _this.setActiveWindow(stdout)
                    }
                )
            });
        });
    }

    getIsAutoBack() {
        return (this.config.settings && this.config.settings.autoback)
    }

    setActiveWindow(title) {
        if (title !== this.activeWindowTitle) {
            this.activeWindowTitle = title
            this.redrawKeys()
        }
    }

    setModifier(modifier) {
        if (modifier !== this.modifier) {
            this.modifier = modifier
            this.redrawKeys()
        }
    }

    redrawKeys() {
        this.device.clearAllKeys()
        this.keys.map(key => key.redraw(this.modifier, this.activeWindowTitle))
    }

    handleKeyPress(index) {
        this.keys.map(key => {
            if (key.config.key === index) {
                key.handlePress()
            }
        })
    }

}

module.exports = Screen