const button = document.getElementById("play-btn");
const cpicker = document.getElementById("color-picker");
const vpicker = document.getElementById("value-picker");
const color = document.getElementById("game");
var playing;

window.onload = () => {
    playing = false
    button.addEventListener("click", play, false);
    updateVPicker(0);
    updateCanvasDim();
    window.addEventListener("resize", updateCanvasDim, false);
    pickerVisible(false);
}

function updateCanvasDim () { 
    // Updates the dimension of the canvases and redraws them
    var rect = cpicker.getBoundingClientRect();
    cpicker.width = rect.width;
    cpicker.height = rect.height;
    var rect = vpicker.getBoundingClientRect();
    vpicker.width = rect.width;
    vpicker.height = rect.height;
    drawColorPicker();
    updateVPicker(0);
}

function moveColorSelector (x) {
    // Moves the selector indicator to a position
    const cselector = document.getElementById("color-selector");
    cselector.style.left = x + "px";
}

function moveValueSelector (x, y) {
    // Moves the selector indicator to a position
    const vselector = document.getElementById("value-selector");
    vselector.style.left = x + "px";
    vselector.style.top = y + "px";
}

function drawColorPicker () {
    // Draws the color picker's background
    const ctx = cpicker.getContext("2d");
    const maxx = cpicker.width;
    const maxy = cpicker.height;
    const dx = (360 / maxx).toFixed(4);
    for (let y = 0; y < maxy; y++) {
        for (let x = 0; x < maxx; x++) {
            ctx.fillStyle = `hsl(${dx*x},100%,50%)`;
            ctx.fillRect(x, y, 1, 1);
        }
    }
    return dx;
}

function updateVPicker (col) {
    // Draws the value/saturation picker's background
    const vctx = vpicker.getContext("2d");
    const maxx = vpicker.width;
    const maxy = vpicker.height;
    const dx = (100 / maxx).toFixed(4);
    const dy = (100 / maxy).toFixed(4);
    for (let y = 0; y < maxy; y++) {
        for (let x = 0; x < maxx; x++) {
            vctx.fillStyle = `hsl(${col},${dx*x}%,${dy*(maxy-y)}%)`;
            vctx.fillRect(x, y, 1, 1);
        }
    }
    return [dx, dy];
}

function pickerVisible (visible) {
    // Hides or shows color pickers
    const c_container = document.getElementById("cpicker-container");
    const v_container = document.getElementById("vpicker-container");
    if (visible) { 
        c_container.style.opacity = 100;
        c_container.disabled = true;
        v_container.style.opacity = 100;
        v_container.disabled = true;
    } else {
        c_container.style.opacity = 0;
        c_container.disabled = false;
        v_container.style.opacity = 0;
        v_container.disabled = false;
    }
}

const play = () => {
    // Don't play twice
    if (playing) return;
    playing = true;

    // Resets colors and disables title and play button
    button.style.opacity = 0;
    button.disabled = true;
    const title = document.getElementById("title");
    color.style.background = "";
    color.style.backgroundColor = "hsl(211,79%,50%)";
    pickerVisible(false);

    // Play start countdown
    const container = document.getElementById("count");
    let i = 5;
    let countdown = setInterval(() => {
        title.innerText = i;
        if (i - 1) {
            i--;
        } else {
            clearInterval(countdown);
        }
    }, 1000);

    // Wait for countdown to finish
    setTimeout(() => {
        container.innerHTML = "<h1>Guess the color</h1>";

        // Create and show random color
        let h = (Math.random() * 360).toFixed(2);
        let s = (Math.random() * 100).toFixed(2);
        let l = (Math.random() * 100).toFixed(2);  
        color.style.backgroundColor = `hsl(${h} ${s}% ${l}%)`;

        // Reset pickers
        pickerVisible(true);
        const color_dx = drawColorPicker();
        const [v_dx, v_dy] = updateVPicker(0);
        moveColorSelector(0);
        moveValueSelector(0, 0);

        // Let user choose it's color guess
        var userH = 0;
        var userS = 0;
        var userL = 100;

        let cHandler = (e) => {
            moveColorSelector(e.layerX);
            userH = color_dx * e.layerX;
            updateVPicker(userH);
        };
        
        let vHandler = (e) => {
            userS = v_dx * e.layerX;
            userL = 100 - (v_dy * e.layerY);
            moveValueSelector(e.layerX, e.layerY);
        };
        
        cpicker.addEventListener("mousedown", cHandler, true);
        vpicker.addEventListener("mousedown", vHandler, true);        

        // Countdown while the user picks
        let i = 10;
        let countdown = setInterval(() => {
            title.innerText = i;
            if (i - 1) {
                i--;
            } else {
                clearInterval(countdown);
            }
        }, 1000);

        setTimeout(() => {
            // Removes color picker listeners
            cpicker.removeEventListener("mousedown", cHandler, true);
            vpicker.removeEventListener("mousedown", vHandler, true);

            // Calculates score
            const correctH = (1 - Math.abs(userH - h)/360) * 100;
            const correctS = 100 - Math.abs(userS - s);
            const correctL = 100 - Math.abs(userL - l);
            console.log("HSL individual percentages: ", correctH, correctS, correctL);
            const score = (correctH + correctS + correctL) / 3;

            // Displays score
            color.style.background = `linear-gradient(90deg, hsl(${h} ${s}% ${l}%) 49.8%, hsl(${Math.round(userH)} ${Math.round(userS)}% ${Math.round(userL)}%) 50.2%)`;
            title.innerText = `Score: ${score.toFixed(2)}%`;

            // Resets text and play button
            button.style.opacity = 100;
            button.disabled = false;
            button.innerText = "Play agian?";
            container.innerHTML = "";
            playing = false;
        }, 10000);
    }, 5000);
}