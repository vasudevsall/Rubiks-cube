import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { CUBE_STATE } from './cubeState.js';

var canvasDiv, canvasDivStyle;
var TH_HEIGHT, TH_WIDTH;

var scene, camera, renderer;
var controls;

var cubeGeometry, cubeMaterial, cubeBorderGeometry ,cube, cubeBorder;
var cubeArray = [];
var cubeBorderArray = [];
var cubeState = CUBE_STATE;

var cubeGroup;
var vectorX, vectorY, vectorZ;

var frontArr, backArr, rightArr, leftArr, topArr, downArr;

/* This variable helps debug */
var debug = true;

var doRotation = false, rotationVar = 0, rotationVector, rotationCoeff;

var rotationQueue = [1, 5, -5, -1];//[1, 5, -5, -1];
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
                cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

                cubeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, vertexColors: true});
                cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
                cube.position.set(positionX, positionY, positionZ);
                scene.add(cube);

                cubeBorderGeometry = new THREE.EdgesGeometry( cube.geometry );
                cubeBorder = new THREE.LineSegments(cubeBorderGeometry, new THREE.LineBasicMaterial({color: 0x0000, linewidth: 10}));
                cubeBorder.position.set(positionX, positionY, positionZ);
                scene.add(cubeBorder);

                cubeArray.push(cube);
                cubeBorderArray.push(cubeBorder);

                /* Pushing the index to the required Array */
                if(positionZ === -1) { // back
                    backArr.push(index);
                } else if(positionZ === 1) { // front
                    frontArr.push(index);
                }

                if(positionX === -1) { // left
                    leftArr.push(index);
                } else if(positionX === 1) {
                    rightArr.push(index);
                }

                if(positionY === -1) { // down
                    downArr.push(index);
                } else if(positionY === 1) { // top
                    topArr.push(index);
                }

                index = index + 1;
            }
        }
    }
}

function rotate(sideArr, rev = true) {
    var retArray = new Array();
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

function rightRotation(rev = false) {

    /* Initialize a new Group */
    cubeGroup = new THREE.Group();

    var finalArr;
    var tempState = [];
    
    finalArr = rotate(rightArr);

    for (var i=0; i<cubeState.length; i++){
        tempState[i] = cubeState[i].slice();
    }
    if(!rev) {
        finalArr.reverse();
        for(var i = 0; i<finalArr.length; i++) {
            tempState[rightArr[i]][0] = cubeState[finalArr[i]][0];
            tempState[rightArr[i]][1] = cubeState[finalArr[i]][1];
            tempState[rightArr[i]][2] = cubeState[finalArr[i]][4];
            tempState[rightArr[i]][3] = cubeState[finalArr[i]][5];
            tempState[rightArr[i]][4] = cubeState[finalArr[i]][3];
            tempState[rightArr[i]][5] = cubeState[finalArr[i]][2];

            /* Add to group */
            cubeGroup.add(cubeArray[rightArr[i]]);
            cubeGroup.add(cubeBorderArray[rightArr[i]]);
        }
        rotationCoeff = -0.1;
    } else {
        for(var i = 0; i<finalArr.length; i++) {
            tempState[rightArr[i]][0] = cubeState[finalArr[i]][0];
            tempState[rightArr[i]][1] = cubeState[finalArr[i]][1];
            tempState[rightArr[i]][2] = cubeState[finalArr[i]][5];
            tempState[rightArr[i]][3] = cubeState[finalArr[i]][4];
            tempState[rightArr[i]][4] = cubeState[finalArr[i]][2];
            tempState[rightArr[i]][5] = cubeState[finalArr[i]][3];

            /* Add to group */
            cubeGroup.add(cubeArray[rightArr[i]]);
            cubeGroup.add(cubeBorderArray[rightArr[i]]);
        }
        rotationCoeff = 0.1;
    }


    rotationVector = vectorX;
    cubeState = tempState;
    scene.add(cubeGroup);

    doRotation = true;
}

function frontRotation(rev = false) {

    /* Initialize a new Group */
    cubeGroup = new THREE.Group();

    var finalArr;
    var tempState = [];
    
    finalArr = rotate(frontArr);

    for (var i=0; i<cubeState.length; i++){
        tempState[i] = cubeState[i].slice();
    }
    if(!rev) {
        for(var i = 0; i<finalArr.length; i++) {
            tempState[frontArr[i]][0] = cubeState[finalArr[i]][2];
            tempState[frontArr[i]][1] = cubeState[finalArr[i]][3];
            tempState[frontArr[i]][2] = cubeState[finalArr[i]][1];
            tempState[frontArr[i]][3] = cubeState[finalArr[i]][0];
            tempState[frontArr[i]][4] = cubeState[finalArr[i]][4];
            tempState[frontArr[i]][5] = cubeState[finalArr[i]][5];

            /* Add to group */
            cubeGroup.add(cubeArray[frontArr[i]]);
            cubeGroup.add(cubeBorderArray[frontArr[i]]);
        }
        rotationCoeff = -0.1;
    } else {
        finalArr.reverse();
        for(var i = 0; i<finalArr.length; i++) {
            tempState[frontArr[i]][0] = cubeState[finalArr[i]][3];
            tempState[frontArr[i]][1] = cubeState[finalArr[i]][2];
            tempState[frontArr[i]][2] = cubeState[finalArr[i]][0];
            tempState[frontArr[i]][3] = cubeState[finalArr[i]][1];
            tempState[frontArr[i]][4] = cubeState[finalArr[i]][4];
            tempState[frontArr[i]][5] = cubeState[finalArr[i]][5];

            /* Add to group */
            cubeGroup.add(cubeArray[frontArr[i]]);
            cubeGroup.add(cubeBorderArray[frontArr[i]]);
        }
        rotationCoeff = 0.1;
    }


    rotationVector = vectorZ;
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

function constructor(divId) {
    /* Position to add canvas */
    canvasDiv = document.getElementById(divId);
    canvasDivStyle = window.getComputedStyle(canvasDiv);
    TH_HEIGHT = parseInt(canvasDivStyle.getPropertyValue("height"), 10);
    TH_WIDTH = parseInt(canvasDivStyle.getPropertyValue("width"), 10);
    
    /* Setting up scene, camera and renderer*/
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, TH_WIDTH/TH_HEIGHT, 0.1, 500);
    camera.position.set(-2, 4, 10);
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(0xf6f6f6);
    renderer.setSize(TH_WIDTH, TH_HEIGHT);

    /* Adding controls to the scene */
    controls = new OrbitControls( camera, canvasDiv);

    /* Adding Light to the Scene */
    scene.add(new THREE.AmbientLight(0xffffff));

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
    frontArr = new Array();
    backArr = new Array();
    rightArr = new Array();
    leftArr = new Array();
    topArr = new Array();
    downArr = new Array();

    /* Initialize the cubeGroup and add it to the scene */
    cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    /* Create Rubik's cube */
    createCube();
    giveFaceColors();

    /* Give the first rotation */
    var firstRotation = nextRotation();
    firstRotation();

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
    console.log(next +"\t"+ rotationQueue);

    switch(next) {
        case -5:
            return (function(){
                frontRotation(true);
            });
        case -1:
            return (function(){ 
                rightRotation(true);
            });
        case 1:
            return rightRotation;
        case 5:
            return frontRotation;
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
            var nextFunc = nextRotation();
            if(nextFunc !== null){
                nextFunc();
            }
        }
        rotationVar = 0.0;
    }

    /* Orbit Controls update and rendering camera  */
    controls.update();
    renderer.render(scene, camera);
}

constructor('canvas-div');