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
    const cselector = document.getElementById("color-selector");
    cselector.style.left = x + "px";
}

function moveValueSelector (x, y) {
    const vselector = document.getElementById("value-selector");
    vselector.style.left = x + "px";
    vselector.style.top = y + "px";
}

function drawColorPicker () {
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
    // Remove color pickers
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
    // Remove title & play button
    if (playing) return;
    playing = true;
    button.style.opacity = 0;
    button.disabled = true;
    const title = document.getElementById("title");
    color.style.background = "";
    color.style.backgroundColor = "hsl(211,79%,50%)";
    pickerVisible(false);

    // Play countdown
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

    setTimeout(() => {
        container.innerHTML = "<h1>Guess the color</h1>";

        // Show random color
        let h = (Math.random() * 360).toFixed(2);
        let s = (Math.random() * 100).toFixed(2);
        let l = (Math.random() * 100).toFixed(2);  
        color.style.backgroundColor = `hsl(${h} ${s}% ${l}%)`;

        pickerVisible(true);

        // Reset pickers
        const color_dx = drawColorPicker();
        const [v_dx, v_dy] = updateVPicker(0);
        moveColorSelector(0);
        moveValueSelector(0, 0);

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
            cpicker.removeEventListener("mousedown", cHandler, true);
            vpicker.removeEventListener("mousedown", vHandler, true);
            const correctH = (1 - Math.abs(userH - h)/360) * 100;
            const correctS = 100 - Math.abs(userS - s);
            const correctL = 100 - Math.abs(userL - l);
            console.log("HSL individual percentages: ", correctH, correctS, correctL);
            const score = (correctH + correctS + correctL) / 3;
            color.style.background = `linear-gradient(90deg, hsl(${h} ${s}% ${l}%) 49.8%, hsl(${Math.round(userH)} ${Math.round(userS)}% ${Math.round(userL)}%) 50.2%)`;
            title.innerText = `Score: ${score.toFixed(2)}%`;
            button.style.opacity = 100;
            button.disabled = false;
            button.innerText = "Play agian?";
            container.innerHTML = "";
            playing = false;
        }, 10000);
    }, 5000);
}