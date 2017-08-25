function addBox(x, y, z, w, h, d, color){
    var addGeo = new THREE.BoxBufferGeometry( w, h, d );
    var addMat = new THREE.MeshBasicMaterial( { color: color } );
    var addMesh = new THREE.Mesh( addGeo, addMat );
    addMesh.geometry.computeBoundingBox();
    addMesh.castShadow = true;
    addMesh.receiveShadow = true;
    addMesh.position.set(x, y, z);
    scene.add( addMesh );
    console.log(addMesh);
    return addMesh;
}
    

function getCenterPoint(mesh) {
    var middle = new THREE.Vector3();
    var geometry = mesh.geometry;

    geometry.computeBoundingBox();

    middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
    middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
    middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

    mesh.localToWorld( middle );
    return middle;
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function calculateDimensions(_object) {
    
        var absoluteMinX = 0, absoluteMaxX = 0, absoluteMinY = 0, absoluteMaxY = 0, absoluteMinZ = 0, absoluteMaxZ = 0;
    
        for (var i = 0; i < _object.children.length; i++) {
            _object.children[i].geometry.computeBoundingBox();
            absoluteMinX = Math.min(absoluteMinX,_object.children[i].geometry.boundingBox.min.x);
            absoluteMaxX = Math.max(absoluteMaxX,_object.children[i].geometry.boundingBox.max.x);
            absoluteMinY = Math.min(absoluteMinY,_object.children[i].geometry.boundingBox.min.y);
            absoluteMaxY = Math.max(absoluteMaxY,_object.children[i].geometry.boundingBox.max.y);
            absoluteMinZ = Math.min(absoluteMinZ,_object.children[i].geometry.boundingBox.min.z);
            absoluteMaxZ = Math.max(absoluteMaxZ,_object.children[i].geometry.boundingBox.max.z);
        }
    
        // set generic height and width values
        _object.depth = (absoluteMaxX - absoluteMinX) * _object.scale.x;
        _object.height = (absoluteMaxY - absoluteMinY) * _object.scale.y;
        _object.width = (absoluteMaxZ - absoluteMinZ) * _object.scale.z;
    
        // remember the original dimensions
        if (_object.originalDepth === undefined) _object.originalDepth = _object.depth;
        if (_object.originalHeight === undefined) _object.originalHeight = _object.height;
        if (_object.originalWidth === undefined) _object.originalWidth = _object.width;
    
        console.log("Depth: " + _object.depth + ", Height: " + _object.height + ", Width: " + _object.width);
    }