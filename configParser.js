const fs = require("fs")
const path = require("path")

module.exports = getConfig = () => {

    const lineToObj = line => {
        let parts = line.match(/(?:\w+|\"(\\"|[^"])*\")/g)
        parts = parts.map(part => part.replace(/^"+|"+$/g, ""))
        const obj = {
            key: parseInt(parts[0]),
            label: parts[1].replace('"', ''),
            action: parts[2].replace('"', ''),
        }
        if (parts[3] === "autoback") obj.autoback = true
        return obj
    }

    const nestLines = lines => {
        const nested = {
            elements: []
        }
        let lastLine = null
        let skipSublines = true
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            if (line.substring(0,1) !== "-") {
                lastLine = lineToObj(line)
                nested.elements.push(lastLine)
                skipSublines = false
            } else {
                if (skipSublines === true) continue
                skipSublines = true
                const folderItems = [{
                    key: 0,
                    label: "/\\",
                    action: "back"
                }]
                for (let k = i; k<lines.length; k++) {
                    const currentChildLine = lines[k]
                    if (currentChildLine.substring(0,1) === "-") {
                        // add nested items to folder
                        folderItems.push(lineToObj(currentChildLine.substring(2)))
                    } else {
                        // exit folder as soon as a not nested line is found
                        break
                    }
                }
                lastLine.folder = {
                    settings: {
                        autoback: lastLine.autoback
                    },
                    elements: folderItems
                }
            }
        }
        return nested
    }

    const configPath = path.join(__dirname, "config.txt")
    let lines = fs.readFileSync(configPath).toString().split("\n")
    // remove empty lines
    lines = lines.filter(line => line.length > 0)
    const config = nestLines(lines)
    //console.log(config)
    return config
}