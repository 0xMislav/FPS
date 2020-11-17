String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}
$(document).ready(function() {
    init()
})
$(this).on('keypress', function(event) {
    keyPressed(event)
})

var gameWindow;

var sWidth = 500;
var sHeight = 250;
var sBuffer;

var pFOV = 3.14 / 4

var map = ""
var mapHeight = 32
var mapWidth = 32

var mapEditor = [];

var ceilFlootShade = "transparent"
var wallShade = "green"

var canvas;
var canvasCtx;

var ceilingColor = {
    r: 0,
    g: 255,
    b: 100
}

var wallColor = {
    r: 255,
    g: 100,
    b: 110
}

var floorColor = {
    r: 0,
    g: 132,
    b: 255
}

var textures = [
    function(y, wallDist, mul) {
        return {
            r: 120,
            b: 30,
            g: 200
        }
    },
    function(y, wallDist, mul) {
        return {
            r: 200,
            b: 150,
            g: 100
        }
    },
    function(y, wallDist, mul) {
        var ceil = (sHeight / 2) - (sHeight / wallDist)
        var floor = sHeight - ceil
        var wallHeight = floor - ceil

        var val = (255 * (y - ceil) / wallHeight)

        return {
            r: val * mul,
            b: 132 * mul,
            g: val * mul
        }
    }
]

function init() {
    gameWindow = $("#screen")

    canvas = document.getElementById("screen")
    canvasCtx = canvas.getContext("2d")

    map = map.concat("22222222222222222222222222222222")
    map = map.concat("1..............................1")
    map = map.concat("1..............................1")
    map = map.concat("1....................1.........1")
    map = map.concat("2....1...............2.........2")
    map = map.concat("1....1...............1.........1")
    map = map.concat("1....1...............2.........1")
    map = map.concat("1....1...............1.........1")
    map = map.concat("2....1...............2.........2")
    map = map.concat("1....1...............1.........1")
    map = map.concat("1....1...............2.........1")
    map = map.concat("1....1...............1.........1")
    map = map.concat("2....1...............2.........2")
    map = map.concat("1....1...............1.........1")
    map = map.concat("1....1...............2.........1")
    map = map.concat("1....12222222222222222.........1")
    map = map.concat("2..............................2")
    map = map.concat("1....22222222222222222.........1")
    map = map.concat("1....1...............1.........1")
    map = map.concat("1....1...............1.........1")
    map = map.concat("2....1...............1.........2")
    map = map.concat("1....1...............1.........1")
    map = map.concat("1....1...............1.........1")
    map = map.concat("1....1...............1.........1")
    map = map.concat("2....1...............1.........2")
    map = map.concat("1....1...............1.........1")
    map = map.concat("1....1...............1.........1")
    map = map.concat("1....1...............1.........1")
    map = map.concat("2....11111....11111111.........2")
    map = map.concat("1....................1.........1")
    map = map.concat("1....................1.........1")
    map = map.concat("12222222222222222222222222222221")

  


    for(var i =0; i < 32; i++) {
        var currentRow = ""
        for(var j =0; j < 32; j++) {
            currentRow = currentRow.concat(map.charAt((i * 32) + j))
        }
        mapEditor.push(currentRow)
    }

    for(var i = 0; i < mapEditor.length; i++) {
        //$("2minimap").append("<div>" + miniMap[i] + "</div>")
        var check = document.createElement("input")
        check.type = "check"
        var holder = document.getElementById("levelLayoutHolder")
        
    }

    setInterval(function() {
        sBuffer = initScreenBuffer()
        refreshScreenBuffer()
        gameLoop()
        drawScreen()
    }, 15)
}

function updateLevelPressed() {
    alert("here")
    map = ""
    mapEditor.forEach(elem => {
        map = map.concat(elem)
    })
}


function keyPressed(event) {
    if(event.key == "d") {
        player.angle += 0.1
    }
    if(event.key == "a") {
        player.angle -= 0.1
    }
    if(event.key == "w") {
        player.y = player.y + (Math.cos(player.angle) * 0.3)
        player.x = player.x + (Math.sin(player.angle) * 0.3)
    }
    if(event.key == "s") {
        player.y -= (Math.cos(player.angle) * 0.3)
        player.x -= (Math.sin(player.angle) * 0.3)
    }
}
var player = {
    x: 29,
    y: 10,
    angle: 0,
    fov: 3.14 / 4
}

var rayTraceTestDepth = mapHeight;

function gameLoop() {    
    drawSpace()
    drawCharacter()
}

function drawCharacter() {
    var halfWidth = sWidth / 2
    var playerWidth = sWidth / 10
    var playerHeight = sHeight / 3

    var pLeft = halfWidth - playerWidth
    var pRight = halfWidth + playerWidth
    var pTop = sHeight - playerHeight

    for(var x = pLeft; x < pRight; x++) {
        var spriteX = 0;
        for(var y = sHeight; y > pTop; y--) {
            var spriteY = 0;
            sBuffer[Math.floor(x)][Math.floor(y)] = {
                opacity: 1,
                color: {
                    r: 255,
                    g: (x / sWidth) * 255,
                    b: 0
                }
            }
            spriteY++;
        }
        spriteX++;
    }
}

function drawSpace() {
    for(var x = 0; x < sWidth; x++) {
        var rayAngle = (player.angle - (player.fov / 2)) + ((x / sWidth) * player.fov);

        var distanceToWall = 0;
        var hasHitWall = 0;

        var rayVect = {
            x: Math.sin(rayAngle),
            y: Math.cos(rayAngle)
        }

        while(hasHitWall == 0 && (distanceToWall < rayTraceTestDepth)) {
            distanceToWall += 0.1;

            var hitTest = {
                x: Math.floor(player.x + (rayVect.x * distanceToWall)),
                y: Math.floor(player.y + (rayVect.y * distanceToWall))
            }

            if(hitTest.x < 0 || hitTest.x >= mapWidth || hitTest.y < 0 || hitTest.y >= mapHeight) {
                hasHitWall = 1;
                distanceToWall = rayTraceTestDepth
            } else {
                var hitTestPosition = (hitTest.y * mapWidth) + hitTest.x
                var textureSelector = parseInt(map.charAt(hitTestPosition))
                if((textureSelector > 0) && (textureSelector < 10)) {
                    hasHitWall = textureSelector
                }
            }
        }

        var ceiling = (sHeight / 2) - (sHeight / (distanceToWall/2))
        var floor = sHeight - ceiling

        for(var y = 0; y < sHeight; y++) {
            
            if(y < ceiling) { 
                var darkenMultiplier = 1 - Math.sqrt(y / sHeight)   
                sBuffer[x][y] = {
                    opacity: 1,
                    color: {
                        r: ceilingColor.r * darkenMultiplier,
                        g: ceilingColor.g * darkenMultiplier,
                        b: ceilingColor.b * darkenMultiplier
                    }
                }
            }
            else if((y > ceiling) && (y < floor)) {
                var distanceDarkenMultiplier = Math.sqrt(1 - distanceToWall / mapHeight)
                sBuffer[x][y] = {
                    opacity: 1,
                    color: textures[hasHitWall](y, distanceToWall, distanceDarkenMultiplier)
                }   
            }
            else {
                var darkenMultiplier = (y - (sHeight / 2)) / (sHeight / 2)

                sBuffer[x][y] = {
                    color: {
                        r: floorColor.r * darkenMultiplier,
                        g: floorColor.g * darkenMultiplier,
                        b: floorColor.b * darkenMultiplier
                    },
                    opacity: 1
                }
            }
        }
    }
}

function initScreenBuffer() {
    var arr = new Array(sWidth)
    for (var i = 0; i < arr.length; i++) {
        arr[i] = new Array(sHeight);
      }
    return arr;
}
function refreshScreenBuffer() {
    for(var x = 0; x < sWidth; x++) {
        for(var y = 0; y < sHeight; y++) {
            sBuffer[x][y] = {
                color: "transparent",
                opacity: "0"
            }
        }
    }
}

// DRAW FUNCTIONS
function drawScreen() {
    var imgData = new ImageData(
        new Uint8ClampedArray(4 * sWidth * sHeight),
        sWidth,
        sHeight
    )
    for(var x = 0; x < sWidth; x++) {
        for(var y = 0; y < sHeight; y++) {
            var pixPos = (x + (y * sWidth)) * 4;
            imgData.data[pixPos] = sBuffer[x][y].color.r;
            imgData.data[pixPos + 1] = sBuffer[x][y].color.g;
            imgData.data[pixPos + 2] = sBuffer[x][y].color.b;
            imgData.data[pixPos + 3] = (sBuffer[x][y].opacity * 255);
        }
    }
    canvasCtx.putImageData(imgData, 0, 0)

}