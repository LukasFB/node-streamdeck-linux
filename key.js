const exec = require("child_process").exec
const PImage = require('pureimage')
const sharp = require('sharp')
const streamBuffers = require('stream-buffers')

class Key {

    constructor(config, deck, device, screen) {
        this.config = config
        this.deck = deck
        this.device = device
        this.screen = screen
        this.currentAction = null
        this.currentModifier = null
        this.currentMatchedTitle = null
        // initial draw
        this.bufferCache = null
        this.redraw(null)
    }

    async redraw(activeModifier, activeWindowTitle) {
        // use bufferCache cache if alread filled, draws much faster
        if (this.bufferCache !== null) {
            await this.device.fillImage(this.config.key, this.bufferCache)
        } else {
            // use top level config as baseline
            let currentConfig = this.config
            // if multiple configs are defined, filter out the one matching title + modifier
            if (Array.isArray(currentConfig.configs)) {
                currentConfig.configs.some(singleConfig => {
                    let titleRegex = new RegExp(singleConfig.window || ".*")
                    let modifier = singleConfig.modifier || null
                    if (titleRegex.test(activeWindowTitle) && modifier === activeModifier) {
                        currentConfig = singleConfig
                        return true;
                    }
                })
            }
            this.currentAction = currentConfig.action

            const lines = [currentConfig.label, activeModifier]

            // split labels that are too long for a single line an contain white space
            let splitLines = []
            lines.map(line => {
                if (line) {
                    if (line.length > 8 && line.indexOf(" ") > 0) {
                        splitLines = splitLines.concat(line.split(" "))
                    } else {
                        splitLines.push(line)
                    }
                }
            })

            const img = PImage.make(this.device.ICON_SIZE, this.device.ICON_SIZE, {})
            const ctx = img.getContext('2d')
            ctx.clearRect(0, 0, this.device.ICON_SIZE, this.device.ICON_SIZE)
            ctx.font = '16pt "Font"'
            ctx.USE_FONT_GLYPH_CACHING = false
            ctx.strokeStyle = 'black'
            ctx.lineWidth = 1
            ctx.fillStyle = '#ffffff'

            let y = 30
            const lineHeight = 20
            const totalWidth = 70

            // render each label line
            splitLines.map(text => {
                // measure text width and adjust x to center each line
                const textWidth = ctx.measureText(text).width
                let x = (totalWidth - textWidth) / 2
                ctx.strokeText(text, x, y)
                ctx.fillText(text, x, y)
                y += lineHeight
            })

            const writableStreamBuffer = new streamBuffers.WritableStreamBuffer({
                initialSize: 20736, // Start at what should be the exact size we need
                incrementAmount: 1024 // Grow by 1 kilobyte each time bufferCache overflows.
            })

            try {
                await PImage.encodePNGToStream(img, writableStreamBuffer)
                const background = Buffer.alloc(20736, 0xff000000)
                const options = {
                    create: {
                        width: this.device.ICON_SIZE,
                        height: this.device.ICON_SIZE,
                        channels: 3,
                        background: "#000022"
                    }
                }
                let pngBuffer = await sharp(background, options)
                    .resize(this.device.ICON_SIZE, this.device.ICON_SIZE)
                    .composite([{input: writableStreamBuffer.getContents()}])
                    .png()
                    .toBuffer()
                const finalBuffer = await sharp(pngBuffer)
                    .flatten()
                    .raw()
                    .toBuffer()
                this.bufferCache = finalBuffer
                await this.device.fillImage(this.config.key, finalBuffer)
            } catch (error) {
                console.error(error)
            }
        }
    }

    handlePress() {
        if (this.currentAction === undefined) {
            console.log("no action for key "+this.config.key)
        } else {
            // execute main action
            switch (this.currentAction.substring(0, 3)) {
                // send key via xdotool
                case "exe":
                    exec(this.currentAction.replace("exec:", ""))
                    break
                case "xdk":
                    exec("xdotool key --delay 50 " + this.currentAction.replace("xdk:", ""))
                    break
                case "xdo":
                    exec("xdotool "+this.currentAction.replace("xdo:", ""))
                    break;
                case "log":
                    console.log(this.currentAction.replace("log:", ""))
                    break
                // open new folder / screen
                case "fol":
                    const folderConfig = this.config.folder
                    this.deck.pushScreen(folderConfig)
                    //console.log("folder", folderConfig)
                    break
                // go back to previous folder / screen
                case "bac":
                    this.deck.popScreen()
                    break
                default:
                    console.log("unknown string based action: " + this.currentAction)
            }
        }
        // execute post actions
        if (this.screen.getIsAutoBack() && this.currentAction !== "back") this.deck.popScreen()
    }

}

module.exports = Key