require({
    baseUrl: 'js',
    // three.js should have UMD support soon, but it currently does not
    shim: { 'vendor/three': { exports: 'THREE' } }
}, [
    'vendor/three'
], function(THREE) {

var renderer, scene, camera, stats;
var pointclouds;

var pointSize = 0.01;
var width = 20;
var length = 20;
var height = 20;
var attraction = 0.3;
var rotateY = new THREE.Matrix4().makeRotationY( 0.005 );

var container;
var myNinjaSystem;

init();
animate();

function GenerateRegularPointCloud ( color, width, length ) {


    var geometry = new THREE.Geometry();
    var numPoints = width * length;

    var thisNinjaParticleSystem = new Ninja_ParticleSystem();

    var counter = 0;

    for (var i = 0; i < width; i++) {
        for (var j = 0; j < length; j++) {
            for (var k = 0; k < height; k++) {
                var v = new THREE.Vector3(
                    i - (width / Math.floor(Math.random() * 60) + 10),
                    j - (length /  Math.floor(Math.random() * 60) + 10),
                    k - (height / Math.floor(Math.random() * 60) + 10)
                );

                geometry.vertices.push(v);
                var aNinjaParticle = new NinjaParticle(v);
                thisNinjaParticleSystem.particles.push(aNinjaParticle);
                counter++;
            }
        }
    }

    geometry.color = color;
    geometry.computeBoundingBox();

    var material = new THREE.PointCloudMaterial ( { size: pointSize, vertexCoors: THREE.VertexColors } );
    var pointCloud = new THREE.PointCloud( geometry, material );
    thisNinjaParticleSystem.pointCloud = pointCloud;

    return thisNinjaParticleSystem;

}


function init(){

    container = document.getElementById( 'container');

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 100);
    camera.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 20 ) );
    camera.applyMatrix(new THREE.Matrix4().makeRotationX( -0.5 ) );

    myNinjaSystem = GenerateRegularPointCloud( new THREE.Color( 1,0,1 ), width, length );

    var myForceField = new ForceField_Magnet(new THREE.Vector3(0,0,0), 100);
    myNinjaSystem.AddForceField(myForceField);
    //myPointCloud.scale.set( 10,10,10 );
    //myPointCloud.position.set( -5,0,-5 );
    scene.add( myNinjaSystem.pointCloud );


    // Directional Light
    light = new THREE.DirectionalLight( 0x999999 );
    light.castShadow = true;
    light.shadowMapWidth = 2048;
    light.shadowMapHeight = 2048;
    light.shadowCameraLeft = -500;
    light.shadowCameraRight = 500;
    light.shadowCameraTop = 500;
    light.shadowCameraBottom = -500;
    light.shadowCameraFar = 3500;

    scene.add( light  );

    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio (window.devicePixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight );
    container.appendChild(renderer.domElement);

    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );

    myNinjaSystem.Update();

    render();

}

function render() {
    camera.applyMatrix( rotateY );
    camera.updateMatrixWorld();
    renderer.render( scene, camera );
}

function onDocumentMouseMove( event ) {

    //event.preventDefault();

    myNinjaSystem.forceFields[0].position = new THREE.Vector3(
        (event.clientX - window.innerWidth / 2) / 70,
        (event.clientY - window.innerHeight / 2) / -70,
        0
    );


}

// ==========================================

function Ninja_ParticleSystem () {
    this.pointCloud;
    this.particles = new Array();
    this.forceFields = new  Array();
    this.Update = function () {
        for (var forceField in this.forceFields) {
            //console.log(forceField);
            for (var ninjaParticle in this.particles) {
                var difVector = new THREE.Vector3(0,0,0);
                difVector.subVectors(
                    this.forceFields[forceField].position,
                    this.particles[ninjaParticle].vertex
                );
                //difVector.add(this.particles[ninjaParticle].vertex);
                difVector.normalize();
                var distance = attraction / this.particles[ninjaParticle].vertex.distanceTo(this.forceFields[forceField].position);

                this.particles[ninjaParticle].vertex.add(new THREE.Vector3(
                    difVector.x * distance,
                    difVector.y * distance,
                    difVector.z * distance
                ));

            }
        }
        this.pointCloud.geometry.verticesNeedUpdate = true;
    }

    this.AddForceField = function (_forceField) {
        this.forceFields.push(_forceField);
    }
}

// ===========================================

function NinjaParticle (_vertex) {
    this.vertex = _vertex;
    this.velocity = new THREE.Vector3(0,0,0);
}

function ForceField_Magnet (_position, _magnitude) {
    this.position = _position;
    this.magnitude = _magnitude;
}

});
