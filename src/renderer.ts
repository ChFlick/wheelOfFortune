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

(function resizeCanvas() {
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    if (canvas) {
        canvas.width = window.innerHeight - 100;
        canvas.height = window.innerHeight - 100;
    }
})()

function rand(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

const file = fs.readFileSync(path.resolve('./data.csv'));
const csv = file.toString();

const cols = csv.split('\n')[0].split(',');
const valuesByCol: { [colName: string]: string[] } = {};
cols.forEach((col, i) => {
    valuesByCol[col] = csv.split('\n').slice(1).map(row => row.split(',')[i]);
});

console.log(valuesByCol);


var color = ['#fbc', '#f88', '#fbc', '#f88', '#fbc', '#f88', "#fbc", "#f67"];
var label = ['A', 'B', 'C', 'D', 'E', 'F', 'G', "H"];
const slices = color.length;
const sliceDeg = 360 / slices;
let deg = rand(0, 360);
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
    ctx.textAlign = "right";
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
        drawSlice(deg, color[i]);
        drawText(deg + sliceDeg / 2, label[i]);
        deg += sliceDeg;
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
            if (speed < 1) {
                slowDownRand = rand(0.996, 0.998);
            }
        }
        speed = speed > 0.2 ? speed *= slowDownRand : 0;
    }
    // Stopped!
    if (lock && !speed) {
        let ai = Math.floor(((360 - deg - 90) % 360) / sliceDeg); // deg 2 Array Index
        ai = (slices + ai) % slices; // Fix negative index
        return alert("You got:\n" + label[ai]); // Get Array Item from end Degree
    }

    drawImg();
    window.requestAnimationFrame(anim);
};

const wheel = document.getElementById("wheel");
if (wheel) {
    wheel.addEventListener("mousedown", function () {
        speed = 30;
        isStopped = true;
        slowDownRand = rand(0.992, 0.995);
        anim();
    }, false);
}

Mousetrap.bind('space', () => {
    speed = 30;
    isStopped = true;
    slowDownRand = rand(0.992, 0.995);
    anim();
});

drawImg();
