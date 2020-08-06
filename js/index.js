import { CUBE_STATE } from './cubeState.js';

var canvasDiv, canvasDivStyle;
var TH_HEIGHT, TH_WIDTH;

var scene, camera, renderer;
var light;

var cubeGeometry, cubeMaterial, cubeBorderGeometry ,cube, cubeBorder;
var cubeArray = [];
var cubeBorderArray = [];
var cubeState = CUBE_STATE;

var cubeGroup;
var vectorX, vectorY, vectorZ;

var frontArr, backArr, rightArr, leftArr, topArr, downArr;
var rightMid, frontMid, topMid;

/* This variable helps debug */
var debug = false;

var doRotation = false, rotationVar = 0, rotationVector, rotationCoeff;

var rotationQueue = []; //[1, 2, 3, 4, 5, 6, -6, -5, -4, -3, -2, -1];
// 0 -> no rotation, 1 -> right, 2-> left, 3-> top, 4-> bottom, 5-> front, 6-> back
// -1 -> rightPrime, -2-> leftPrime, -3->topPrime, etc.

function createCube() {
    /* Create cube */

    var positionX = -2;
    var positionY = -2;
    var positionZ = -2;
    var index = 0;

    for(var i=0; i<3; i++) {
        positionX = -2;
        positionZ += 1;
        for(var j=0; j<3; j++) {
            positionX += 1;
            positionY = -2;
            for(var k=0; k<3; k++){
                positionY += 1;
                cubeGeometry = new THREE.BoxGeometry(.88, .88, .88);

                cubeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, vertexColors: true});
                cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
                cube.position.set(positionX, positionY, positionZ);
                scene.add(cube);

                cubeBorderGeometry = new THREE.EdgesGeometry( cube.geometry );
                cubeBorder = new THREE.LineSegments(cubeBorderGeometry, new THREE.LineBasicMaterial({color: 0x0000, linewidth: 3}));
                cubeBorder.position.set(positionX, positionY, positionZ);
                scene.add(cubeBorder);

                cubeArray.push(cube);
                cubeBorderArray.push(cubeBorder);

                /* Pushing the index to the required Array */
                if(positionZ === -1) { // back
                    backArr.push(index);
                } else if(positionZ === 1) { // front
                    frontArr.push(index);
                } else { // fontMid
                    frontMid.push(index);
                }

                if(positionX === -1) { // left
                    leftArr.push(index);
                } else if(positionX === 1) { // right
                    rightArr.push(index);
                } else {    // rightMid
                    rightMid.push(index);
                }

                if(positionY === -1) { // down
                    downArr.push(index);
                } else if(positionY === 1) { // top
                    topArr.push(index);
                } else { // topMid
                    topMid.push(index);
                }

                index = index + 1;
            }
        }
    }
}

function rotate(sideArr, rev = true) {
    var retArray = [];
    retArray.push(sideArr[2]);
    retArray.push(sideArr[5]);
    retArray.push(sideArr[8]);
    retArray.push(sideArr[1]);
    retArray.push(sideArr[4]);
    retArray.push(sideArr[7]);
    retArray.push(sideArr[0]);
    retArray.push(sideArr[3]);
    retArray.push(sideArr[6]);
    
    if(rev)
        retArray.reverse();
    
    return retArray;
}

/* Function for both right and left rotation */
function rightRotation(left, rev, double = 1) {

    /* Initialize a new Group */
    cubeGroup = new THREE.Group();
    var tempState = [];

    for (var i=0; i<cubeState.length; i++){
        tempState[i] = cubeState[i].slice();
    }

    for(let d=0; d<double; d++) {
        var finalArr;
        var initArr = (left)? leftArr:rightArr;
        if(d === 1) {
            initArr = rightMid;
        } else if(d == 2) {
            initArr = (left)? rightArr:leftArr;
        }
        
        finalArr = rotate(initArr);
        if( (!left && !rev) || (left && rev)) {
            finalArr.reverse();
            for(var i = 0; i<finalArr.length; i++) {
                tempState[initArr[i]][0] = cubeState[finalArr[i]][0];
                tempState[initArr[i]][1] = cubeState[finalArr[i]][1];
                tempState[initArr[i]][2] = cubeState[finalArr[i]][4];
                tempState[initArr[i]][3] = cubeState[finalArr[i]][5];
                tempState[initArr[i]][4] = cubeState[finalArr[i]][3];
                tempState[initArr[i]][5] = cubeState[finalArr[i]][2];

                /* Add to group */
                cubeGroup.add(cubeArray[initArr[i]]);
                cubeGroup.add(cubeBorderArray[initArr[i]]);
            }
            rotationCoeff = -0.1;
        } else {
            for(var i = 0; i<finalArr.length; i++) {
                tempState[initArr[i]][0] = cubeState[finalArr[i]][0];
                tempState[initArr[i]][1] = cubeState[finalArr[i]][1];
                tempState[initArr[i]][2] = cubeState[finalArr[i]][5];
                tempState[initArr[i]][3] = cubeState[finalArr[i]][4];
                tempState[initArr[i]][4] = cubeState[finalArr[i]][2];
                tempState[initArr[i]][5] = cubeState[finalArr[i]][3];

                /* Add to group */
                cubeGroup.add(cubeArray[initArr[i]]);
                cubeGroup.add(cubeBorderArray[initArr[i]]);
            }
            rotationCoeff = 0.1;
        }
    }


    rotationVector = vectorX;
    cubeState = tempState;
    scene.add(cubeGroup);

    doRotation = true;
}

/* Function for both front and back rotations */
function frontRotation(back, rev, double = 1) {

    /* Initialize a new Group */
    cubeGroup = new THREE.Group();

    var tempState = [];

    for (let i=0; i<cubeState.length; i++){
        tempState[i] = cubeState[i].slice();
    }

    for(let d = 0; d < double; d++) {
        var finalArr;
        var initArr = (back) ? backArr : frontArr;
        if(d === 1) {
            initArr = frontMid;
        } else if(d == 2) {
            initArr = (back)? frontArr:backArr;
        }

        finalArr = rotate(initArr);


        if ((!back && !rev) || (back && rev)) {
            for (let i = 0; i < finalArr.length; i++) {
                tempState[initArr[i]][0] = cubeState[finalArr[i]][2];
                tempState[initArr[i]][1] = cubeState[finalArr[i]][3];
                tempState[initArr[i]][2] = cubeState[finalArr[i]][1];
                tempState[initArr[i]][3] = cubeState[finalArr[i]][0];
                tempState[initArr[i]][4] = cubeState[finalArr[i]][4];
                tempState[initArr[i]][5] = cubeState[finalArr[i]][5];

                /* Add to group */
                cubeGroup.add(cubeArray[initArr[i]]);
                cubeGroup.add(cubeBorderArray[initArr[i]]);
            }
            rotationCoeff = -0.1;
        } else {
            finalArr.reverse();
            for (let i = 0; i < finalArr.length; i++) {
                tempState[initArr[i]][0] = cubeState[finalArr[i]][3];
                tempState[initArr[i]][1] = cubeState[finalArr[i]][2];
                tempState[initArr[i]][2] = cubeState[finalArr[i]][0];
                tempState[initArr[i]][3] = cubeState[finalArr[i]][1];
                tempState[initArr[i]][4] = cubeState[finalArr[i]][4];
                tempState[initArr[i]][5] = cubeState[finalArr[i]][5];

                /* Add to group */
                cubeGroup.add(cubeArray[initArr[i]]);
                cubeGroup.add(cubeBorderArray[initArr[i]]);
            }
            rotationCoeff = 0.1;
        }
    }


    rotationVector = vectorZ;
    cubeState = tempState;
    scene.add(cubeGroup);
    doRotation = true;
}

/* Function for handling both top and down rotations */
function topRotation(down, rev, double = 1) {

    /* Initialize a new Group */
    cubeGroup = new THREE.Group();

    var tempState = [];


    for (let i=0; i<cubeState.length; i++){
        tempState[i] = cubeState[i].slice();
    }

    for(let d=0; d<double; d++) {
        var finalArr;
        var initArr = (down) ? downArr : topArr;
        if(d === 1) {
            initArr = topMid;
        } else if(d == 2) {
            initArr = (down)? topArr:downArr;
        }

        finalArr = rotate(initArr);

        if ((!down && !rev) || (down && rev)) {
            for (let i = 0; i < finalArr.length; i++) {
                tempState[initArr[i]][0] = cubeState[finalArr[i]][5];
                tempState[initArr[i]][1] = cubeState[finalArr[i]][4];
                tempState[initArr[i]][2] = cubeState[finalArr[i]][2];
                tempState[initArr[i]][3] = cubeState[finalArr[i]][3];
                tempState[initArr[i]][4] = cubeState[finalArr[i]][0];
                tempState[initArr[i]][5] = cubeState[finalArr[i]][1];

                /* Add to group */
                cubeGroup.add(cubeArray[initArr[i]]);
                cubeGroup.add(cubeBorderArray[initArr[i]]);
            }
            rotationCoeff = -0.1;
        } else {
            finalArr.reverse();
            for (let i = 0; i < finalArr.length; i++) {
                tempState[initArr[i]][0] = cubeState[finalArr[i]][4];
                tempState[initArr[i]][1] = cubeState[finalArr[i]][5];
                tempState[initArr[i]][2] = cubeState[finalArr[i]][2];
                tempState[initArr[i]][3] = cubeState[finalArr[i]][3];
                tempState[initArr[i]][4] = cubeState[finalArr[i]][1];
                tempState[initArr[i]][5] = cubeState[finalArr[i]][0];

                /* Add to group */
                cubeGroup.add(cubeArray[initArr[i]]);
                cubeGroup.add(cubeBorderArray[initArr[i]]);
            }
            rotationCoeff = 0.1;
        }
    }


    rotationVector = vectorY;
    cubeState = tempState;
    scene.add(cubeGroup);
    doRotation = true;
}

function giveFaceColors() {
    for(var i=0; i<cubeArray.length; i++) {
        var thisCube = cubeArray[i];
        var faces = thisCube.geometry.faces;

        for(var x=0; x<6; x++) {
            faces[2*x].color.setHex(cubeState[i][x]);
            faces[2*x+1].color.setHex(cubeState[i][x]);
        }

        thisCube.geometry.elementsNeedUpdate = true;
    }
}

/* Function for handling Key Presses */
function windowKeyPress(event, btn = false) {
    // $ if debug is true
    if(debug) {
        console.log(event.which);
    }

    var toSwitch = (btn)? parseInt(event.target.value, 10) : event.which;

    var toPush;
    switch(toSwitch) {
        case 66:    // back Prime (Shift + b = B)
            toPush = -6;
            break;
        case 68:    // down Prime (Shift + d = D)
            toPush = -4;
            break;
        case 70:    // front Prime (Shift + f = F)
            toPush = -5;
            break;
        case 76:    // left Prime (Shift + l = L)
            toPush = -2;
            break;
        case 82:    // right Prime (Shift + r = R)
            toPush = -1;
            break;
        case 85:    // top Prime (Shift + u = U)
            toPush = -3;
            break;
        case 98:    // back (b)
            toPush = 6;
            break;
        case 100:   // down (d)
            toPush = 4;
            break;
        case 102:   // front (f)
            toPush = 5;
            break;
        case 108:   // left (l)
            toPush = 2;
            break;
        case 114:   // right (r)
            toPush = 1;
            break;
        case 117:   // top (u)
            toPush = 3;
            break;
        default:
            toPush = 0;
    }

    if(toPush != 0){
        rotationQueue.push(toPush);
    }
    if(debug) {
        console.log(rotationQueue);
    }
}

/* When browser window is resized */
function resizeWindow(){
    // This function resizes canvas size every time window size if resized

    TH_HEIGHT = parseInt(canvasDivStyle.getPropertyValue("height"), 10);
    TH_WIDTH = parseInt(canvasDivStyle.getPropertyValue("width"), 10);

    renderer.setSize(TH_WIDTH,TH_HEIGHT);
    camera.aspect = TH_WIDTH/TH_HEIGHT;

    camera.updateProjectionMatrix();
}

function shuffleCube() {
    var min = Math.ceil(-6);
    var max = Math.floor(6);
    var count = 0;
    while(count < 25) {
        var randNum = Math.floor(Math.random() * (max - min)) + min;
        if(randNum === 0)
            continue;
        rotationQueue.push(randNum);
        if(debug) {
            console.log(rotationQueue);
        }
        count++;
    }
}

function resetCube() {
    /* Clean the rotation queue */
    rotationQueue.length = 0;

    cubeState = CUBE_STATE;
    giveFaceColors();
}

function constructor(divId) {
    /* Position to add canvas */
    canvasDiv = document.getElementById(divId);
    canvasDivStyle = window.getComputedStyle(canvasDiv);
    TH_HEIGHT = parseInt(canvasDivStyle.getPropertyValue("height"), 10);
    TH_WIDTH = parseInt(canvasDivStyle.getPropertyValue("width"), 10);
    
    /* Setting up scene, camera and renderer*/
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, TH_WIDTH/TH_HEIGHT, 0.1, 500);
    camera.position.set(4, 4, 10);
    camera.lookAt(0, 0, 0);
    renderer = new THREE.WebGLRenderer({antialias: true, precision: 'highp'});
    renderer.setClearColor(0x092532);
    renderer.setSize(TH_WIDTH, TH_HEIGHT);
    renderer.shadowMap.enabled = true;

    /* Adding Light to the Scene */
    // scene.add(new THREE.AmbientLight(0xffffff));
    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(40, 40, 40);
    scene.add(light);

    light = new THREE.DirectionalLight(0xffffff, 0.46);
    light.position.set(8, 30, 8);
    light.castShadow = true;
    light.shadow.radius = 13;
    light.shadow.normalBias = -2;
    scene.add(light);

    // $ If debug is true, then add axis to help
    if(debug) {
        scene.add(new THREE.AxesHelper(10));
    }

    // * Adding three vectirs to support
    vectorX = new THREE.Vector3(1, 0, 0).normalize();
    vectorY = new THREE.Vector3(0, 1, 0).normalize();
    vectorZ = new THREE.Vector3(0, 0, 1).normalize();

    // $ If debug is true add Vector Helpers
    if(debug) {
        var origin = new THREE.Vector3(0, 0, 0);
        scene.add(new THREE.ArrowHelper( vectorX, origin, 10, 0xffcc33));
        scene.add(new THREE.ArrowHelper( vectorY, origin, 10, 0xff00cc));
        scene.add(new THREE.ArrowHelper( vectorZ, origin, 10, 0x2243b6));
    }

    /* Initializing all the arrays */
    frontArr = [];
    backArr = [];
    rightArr = [];
    leftArr = [];
    topArr = [];
    downArr = [];
    // Double rotations
    rightMid = [];
    frontMid = [];
    topMid = [];

    /* Initialize the cubeGroup and add it to the scene */
    cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    /* Create Rubik's cube */
    createCube();
    giveFaceColors();

    /* Add event listener to window */
    window.addEventListener('keypress', windowKeyPress);
    window.addEventListener('resize', resizeWindow);

    /* Giving event listeners to all bottom buttons */
    var buttons = document.getElementsByClassName('bottom-button');
    for(var i=0; i<buttons.length; i++){
        buttons[i].addEventListener('click', (e) => {
            windowKeyPress(e, true);
        });
    }

    /* Add event listeners to buttons */
    document.getElementById('shuffle-button').addEventListener('click', shuffleCube);
    document.getElementById('reset-button').addEventListener('click', resetCube);

    // $ Just to help debug the code
    if (debug) {
        console.log("Right: "+rightArr);
        console.log("Front: "+frontArr);
        console.log("top: "+topArr);
        console.log("left: "+leftArr);
        console.log("back: "+backArr);
        console.log("down: "+downArr);
    }

    canvasDiv.appendChild(renderer.domElement);
    render();
}

function nextRotation() {
    var next = rotationQueue.shift();

    switch(next) {
        case -23:   // z prime rotation
            return (function() {
                frontRotation(false, true, 3);
            });
        case -22:    // y prime rotation
            return (function() {
                topRotation(false, true, 3);
            });
        case -21:   // x prime rotation
            return (function() {
                rightRotation(false, true, 3);
            });
        case -16:    // Back Prime double
            return (function() {
                frontRotation(true, true, 2);
            });
        case -15:    // Front Prime double
            return (function(){
                frontRotation(false, true, 2);
            });
        case -14:    // Bottom Prime double
            return (function(){
                topRotation(true, true, 2);
            });
        case -13:    // Top Prime double
            return (function() {
                topRotation(false, true, 2);
            });
        case -12:    // Left Prime double
            return (function(){
                rightRotation(true, true, 2);
            });
        case -11:    // Right Prime double
            return (function(){
                rightRotation(false, true, 2);
            });
        case -6:    // Back Prime
            return (function() {
                frontRotation(true, true);
            });
        case -5:    // Front Prime
            return (function(){
                frontRotation(false, true);
            });
        case -4:    // Bottom Prime
            return (function(){
                topRotation(true, true);
            });
        case -3:    // Top Prime
            return (function() {
                topRotation(false, true);
            });
        case -2:    // Left Prime
            return (function(){
                rightRotation(true, true);
            });
        case -1:    // Right Prime
            return (function(){ 
                rightRotation(false, true);
            });
        case 1:     // Right
            return (function(){
                rightRotation(false, false);
            });
        case 2:     // Left
            return (function(){
                rightRotation(true, false);
            });
        case 3:     // Top
            return (function(){
                topRotation(false, false);
            });
        case 4:     // Bottom
            return (function(){
                topRotation(true, false);
            });
        case 5:     // Front
            return (function(){
                frontRotation(false, false);
            });
        case 6:     // Back
            return (function() {
                frontRotation(true, false);
            });
        case 11:     // Right double
            return (function(){
                rightRotation(false, false, 2);
            });
        case 12:     // Left double
            return (function(){
                rightRotation(true, false, 2);
            });
        case 13:     // Top double
            return (function(){
                topRotation(false, false, 2);
            });
        case 14:     // Bottom double
            return (function(){
                topRotation(true, false, 2);
            });
        case 15:     // Front double
            return (function(){
                frontRotation(false, false, 2);
            });
        case 16:     // Back double
            return (function() {
                frontRotation(true, false, 2);
            });
        case 21:    // x Rotation
            return (function() {
                rightRotation(false, false, 3);
            });
        case 22:    // y Rotation
            return (function() {
                topRotation(false, false, 3);
            });
        case 23:    // z Rotation
            return (function () {
                frontRotation(false, false, 3);
            });
        default:
            return null;
    }
}

function render() {
    requestAnimationFrame(render);

    /* Rotatte the Given face and then perform required actions */
    if(doRotation && rotationVar < (Math.PI/2.0)) {
        rotationVar = rotationVar + 0.1;
        cubeGroup.rotateOnAxis(rotationVector, rotationCoeff);
    } else {
        if(doRotation) {
            cubeGroup.rotateOnAxis(rotationVector, ((rotationCoeff > 0) ? -1.6: 1.6));
            giveFaceColors();
            doRotation = false;
        }
        var nextFunc = nextRotation();
            if(nextFunc !== null){
                nextFunc();
            }
        rotationVar = 0.0;
    }

    renderer.render(scene, camera);
}

constructor('canvas-div');