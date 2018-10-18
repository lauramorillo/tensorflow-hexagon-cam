/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import * as tf from '@tensorflow/tfjs';
import { start } from 'repl';
import Hexagon from './Hexagon';

const CONTROLS = ['left', 'right', 'none'];
const CONTROL_CODES = [37, 39, 0];

export function init() {
  document.getElementById('controller').style.display = '';
  statusElement.style.display = 'none';
}

const trainStatusElement = document.getElementById('train-status');

// Set hyper params from UI values.
const learningRateElement = document.getElementById('learningRate');
export const getLearningRate = () => +learningRateElement.value;

const batchSizeFractionElement = document.getElementById('batchSizeFraction');
export const getBatchSizeFraction = () => +batchSizeFractionElement.value;

const epochsElement = document.getElementById('epochs');
export const getEpochs = () => +epochsElement.value;

const denseUnitsElement = document.getElementById('dense-units');
export const getDenseUnits = () => +denseUnitsElement.value;
const statusElement = document.getElementById('status');

const _canvas = document.getElementById('hexagon');

const hexagon = new Hexagon({
    canvas: _canvas,
    config: "http://schlipak.github.io/Hexagon.js/demo/vhs.json",
    ending: "http://schlipak.github.io/Hexagon.js/demo/static.json"
  });

let loaded = false;

function getEvent(key) {
  var e = new Event("keydown");
  e.keyCode=key;
  e.altKey=false;
  e.ctrlKey=false;
  e.shiftKey=false;
  e.metaKey=false;
  return e;
}

function moveCursor(key) {
  const e = getEvent(key);
  hexagon.moveCursor(e);
}

function stopCursor() {
  const e = getEvent(0);
  hexagon.stopCursor(e);
}

export function startHexagon() {
  if (!loaded) {
    loaded = true;
    hexagon.play();
  }
}

export function predictClass(classId) {
  const key = CONTROL_CODES[classId];
  if (key !== 0) {
    moveCursor(CONTROL_CODES[classId]);
  } else {
    stopCursor()
  }
  document.body.setAttribute('data-active', CONTROLS[classId]);
}

export function isPredicting() {
  statusElement.style.visibility = 'visible';
}
export function donePredicting() {
  statusElement.style.visibility = 'hidden';
}
export function trainStatus(status) {
  trainStatusElement.innerText = status;
}

export let addExampleHandler;
export function setExampleHandler(handler) {
  addExampleHandler = handler;
}
let mouseDown = false;
const totals = [0, 0, 0, 0];

const noneButton = document.getElementById('none');
const leftButton = document.getElementById('left');
const rightButton = document.getElementById('right');

const thumbDisplayed = {};

async function handler(label) {
  mouseDown = true;
  const className = CONTROLS[label];
  const button = document.getElementById(className);
  const total = document.getElementById(className + '-total');
  while (mouseDown) {
    addExampleHandler(label);
    document.body.setAttribute('data-active', CONTROLS[label]);
    total.innerText = totals[label]++;
    await tf.nextFrame();
  }
  document.body.removeAttribute('data-active');
}

noneButton.addEventListener('mousedown', () => handler(2));
noneButton.addEventListener('mouseup', () => mouseDown = false);

leftButton.addEventListener('mousedown', () => handler(0));
leftButton.addEventListener('mouseup', () => mouseDown = false);

rightButton.addEventListener('mousedown', () => handler(1));
rightButton.addEventListener('mouseup', () => mouseDown = false);

export function drawThumb(img, label) {
  if (thumbDisplayed[label] == null) {
    const thumbCanvas = document.getElementById(CONTROLS[label] + '-thumb');
    draw(img, thumbCanvas);
  }
}

export function draw(image, canvas) {
  const [width, height] = [224, 224];
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(width, height);
  const data = image.dataSync();
  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    imageData.data[j + 0] = (data[i * 3 + 0] + 1) * 127;
    imageData.data[j + 1] = (data[i * 3 + 1] + 1) * 127;
    imageData.data[j + 2] = (data[i * 3 + 2] + 1) * 127;
    imageData.data[j + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}
