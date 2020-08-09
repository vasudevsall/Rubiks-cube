import { CUBE_STATE } from './cubeState.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

var canvasDiv, canvasDivStyle;
var TH_HEIGHT, TH_WIDTH;

var scene, camera, renderer;
var controls;

var cubeGeometry, cubeMaterial,cube;
var cubeArray = [];
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
var faceIndexArr = [98, 198, 200, 202, 96, 196];

function RoundEdgedBox(width, height, depth, radius, widthSegments, heightSegments, depthSegments, smoothness) {

    width = width || 1;
    height = height || 1;
    depth = depth || 1;
    radius = radius || (Math.min(Math.min(width, height), depth) * .25);
    widthSegments = Math.floor(widthSegments) || 1;
    heightSegments = Math.floor(heightSegments) || 1;
    depthSegments = Math.floor(depthSegments) || 1;
    smoothness = Math.max(3, Math.floor(smoothness) || 3);

    let halfWidth = width * .5 - radius;
    let halfHeight = height * .5 - radius;
    let halfDepth = depth * .5 - radius;

    var geometry = new THREE.Geometry();

    var corner1 = new THREE.SphereGeometry(radius, smoothness, smoothness, 0, Math.PI * .5, 0, Math.PI * .5);
    corner1.translate(-halfWidth, halfHeight, halfDepth);
    var corner2 = new THREE.SphereGeometry(radius, smoothness, smoothness, Math.PI * .5, Math.PI * .5, 0, Math.PI * .5);
    corner2.translate(halfWidth, halfHeight, halfDepth);
    var corner3 = new THREE.SphereGeometry(radius, smoothness, smoothness, 0, Math.PI * .5, Math.PI * .5, Math.PI * .5);
    corner3.translate(-halfWidth, -halfHeight, halfDepth);
    var corner4 = new THREE.SphereGeometry(radius, smoothness, smoothness, Math.PI * .5, Math.PI * .5, Math.PI * .5, Math.PI * .5);
    corner4.translate(halfWidth, -halfHeight, halfDepth);
    
    geometry.merge(corner1);
    geometry.merge(corner2);
    geometry.merge(corner3);
    geometry.merge(corner4);

    var edge = new THREE.CylinderGeometry(radius, radius, width - radius * 2, smoothness, widthSegments, true, 0, Math.PI * .5);
    edge.rotateZ(Math.PI * .5);
    edge.translate(0, halfHeight, halfDepth);
    var edge2 = new THREE.CylinderGeometry(radius, radius, width - radius * 2, smoothness, widthSegments, true, Math.PI * 1.5, Math.PI * .5);
    edge2.rotateZ(Math.PI * .5);
    edge2.translate(0, -halfHeight, halfDepth);

    // height
    var edge3 = new THREE.CylinderGeometry(radius, radius, height - radius * 2, smoothness, heightSegments, true, 0, Math.PI * .5);
    edge3.translate(halfWidth, 0, halfDepth);
    var edge4 = new THREE.CylinderGeometry(radius, radius, height - radius * 2, smoothness, heightSegments, true, Math.PI * 1.5, Math.PI * .5);
    edge4.translate(-halfWidth, 0, halfDepth);

    // depth
    var edge5 = new THREE.CylinderGeometry(radius, radius, depth - radius * 2, smoothness, depthSegments, true, 0, Math.PI * .5);
    edge5.rotateX(-Math.PI * .5);
    edge5.translate(halfWidth, halfHeight, 0);
    var edge6 = new THREE.CylinderGeometry(radius, radius, depth - radius * 2, smoothness, depthSegments, true, Math.PI * .5, Math.PI * .5);
    edge6.rotateX(-Math.PI * .5);
    edge6.translate(halfWidth, -halfHeight, 0);

    edge.merge(edge2);
    edge.merge(edge3);
    edge.merge(edge4);
    edge.merge(edge5);
    edge.merge(edge6);

    // sides
    // front
    var side = new THREE.PlaneGeometry(width - radius * 2, height - radius * 2, widthSegments, heightSegments);
    side.translate(0, 0, depth * .5);

    // right
    var side2 = new THREE.PlaneGeometry(depth - radius * 2, height - radius * 2, depthSegments, heightSegments);
    side2.rotateY(Math.PI * .5);
    side2.translate(width * .5, 0, 0);

    side.merge(side2);

    geometry.merge(edge);
    geometry.merge(side);

    // duplicate and flip
    var secondHalf = geometry.clone();
    secondHalf.rotateY(Math.PI);
    geometry.merge(secondHalf);

    // top
    var top = new THREE.PlaneGeometry(width - radius * 2, depth - radius * 2, widthSegments, depthSegments);
    top.rotateX(-Math.PI * .5);
    top.translate(0, height * .5, 0);

    // bottom
    var bottom = new THREE.PlaneGeometry(width - radius * 2, depth - radius * 2, widthSegments, depthSegments);
    bottom.rotateX(Math.PI * .5);
    bottom.translate(0, -height * .5, 0);

    geometry.merge(top);
    geometry.merge(bottom);

    geometry.mergeVertices();

    return geometry;
  }

function createCube() {
    /* Create cube */

    var positionX = -20;
    var positionY = -20;
    var positionZ = -20;
    var index = 0;

    for(var i=0; i<3; i++) {
        positionX = -20;
        positionZ += 10;
        for(var j=0; j<3; j++) {
            positionX += 10;
            positionY = -20;
            for(var k=0; k<3; k++){
                positionY += 10;
                // cubeGeometry = new THREE.BoxGeometry(.88, .88, .88);
                cubeGeometry = RoundEdgedBox(10, 10, 10, 1, 1, 1, 1, 1);
                var faces = cubeGeometry.faces;
                for(var x = 0; x<faces.length; x++) {
                    faces[x].color.setHex(0x101010);
                }

                cubeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, vertexColors: true});
                cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
                cube.position.set(positionX, positionY, positionZ);
                scene.add(cube);

                cubeArray.push(cube);

                /* Pushing the index to the required Array */
                if(positionZ === -10) { // back
                    backArr.push(index);
                } else if(positionZ === 10) { // front
                    frontArr.push(index);
                } else { // fontMid
                    frontMid.push(index);
                }

                if(positionX === -10) { // left
                    leftArr.push(index);
                } else if(positionX === 10) { // right
                    rightArr.push(index);
                } else {    // rightMid
                    rightMid.push(index);
                }

                if(positionY === -10) { // down
                    downArr.push(index);
                } else if(positionY === 10) { // top
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
function rightRotation(left, rev, double = 1, initD = 0) {

    /* Initialize a new Group */
    cubeGroup = new THREE.Group();
    var tempState = [];

    for (var i=0; i<cubeState.length; i++){
        tempState[i] = cubeState[i].slice();
    }

    for(let d=initD; d<double; d++) {
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
function frontRotation(back, rev, double = 1, initD = 0) {

    /* Initialize a new Group */
    cubeGroup = new THREE.Group();

    var tempState = [];

    for (let i=0; i<cubeState.length; i++){
        tempState[i] = cubeState[i].slice();
    }

    for(let d = initD; d < double; d++) {
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
function topRotation(down, rev, double = 1, initD = 0) {

    /* Initialize a new Group */
    cubeGroup = new THREE.Group();

    var tempState = [];


    for (let i=0; i<cubeState.length; i++){
        tempState[i] = cubeState[i].slice();
    }

    for(let d=initD; d<double; d++) {
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
            faces[faceIndexArr[x]].color.setHex(cubeState[i][x]);
            faces[faceIndexArr[x] + 1].color.setHex(cubeState[i][x]);
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
        case 33:    // front double prime (!)
            toPush = -15;
            break;
        case 35:    // right double prime (#)
            toPush = -11;
            break;
        case 36:    // left double prime ($)
            toPush = -12;
            break;
        case 37:    // top double prime (%)
            toPush = -13;
            break;
        case 49:    // front double (1)
            toPush = 15;
            break;
        case 50:    // back double (2)
            toPush = 16;
            break;
        case 51: // right double (3)
            toPush = 11;
            break;
        case 52: // left double (4)
            toPush = 12;
            break;
        case 53: // top double (5)
            toPush = 13;
            break;
        case 54:    // down double (6)
            toPush = 14;
            break;
        case 64:    // back double prime (@)
            toPush = -16;
            break;
        case 66:    // back Prime (Shift + b = B)
            toPush = -6;
            break;
        case 68:    // down Prime (Shift + d = D)
            toPush = -4;
            break;
        case 69:    // Top Middle Prime (Shift + e = E)
            toPush = -8;
            break;
        case 70:    // front Prime (Shift + f = F)
            toPush = -5;
            break;
        case 76:    // left Prime (Shift + l = L)
            toPush = -2;
            break;
        case 77: // middle right Prime (shift + m = M)
            toPush = -7;
            break;
        case 82:    // right Prime (Shift + r = R)
            toPush = -1;
            break;
        case 83:    // Front Middle Prime (Shift + s = S)
            toPush = -9;
            break;
        case 85:    // top Prime (Shift + u = U)
            toPush = -3;
            break;
        case 88:    // x Prime (Shift + x = X)
            toPush = -21;
            break;
        case 89:    // y Prime (Shift + y = Y)
            toPush = -22;
            break;
        case 90:    // z Prime (Shift + z = Z)
            toPush = -23;
            break;
        case 94:    // down double prime (^)
            toPush = -14;
            break;
        case 98:    // back (b)
            toPush = 6;
            break;
        case 100:   // down (d)
            toPush = 4;
            break;
        case 101:   // Top Middle (e)
            toPush = 8;
            break;
        case 102:   // front (f)
            toPush = 5;
            break;
        case 108:   // left (l)
            toPush = 2;
            break;
        case 109:   // middle (m)
            toPush = 7;
            break;
        case 114:   // right (r)
            toPush = 1;
            break;
        case 115:   // Front Middle (s)
            toPush = 9;
            break;
        case 117:   // top (u)
            toPush = 3;
            break;
        case 120:    // x
            toPush = 21;
            break;
        case 121:    // y 
            toPush = 22;
            break;
        case 122:    // z
            toPush = 23;
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
    scene.background = null;
    camera = new THREE.PerspectiveCamera(45, TH_WIDTH/TH_HEIGHT, 0.1, 500);
    camera.position.set(-50, 30, 100);
    camera.lookAt(0, 0, 0);
    renderer = new THREE.WebGLRenderer({antialias: true, precision: 'highp', alpha: true});
    // renderer.setClearColor(0x263f44);
    renderer.setClearColor(0xe4e3e3, 0);
    renderer.setSize(TH_WIDTH, TH_HEIGHT);
    renderer.shadowMap.enabled = true;

    /* Adding Orbit Controls to the scene */
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan =false;
    controls.enableZoom = false;
    controls.addEventListener('end', function(){
        controls.reset();
    });

    /* Adding Light to the Scene */
    scene.add(new THREE.AmbientLight(0xffffff));

    // $ If debug is true, then add axis to help
    if(debug) {
        scene.add(new THREE.AxesHelper(200));
    }

    // * Adding three vectirs to support
    vectorX = new THREE.Vector3(1, 0, 0).normalize();
    vectorY = new THREE.Vector3(0, 1, 0).normalize();
    vectorZ = new THREE.Vector3(0, 0, 1).normalize();

    // $ If debug is true add Vector Helpers
    if(debug) {
        var origin = new THREE.Vector3(0, 0, 0);
        scene.add(new THREE.ArrowHelper( vectorX, origin, 150, 0xff0000));
        scene.add(new THREE.ArrowHelper( vectorY, origin, 150, 0x00ff00));
        scene.add(new THREE.ArrowHelper( vectorZ, origin, 150, 0x0000ff));
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
        case -9:    // Front Middle Prime
            return (function() {
                frontRotation(false, true, 2, 1);
            });
        case -8:    // Top Middle Prime
            return (function() {
                topRotation(false, true, 2, 1);
            });
        case -7:    // Right Middle Prime
            return (function() {
                rightRotation(false, true, 2, 1);
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
        case 7:     // Right Middle
            return (function(){
                rightRotation(false, false, 2, 1);
            });
        case 8:     // Top Middle
            return (function(){
                topRotation(false, false, 2, 1);
            });
        case 9:     // Front Middle
            return (function(){
                frontRotation(false, false, 2, 1);
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

    /*Controls Update */
    controls.update();

    renderer.render(scene, camera);
}

constructor('canvas-div');