import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { CUBE_STATE } from './cubeState.js';

var canvasDiv, canvasDivStyle;
var TH_HEIGHT, TH_WIDTH;

var scene, camera, renderer;
var controls;

var cubeGeometry, cubeMaterial, cubeBorderGeometry ,cube, cubeBorder;
var cubeArray = new Array();
var cubeBorderArray = new Array();
var cubeState = CUBE_STATE;

/* This variable helps debug */
var debug = true;

function createCube() {
    /* Create cube */

    var positionX = -1;
    var positionY = -1;
    var positionZ = -1;

    for(var i=0; i<3; i++) {
        positionX = -1;
        positionZ += 1;
        for(var j=0; j<3; j++) {
            positionX += 1;
            positionY = -1;
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

            }
        }
    }

}

function giveFaceColors() {
    for(var i=0; i<cubeArray.length; i++) {
        var thisCube = cubeArray[i];
        var faces = thisCube.geometry.faces;

        for(var x=0; x<6; x++) {
            faces[2*x].color.setHex(cubeState[x]);
            faces[2*x+1].color.setHex(cubeState[x]);
            // var face = faces[x];
            // face.color.setHex(0xff0000);
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

    /* If debug is true, then add axis to help */
    if(debug) {
        scene.add(new THREE.AxesHelper(10));
        // scene.add(new THREE.CameraHelper(camera));
    }

    /* Create Rubik's cube */
    createCube();
    giveFaceColors();

    canvasDiv.appendChild(renderer.domElement);
    render();
}

function render() {
    requestAnimationFrame(render);

    // cubeArray[26].rotation.x += 0.1;
    // cubeBorderArray[26].rotation.x += 0.1;

    controls.update();
    renderer.render(scene, camera);
}

constructor('canvas-div');