import * as THREE from 'three';

import TWEEN from 'three/addons/libs/tween.module.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

let camera, scene, renderer;
let controls;
let visualisationStarted = false; 

const objects = [];
const targets = { table: [], sphere: [], helix: [], grid: [], tetrahedron: [] };


document.addEventListener("sheet-data-loaded", function (event) {
    if (visualisationStarted) {
        return; 
    }
    
    const people = event.detail.people; 

    console.log("People received by index.html: ", people);

    if (!Array.isArray(people) || people.length === 0) {
        console.error("No people data was received. ");

        document.getElementById("login-status").textContent = "No data was found from the Google Sheet. "; 

        return; 
    }

    const displayedPeople = people.slice(0, 200); 

    if (displayedPeople.length < 200) {
        console.warn(`Expected 200 records, but only ${displayedPeople.length} were loaded. `);
    }

    try {
        document.getElementById("login-page").classList.add("hidden");
        document.getElementById("visualisation-page").classList.remove("hidden"); 

        init(displayedPeople);
        animate();

        visualisationStarted = true;
    } catch (error) {
        console.error("Visualisation initialization failed: ", error);

        document.getElementById("login-page").classList.remove("hidden");
        document.getElementById("visualisation-page").classList.add("hidden");

        document.getElementById("login-status").textContent = "Data loaded, but visualisation couldn't be created.";
    }
});

// init();
// animate();

function init(people) {

    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 3000;

    scene = new THREE.Scene();

    // table

    for ( let i = 0; i < people.length; i ++ ) {
        const person = people[i];

        const element = document.createElement( 'div' );
        element.className = 'element';

        element.classList.add(getNetWorthClass(person.netWorth));

        const tileContent = document.createElement('div');
        tileContent.className = 'tile-content';

        const tileHeader = document.createElement('div');
        tileHeader.className = 'tile-header';

        const country = document.createElement( 'span' );
        country.className = 'person-country';
        country.textContent = person.country || "N/A";

        const age = document.createElement( 'span' );
        age.className = 'person-age';
        age.textContent = person.age || "N/A";

        tileHeader.appendChild(country);
        tileHeader.appendChild(age);
        
        tileContent.appendChild(tileHeader);

        
        const photoContainer = document.createElement( 'div' );
        photoContainer.className = "person-photo";

        if (person.photo) {
            const photo = document.createElement( 'img' );
            photo.src = person.photo;
            photo.alt = `${person.name || "Person"} photo`;

            photo.addEventListener("error", function () {
                photo.remove(); 
                photoContainer.textContent = "No Photo";
            }); 

            photoContainer.appendChild(photo);
        } else {
            photoContainer.textContent = "No Photo";
        }
        tileContent.appendChild(photoContainer);

        const name = document.createElement( 'div' );
        name.className = 'person-name';
        name.textContent = person.name || "N/A";
        tileContent.appendChild(name);

        const interest = document.createElement( 'div' );
        interest.className = 'person-interest';
        interest.textContent = person.interest || "N/A";
        tileContent.appendChild(interest);

        element.appendChild(tileContent);


        const objectCSS = new CSS3DObject(element);

        objectCSS.position.x = Math.random() * 4000 - 2000;
        objectCSS.position.y = Math.random() * 4000 - 2000;
        objectCSS.position.z = Math.random() * 4000 - 2000;

        scene.add(objectCSS);
        objects.push(objectCSS);


        const tableObject = new THREE.Object3D();

        const column = i % 20;
        const row = Math.floor(i / 20); 

        tableObject.position.x = (column * 140) - 1330;
        tableObject.position.y = - (row * 190) + 855;
        tableObject.position.z = 0;

        targets.table.push(tableObject);
    }


    // sphere

    const sphereVector = new THREE.Vector3();

    for (let i = 0; i < objects.length; i++) {
        const phi = Math.acos(-1 + (2 * i) / objects.length);

        const theta = Math.sqrt(objects.length * Math.PI) * phi;

        const sphereObject = new THREE.Object3D();

        sphereObject.position.setFromSphericalCoords(
            1000, 
            phi, 
            theta
        );

        sphereVector.copy(sphereObject.position).multiplyScalar(2);

        sphereObject.lookAt(sphereVector);

        targets.sphere.push(sphereObject);
    }


    // helix
    // DOUBLE HELIX 

    const helixVector = new THREE.Vector3();

    const helixRadius = 800;
    const angleStep = 0.16; 
    const verticalSpacing = 18;

    const peoplePerStrand = Math.ceil(objects.length / 2);

    const helixHeight = (peoplePerStrand - 1) * verticalSpacing;

    for ( let i = 0; i < objects.length; i ++ ) {
        const strand = i % 2; 
        
        const positionOnStrand = Math.floor(i / 2);
        
        const baseAngle = positionOnStrand * angleStep;

        const theta = baseAngle + (strand === 0 ? 0 : Math.PI);

        const y = helixHeight / 2 - (positionOnStrand * verticalSpacing);

        const helixObject = new THREE.Object3D();

        helixObject.position.setFromCylindricalCoords( 
            helixRadius, 
            theta, 
            y 
        );

        helixVector.set(
            helixObject.position.x * 2, 
            helixObject.position.y, 
            helixObject.position.z * 2
        );

        helixObject.lookAt( helixVector );

        targets.helix.push( helixObject );
    }


    // grid

    for ( let i = 0; i < objects.length; i ++ ) {
        const gridObject = new THREE.Object3D();

        const column = i % 5; 

        const row = Math.floor(i / 5) % 4;

        const layer = Math.floor(i / 20);

        gridObject.position.x = column * 300 - 600; 
        gridObject.position.y = -(row * 250) + 375;
        gridObject.position.z = layer * 500 - 2250;

        targets.grid.push( gridObject );
    }
    

    // 4-face pyramid (tetrahedron) 

    const baseRadius = 950; 
    const pyramidHeight = 1500; 

    const apexY = pyramidHeight * 0.75; 
    const baseY = -pyramidHeight * 0.25; 

    const pyramidVertices = [
        // top point 
        new THREE.Vector3(0, apexY, 0), 

        // bottom left / front 
        new THREE.Vector3(-baseRadius * 0.866, baseY, baseRadius *0.5), 
        
        // bottom right / front
        new THREE.Vector3(baseRadius * 0.866, baseY, baseRadius * 0.5),

        // back point 
        new THREE.Vector3(0, baseY, -baseRadius)
    ];

    const pyramidFaces = [
        [0, 1, 2],
        [0, 2, 3],
        [0, 3, 1],
        [1, 3, 2]
    ]

    for (let i = 0; i < objects.length; i++) {
        const faceIndex = i % pyramidFaces.length;
        const positionOnFace = Math.floor(i / pyramidFaces.length);
        const positionsOnFace = Math.ceil((objects.length - faceIndex) / pyramidFaces.length);

        const face = pyramidFaces[faceIndex];
        const vertexA = pyramidVertices[face[0]]; 
        const vertexB = pyramidVertices[face[1]];
        const vertexC = pyramidVertices[face[2]];

        const gridRows = 10; 

        const totalGridPositions = (gridRows * (gridRows + 1)) / 2; 

        const gridIndex = Math.floor(positionOnFace * totalGridPositions / positionsOnFace);
        
        let triangleRow = 0; 
        let rowStartIndex = 0; 

        while (gridIndex >= rowStartIndex + triangleRow + 1) {
            rowStartIndex += triangleRow + 1; 
            triangleRow++; 
        }

        const positionInRow = gridIndex - rowStartIndex; 

        let weightA; 
        let weightB; 
        let weightC; 

        if (triangleRow === 0) {
            weightA = 1; 
            weightB = 0; 
            weightC = 0; 
        } else {
            const rowProgress = triangleRow / (gridRows - 1); 

            const columnProgress = positionInRow / triangleRow; 

            weightA = 1 - rowProgress; 
            weightB = rowProgress * (1 - columnProgress); 
            weightC = rowProgress * columnProgress; 
        }

        const edgeInset = 0.035; 
        const remainingWeight = 1 - 3 * edgeInset; 

        weightA = weightA * remainingWeight + edgeInset;
        weightB = weightB * remainingWeight + edgeInset;
        weightC = weightC * remainingWeight + edgeInset; 

        const tetrahedronObject = new THREE.Object3D();

        tetrahedronObject.scale.setScalar(0.72);

        tetrahedronObject.position
            .copy(vertexA)
            .multiplyScalar(weightA)
            .addScaledVector(vertexB, weightB)
            .addScaledVector(vertexC, weightC);

        // Calculate the outward direction of the current surface 
        const edgeAB = new THREE.Vector3().subVectors(vertexB, vertexA);
        const edgeAC = new THREE.Vector3().subVectors(vertexC, vertexA);
        const faceNormal = new THREE.Vector3().crossVectors(edgeAB, edgeAC).normalize();

        const faceCentre = new THREE.Vector3()
            .add(vertexA)
            .add(vertexB)
            .add(vertexC)
            .divideScalar(3);

        if (faceNormal.dot(faceCentre) < 0) {
            faceNormal.negate();
        }

        const lookAtPosition = tetrahedronObject.position
            .clone()
            .add(faceNormal.clone().multiplyScalar(1000));

        tetrahedronObject.lookAt(lookAtPosition);

        targets.tetrahedron.push(tetrahedronObject);
    }


    renderer = new CSS3DRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById( 'container' ).appendChild( renderer.domElement );

    controls = new TrackballControls( camera, renderer.domElement );
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener( 'change', render );

    transform(targets.table, 2000);

    document.getElementById("table").addEventListener("click", function () {
        transform(targets.table, 2000);
    });

    document.getElementById("sphere").addEventListener("click", function () {
        transform(targets.sphere, 2000);
    });

    document.getElementById("helix").addEventListener("click", function () {
        transform(targets.helix, 2000);
    });

    document.getElementById("grid").addEventListener("click", function () {
        transform(targets.grid, 2000);
    });

    document.getElementById("tetrahedron").addEventListener("click", function () {
        transform(targets.tetrahedron, 2000);
    });
    
    window.addEventListener( 'resize', onWindowResize );

}

function getNetWorthClass(netWorth) {
    const amount = Number(netWorth) || 0;

    if (amount >= 200000) {
        return "net-worth-high";
    } else if (amount >= 100000) {
        return "net-worth-medium";
    } else {
        return "net-worth-low";
    }
}

function transform( layoutTargets, duration ) {

    TWEEN.removeAll();

    for ( let i = 0; i < objects.length; i ++ ) {

        const object = objects[ i ];
        const target = layoutTargets[ i ];

        if (!target) {
            continue;
        }

        new TWEEN.Tween( object.position )
            .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

        new TWEEN.Tween( object.rotation )
            .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

        new TWEEN.Tween( object.scale )
            .to( { x: target.scale.x, y: target.scale.y, z: target.scale.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();
    }

    new TWEEN.Tween({})
        .to( {}, duration * 2 )
        .onUpdate( render )
        .start();
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    // edit
    controls.handleResize();

    render();

}

function animate() {

    requestAnimationFrame( animate );

    TWEEN.update();

    controls.update();

}

function render() {

    renderer.render( scene, camera );

}
