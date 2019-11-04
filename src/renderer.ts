/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import * as Mousetrap from 'mousetrap';
import fs from 'fs';
import path from 'path';
import { Howl } from 'howler';

(function resizeCanvas() {
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    if (canvas) {
        canvas.width = window.innerHeight - 100;
        canvas.height = window.innerHeight - 100;
    }
})()

const tickingSound = new Howl({
    src: [require('../resources/tick.mp3')],
});
const tadaSound = new Howl({
    src: [require('../resources/tada.wav')],
});

const winnerElement = <HTMLDivElement>document.getElementById('winner');
const winnerText = <HTMLParagraphElement>document.getElementById('winner-text');

function win(name: string) {
    console.log(data);
    data = data.filter(d => d[categories[currentCategory]] === name);
    console.log(data);
    winnerText.innerText = name;
    winnerElement.className = '';

    const onClick = () => {
        if (currentCategory - 1 !== categories.length) {
            currentCategory++;
            winnerElement.className = 'invisible';
            startWheel();
        }
        winnerElement.removeEventListener('click', onClick);
    };
    winnerElement.addEventListener('click', onClick);
}

function rand(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

const categories = ['bundesland', 'stadt', 'name'];
const categoryDisplayNames = ['Bundesland', 'Stadt/Kreis/Landkreis', 'Person'];
let currentCategory = 0;

const csv = fs.readFileSync(path.resolve('./data.csv')).toString();;
const rows = csv.split('\n').filter(r => r.trim() !== '');
const colNames = rows[0].split(/,|;/);

let data = rows.slice(1).map(row => {
    const entry: { [colName: string]: string } = {};
    colNames.forEach((col, i) => {
        entry[col] = row.split(/,|;/)[i];
    });
    return entry;
});

startWheel();

function startWheel() {
    const values = [...new Set(data.map(d => d[categories[currentCategory]]))];
    const colors = ['#006FB2', '#B9E0F3', '#008655', '#FFB836', '#E83238'];
    const slices = values.length;
    const sliceDeg = 360 / slices;
    let deg = rand(0, 360);
    let lastTickedSlice = 0;
    let speed = 0;
    let slowDownRand = 0;
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width; // size
    const center = width / 2;      // center
    let isStopped = false;

    function deg2rad(deg: number) {
        return deg * Math.PI / 180;
    }

    function drawSlice(deg: number, color: string) {
        if (!ctx) {
            return;
        }
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(center, center);
        ctx.arc(center, center, width / 2, deg2rad(deg), deg2rad(deg + sliceDeg));
        ctx.lineTo(center, center);
        ctx.fill();
    }

    function drawText(deg: number, text: string) {
        if (!ctx) {
            return;
        }
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(deg2rad(deg));
        ctx.textAlign = "left";
        ctx.fillStyle = "#fff";
        ctx.font = 'bold 30px sans-serif';
        ctx.fillText(text, 130, 10);
        ctx.restore();
    }

    function drawImg() {
        if (!ctx) {
            return;
        }
        ctx.clearRect(0, 0, width, width);
        for (let i = 0; i < slices; i++) {
            drawSlice(deg, colors[i % colors.length]);
            drawText(deg + sliceDeg / 2, values[i]);
            deg += sliceDeg;
        }
        deg %= 360;
    }

    function sliceAtDeg(deg: number, slices: number) {
        let ai = Math.floor(((360 - deg - 90) % 360) / sliceDeg); // deg 2 Array Index
        ai = (slices + ai) % slices; // Fix negative index
        return ai;
    }

    function tickSound(deg: number, slices: number) {
        const currentSlice = sliceAtDeg(deg, slices);

        if (currentSlice !== lastTickedSlice) {
            tickingSound.play();
            lastTickedSlice = currentSlice;
        }
    }

    function anim() {
        deg += speed;
        deg %= 360;

        // Decrement Speed
        let lock = false;
        if (isStopped) {
            if (!lock) {
                lock = true;
                if (speed < 1 && speed > 0.2) {
                    slowDownRand = rand(0.997, 0.998);
                }
            }

            speed = speed > 0.15 ? speed *= slowDownRand : 0;
        }
        // Stopped!
        if (lock && !speed) {
            const currentSlice = sliceAtDeg(deg, slices);
            tadaSound.play();
            win(values[currentSlice]);
            return;
        }

        drawImg();
        tickSound(deg, slices);
        window.requestAnimationFrame(anim);
    };

    const wheel = document.getElementById("wheel");
    const startTurning = () => {
        speed = 7;
        isStopped = true;
        slowDownRand = rand(0.994, 0.995);
        anim();
    }

    if (wheel) {
        wheel.addEventListener("mousedown", function () {
            if (!isStopped) {
                startTurning();
            }
        }, false);
    }

    Mousetrap.bind('space', () => {
        if (!isStopped) {
            startTurning();
        }
    });

    drawImg();

};