var Viewer_Namespace = {
    running:false,
    container:'',
    stats:'',
    wsize : 600,
    hsize : 400,
    bedSizeW : 200,
    bedSizeH : 200,
    printerHeight : 200,
    camera:'', cameraTarget:'', scene:'', renderer:'', controls:'', dirLight:'', dirLightHeper:'', hemiLight:'', hemiLightHelper:'',
    id_animate:'',
    gcode:'',

    show_model:'',

    init_3D_viewer :function(filePath, target) {
        
        var targetElement =  target;
        Viewer_Namespace.container = document.createElement( 'div' );
        targetElement.appendChild( Viewer_Namespace.container );

        //camera
        Viewer_Namespace.camera = new THREE.PerspectiveCamera( 35, Viewer_Namespace.wsize / Viewer_Namespace.hsize, 1, 1000000 );
        Viewer_Namespace.camera.position.set( 40, 40 , 40 );
        Viewer_Namespace.cameraTarget = new THREE.Vector3( 0,0,0 );
        

        Viewer_Namespace.scene = new THREE.Scene();
        Viewer_Namespace.scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );

        // Bed
        var plane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( Viewer_Namespace.bedSizeW, Viewer_Namespace.bedSizeW ), new THREE.MeshNormalMaterial()
            //new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } )
        );
        plane.position.set(0,-0.1, 0);
        Viewer_Namespace.rotateObject( plane, 90, 180 ,0);
        Viewer_Namespace.scene.add( plane );
        //plane.receiveShadow = true;

        // max height
        var sizeheight = Viewer_Namespace.bedSizeW;
        var divisionsheight = 2;
        var gridHelperheight = new THREE.GridHelper( sizeheight, divisionsheight );
        gridHelperheight.position.set(0, Viewer_Namespace.printerHeight, 0);
        Viewer_Namespace.scene.add( gridHelperheight );

        //grid
        var size = Viewer_Namespace.bedSizeW;
        var divisions = Viewer_Namespace.bedSizeW;
        var gridHelper = new THREE.GridHelper( size, divisions );
        Viewer_Namespace.scene.add( gridHelper );

        //add file to scene
        Viewer_Namespace.addFile(filePath);
        
        // Lights

        //hemiLight
        Viewer_Namespace.hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
        Viewer_Namespace.hemiLight.color.setHSL( 0.6, 1, 0.6 );
        Viewer_Namespace.hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
        Viewer_Namespace.hemiLight.position.set( 0, 50, 0 );
        //Viewer_Namespace.scene.add( Viewer_Namespace.hemiLight );
        Viewer_Namespace.hemiLightHelper = new THREE.HemisphereLightHelper( Viewer_Namespace.hemiLight, 10 );
        //scene.add( hemiLightHelper );

        //dirLight
        Viewer_Namespace.dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
        Viewer_Namespace.dirLight.color.setHSL( 0.1, 1, 0.95 );
        Viewer_Namespace.dirLight.position.set( -1, 1, 1 );
        Viewer_Namespace.dirLight.position.multiplyScalar( 20 );
        //Viewer_Namespace.scene.add( Viewer_Namespace.dirLight );
        //Viewer_Namespace.dirLight.castShadow = true;
        //Viewer_Namespace.dirLight.shadow.mapSize.width = 2048;
        //Viewer_Namespace.dirLight.shadow.mapSize.height = 2048;
        var d = 50;
        //Viewer_Namespace.dirLight.shadow.camera.left = -d;
        //Viewer_Namespace.dirLight.shadow.camera.right = d;
        //Viewer_Namespace.dirLight.shadow.camera.top = d;
        //Viewer_Namespace.dirLight.shadow.camera.bottom = -d;
        //Viewer_Namespace.dirLight.shadow.camera.far = 3500;
        //iewer_Namespace.dirLight.shadow.bias = -0.0001;
        Viewer_Namespace.dirLightHeper = new THREE.DirectionalLightHelper( Viewer_Namespace.dirLight, 10 ) 
        //scene.add( dirLightHeper );

        //skydom
        var vertexShader = document.getElementById( 'vertexShader' ).textContent;
        var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
        var uniforms = {
            topColor:    { value: new THREE.Color( 0x0077ff ) },
            bottomColor: { value: new THREE.Color( 0xffffff ) },
            offset:      { value: 33 },
            exponent:    { value: 0.6 }
        };
        uniforms.topColor.value.copy( Viewer_Namespace.hemiLight.color );
        var skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
        //var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );
        var skyMat =new THREE.MeshNormalMaterial();
        var sky = new THREE.Mesh( skyGeo, skyMat );
        Viewer_Namespace.scene.add( sky );

        // Viewer_Namespace.renderer
        Viewer_Namespace.renderer = new THREE.WebGLRenderer( { antialias: true } );
        Viewer_Namespace.renderer.setPixelRatio( window.devicePixelRatio );
        Viewer_Namespace.renderer.setSize( Viewer_Namespace.wsize, Viewer_Namespace.hsize );
        //Viewer_Namespace.renderer.gammaInput = true;
        //Viewer_Namespace.renderer.gammaOutput = true;
        //Viewer_Namespace.renderer.shadowMap.enabled = true;
        //Viewer_Namespace.renderer.shadowMap.renderReverseSided = false;
        Viewer_Namespace.container.appendChild( Viewer_Namespace.renderer.domElement );

        //Viewer_Namespace.controls
        Viewer_Namespace.controls = new THREE.OrbitControls( Viewer_Namespace.camera, Viewer_Namespace.renderer.domElement );
        Viewer_Namespace.controls.addEventListener( 'change', Viewer_Namespace.render );
        Viewer_Namespace.controls.enableDamping = true;
        Viewer_Namespace.controls.dampingFactor = 0.25;
        Viewer_Namespace.controls.enableZoom = true;
        Viewer_Namespace.controls.maxPolarAngle = Math.PI*0.48; 
    },


    animate_3D_viewer : function() {
        Viewer_Namespace.running = true;
        Viewer_Namespace.id_animate = requestAnimationFrame( Viewer_Namespace.animate_3D_viewer );
        Viewer_Namespace.render();
        Viewer_Namespace.controls.update();
    },

    render : function() {
        if(Viewer_Namespace.scene){
            var timer = Date.now() * 0.0002;
            if(Viewer_Namespace.show_model){
                //show_model.rotation.set( 0, timer*Math.PI / 2, 0 );
                //rotateObject(show_model, 0, 0, timer*0.000000001);
            }
            Viewer_Namespace.camera.lookAt( Viewer_Namespace.cameraTarget );
            Viewer_Namespace.renderer.render( Viewer_Namespace.scene, Viewer_Namespace.camera );
        }
    },

    rotateObject : function(object,degreeX=0, degreeY=0, degreeZ=0){

        degreeX = (degreeX * Math.PI)/180;
        degreeY = (degreeY * Math.PI)/180;
        degreeZ = (degreeZ * Math.PI)/180;

        object.rotateX(degreeX);
        object.rotateY(degreeY);
        object.rotateZ(degreeZ);

    },




    isTooBig : function(obj){
        var objBox = new THREE.Box3().setFromObject(obj);
        var maxHeight = Math.abs(objBox.max.y-objBox.min.y);
        var maxWidth = Math.abs(objBox.max.x-objBox.min.x);
        var maxDepth = Math.abs(objBox.max.z-objBox.min.z);

        if(  maxHeight > Viewer_Namespace.printerHeight  ||  maxWidth > Viewer_Namespace.bedSizeW ||  maxDepth > Viewer_Namespace.bedSizeW){
            return true;
        }else{
            return false;
        }

        console.log(maxHeight, maxWidth , maxDepth);
    },
        



    addFile : function(filePath){
        $('.featherlight-content .loading').fadeIn();
        if(filePath.indexOf('.stl') !== -1){ //stl file

            var loader = new THREE.STLLoader();
            loader.load( filePath, function ( geometry ) {
                //var material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } );
                var material = new THREE.MeshNormalMaterial();
                var mesh = new THREE.Mesh( geometry, material );
                //mesh.castShadow = true;
                //mesh.receiveShadow = true;
                Viewer_Namespace.scene.add( mesh );
        
                Viewer_Namespace.rotateObject(mesh, -90, 0, 0);
                mesh.geometry.computeBoundingBox();

                var bbox = new THREE.Box3().setFromObject(mesh);
                if(bbox.getCenter().y < 0.001 ){
                    mesh.position.set( -bbox.getCenter().x, bbox.max.y,  -bbox.getCenter().z );
                }else{
                    mesh.position.set( -bbox.getCenter().x, 0.001,  -bbox.getCenter().z );
                }

                Viewer_Namespace.cameraTarget = new THREE.Vector3( 0,bbox.max.y/2,0 );
                Viewer_Namespace.show_model = mesh;

                if( Viewer_Namespace.isTooBig(mesh) ){
                    $('.featherlight-content .warning').html("<p>Warning : The file is too big for this printer, you will have to scale it down</p>");
                    $('.featherlight-content .warning').fadeIn();
                }

                $('.featherlight-content .loading').fadeOut();
            } );
        
        }else if(filePath.indexOf('.gcode') !== -1){ //gcode file

            var loader = new THREE.GCODELoader();
            loader.load( filePath, function ( geometry ) {
                var mesh = new THREE.Mesh();
                $.each(geometry, function(index, layer){
                    var geometry = layer;
                    //var material = new THREE.LineBasicMaterial( {color: 0x003300, opacity:0.4} );
                    var material = new THREE.MeshNormalMaterial();
                    var layer_line = new THREE.Line( geometry, material );
                    mesh.add( layer_line );
                });

                Viewer_Namespace.scene.add( mesh );
                var bbox = new THREE.Box3().setFromObject(mesh);
                mesh.position.set( -bbox.getCenter().x, 0,  -bbox.getCenter().z );

                Viewer_Namespace.cameraTarget = new THREE.Vector3( 0,bbox.max.y/2,0 );
                Viewer_Namespace.show_model = mesh;  
                $('.featherlight-content .warning').append("<p>Warning : Only use this GCODE if set for this printer !</p>");            
                if( Viewer_Namespace.isTooBig(mesh) ){
                    $('.featherlight-content .warning').append("<p>Warning : The file is too big for this printer, you will have to scale it down</p>");
                }
                $('.featherlight-content .warning').fadeIn();
                $('.featherlight-content .loading').fadeOut();
            } );
        }
    },


    kill : function(){
        Viewer_Namespace.running = false;
        Viewer_Namespace.show_model.geometry.dispose();
        Viewer_Namespace.show_model.material.dispose();


        Viewer_Namespace.scene.remove( Viewer_Namespace.show_model );				
        
        
        
        Viewer_Namespace.renderer.dispose( Viewer_Namespace.show_model );
        Viewer_Namespace.renderer.dispose( Viewer_Namespace.show_model.geometry);
        Viewer_Namespace.renderer.dispose( Viewer_Namespace.show_model.material);

        cancelAnimationFrame( Viewer_Namespace.id_animate );

        Viewer_Namespace.show_model = null;
        Viewer_Namespace.camera= null;
        Viewer_Namespace.cameraTarget= null;
        Viewer_Namespace.scene= null;
        Viewer_Namespace.renderer= null;
        Viewer_Namespace.controls= null;
        Viewer_Namespace.dirLight= null;
        Viewer_Namespace.dirLightHeper= null;
        Viewer_Namespace.hemiLight= null;
        Viewer_Namespace.hemiLightHelper= null;
    }
};
