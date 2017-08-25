var Editor_Namespace = {
        running :false,
        container:'',
        stats:'',
        wsize : window.innerWidth,
        hsize : ( window.innerHeight-$('.header').height() ),
        bedSizeW : 200,
        bedSizeH : 200,
        printerHeight : 200,
        object_color:0x3355ff,
        select_color:0xff5533,
        camera:'',simplifyModifer:'', cameraTarget:'', scene:'', renderer:'', controls:'', dirLight:'', dirLightHeper:'', hemiLight:'', hemiLightHelper:'',
        id_animate:'',
        gcode:'',
        moveSpeed :1,
        selected:'',
        objects_ar:[],
        faceAr : [],
        objects_group:'',
        helperBox:[],
    
        init_3D_viewer :function(files_path, target) {
            
            var targetElement =  target;
            Editor_Namespace.container = document.createElement( 'div' );
            targetElement.appendChild( Editor_Namespace.container );
    
            //camera
            Editor_Namespace.camera = new THREE.PerspectiveCamera( 35, Editor_Namespace.wsize / Editor_Namespace.hsize, 1, 1000000 );
            Editor_Namespace.camera.position.set( 50, 100 , 300 );
            Editor_Namespace.cameraTarget = new THREE.Vector3( 0,0,0 );
            
            //modifier
            Editor_Namespace.simplifyModifer = new THREE.SimplifyModifier();
    
            Editor_Namespace.scene = new THREE.Scene();
            Editor_Namespace.scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
    
            // Bed
            var plane = new THREE.Mesh(
                new THREE.PlaneBufferGeometry( Editor_Namespace.bedSizeW, Editor_Namespace.bedSizeW ),
                new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } )
            );
            plane.position.set(0,0, 0);
            Editor_Namespace.rotateObject( plane, 90, 180 ,0);
            Editor_Namespace.scene.add( plane );
            plane.receiveShadow = true;


            Editor_Namespace.addPrinterLimitFace(0, Editor_Namespace.printerHeight/2, Editor_Namespace.bedSizeW/2,  Editor_Namespace.printerHeight, Editor_Namespace.bedSizeW, 1 , 0x555555); //debug
            Editor_Namespace.addPrinterLimitFace(0, Editor_Namespace.printerHeight/2, -Editor_Namespace.bedSizeW/2,  Editor_Namespace.printerHeight, Editor_Namespace.bedSizeW, 1, 0x555555 );

            Editor_Namespace.addPrinterLimitFace(Editor_Namespace.bedSizeH/2, Editor_Namespace.printerHeight/2, 0, 1,  Editor_Namespace.printerHeight, Editor_Namespace.bedSizeH , 0x555555); //debug
            Editor_Namespace.addPrinterLimitFace(-Editor_Namespace.bedSizeH/2, Editor_Namespace.printerHeight/2, 0, 1,  Editor_Namespace.printerHeight, Editor_Namespace.bedSizeH, 0x555555 );

            Editor_Namespace.addPrinterLimitFace(0,Editor_Namespace. printerHeight, 0, Editor_Namespace.bedSizeW, 1, Editor_Namespace.bedSizeH, 0x555555 );
            
            /*
            var plane = new THREE.Mesh(
                new THREE.PlaneBufferGeometry( Editor_Namespace.bedSizeW, Editor_Namespace.bedSizeW ),
                new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010, side: THREE.DoubleSide } )
            );
            plane.position.set( 0, Editor_Namespace.printerHeight/2 , -Editor_Namespace.bedSizeH/2);
            Editor_Namespace.rotateObject( plane, 0, 0 ,0);
            Editor_Namespace.scene.add( plane );
            plane.receiveShadow = true;*/
    
            // max height
            var sizeheight = Editor_Namespace.bedSizeW;
            var divisionsheight = 2;
            var gridHelperheight = new THREE.GridHelper( sizeheight, divisionsheight );
            gridHelperheight.position.set(0, Editor_Namespace.printerHeight, 0);
            Editor_Namespace.scene.add( gridHelperheight );
    
            //grid
            var size = Editor_Namespace.bedSizeW;
            var divisions = Editor_Namespace.bedSizeW;
            var gridHelper = new THREE.GridHelper( size, divisions );
            Editor_Namespace.scene.add( gridHelper );

            //get spawn point for One or more 3D objects
            var spawnPoint = Editor_Namespace.getSpawnPoint(files_path.length);
    
            //add file to scene
            Editor_Namespace.addFiles(files_path);
            
            // Lights
    
            //hemiLight
            Editor_Namespace.hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
            Editor_Namespace.hemiLight.color.setHSL( 0.6, 1, 0.6 );
            Editor_Namespace.hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
            Editor_Namespace.hemiLight.position.set( 0, 50, 0 );
            Editor_Namespace.scene.add( Editor_Namespace.hemiLight );
            Editor_Namespace.hemiLightHelper = new THREE.HemisphereLightHelper( Editor_Namespace.hemiLight, 10 );
            //scene.add( hemiLightHelper );
    
            //dirLight
            Editor_Namespace.dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
            Editor_Namespace.dirLight.color.setHSL( 0.1, 1, 0.95 );
            Editor_Namespace.dirLight.position.set( -1, 1, 1 );
            Editor_Namespace.dirLight.position.multiplyScalar( 20 );
            Editor_Namespace.scene.add( Editor_Namespace.dirLight );
            Editor_Namespace.dirLight.castShadow = true;
            Editor_Namespace.dirLight.shadow.mapSize.width = 2048;
            Editor_Namespace.dirLight.shadow.mapSize.height = 2048;
            var d = 50;
            Editor_Namespace.dirLight.shadow.camera.left = -d;
            Editor_Namespace.dirLight.shadow.camera.right = d;
            Editor_Namespace.dirLight.shadow.camera.top = d;
            Editor_Namespace.dirLight.shadow.camera.bottom = -d;
            Editor_Namespace.dirLight.shadow.camera.far = 3500;
            Editor_Namespace.dirLight.shadow.bias = -0.0001;
            Editor_Namespace.dirLightHeper = new THREE.DirectionalLightHelper( Editor_Namespace.dirLight, 10 ) 
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
            uniforms.topColor.value.copy( Editor_Namespace.hemiLight.color );
            var skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
            var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );
            var sky = new THREE.Mesh( skyGeo, skyMat );
            Editor_Namespace.scene.add( sky );
    
            // Editor_Namespace.renderer
            Editor_Namespace.renderer = new THREE.WebGLRenderer( { antialias: false } );
            Editor_Namespace.renderer.setPixelRatio( window.devicePixelRatio );
            Editor_Namespace.renderer.setSize( Editor_Namespace.wsize, Editor_Namespace.hsize );
            //Editor_Namespace.renderer.gammaInput = true;
            //Editor_Namespace.renderer.gammaOutput = true;
            //Editor_Namespace.renderer.shadowMap.enabled = true;
            //Editor_Namespace.renderer.shadowMap.renderReverseSided = false;
            Editor_Namespace.container.appendChild( Editor_Namespace.renderer.domElement );
    
            //Editor_Namespace.controls
            Editor_Namespace.controls = new THREE.OrbitControls( Editor_Namespace.camera, Editor_Namespace.renderer.domElement );
            Editor_Namespace.controls.addEventListener( 'change', Editor_Namespace.render );
            //Editor_Namespace.controls.enableDamping = false;
            //Editor_Namespace.controls.dampingFactor = 0.25;
            Editor_Namespace.controls.enableZoom = true;
            //Editor_Namespace.controls.maxPolarAngle = Math.PI*0.48; 


            $( window ).resize(function() { 
                Editor_Namespace.onWindowResize();
            });

            $('.phase_2_content canvas').on('touchstart mousedown', function(e){
                var ev;
                if(e.type=='touchmove'){
                    ev = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                }else{
                    ev = e;
                }
                var mouse3D = new THREE.Vector3( (  ev.clientX / window.innerWidth ) * 2 - 1,   
                                        -(   ev.clientY / window.innerHeight ) * 2 + 1,  
                                        0.5 );     
                var raycaster =  new THREE.Raycaster();                                        
                raycaster.setFromCamera( mouse3D,  Editor_Namespace.camera );
                var intersects = raycaster.intersectObjects( Editor_Namespace.objects_ar );
                if ( intersects.length > 0 ) {
                    Editor_Namespace.clickSelectedObj(intersects[0].object);
                }
            }); 
        },

        detectCollision : function(){
            var selectedBox =  new THREE.Box3().setFromObject(Editor_Namespace.selected);
            var col_ar =  Editor_Namespace.objects_ar.concat(Editor_Namespace.faceAr);
            console.log(col_ar);
            $.each(col_ar, function(index, item){
                if(item.uuid != Editor_Namespace.selected.uuid){
                    var currentBox =  new THREE.Box3().setFromObject(item);
                    var inter = selectedBox.intersect(currentBox).getCenter();
                    item.helper.visible = false;
                    Editor_Namespace.selected.helper.visible = false;
                    if(inter.x != 0 || inter.z != 0){
                        item.helper.visible = true;
                        Editor_Namespace.selected.helper.visible = true;
                        item.helper.update();
                        Editor_Namespace.selected.helper.update();
                    }
                } 
            });
        },

        clickSelectedObj : function(obj){
            Editor_Namespace.selected = obj;
            
            
            var objBox = new THREE.Box3().setFromObject(obj);

            Editor_Namespace.cameraTarget = new THREE.Vector3( objBox.getCenter().x,0,objBox.getCenter().z );
            Editor_Namespace.controls.target = new THREE.Vector3( objBox.getCenter().x,0,objBox.getCenter().z );
            setSliderScale(Editor_Namespace.selected.scale.x);
            setRotationRotation(Editor_Namespace.selected.rotation[current_axis]);
            
            $.each(Editor_Namespace.objects_ar, function(index, obj){
                obj.material.color.setHex(Editor_Namespace.object_color);
            });
            
            if(Editor_Namespace.selected.material){
                Editor_Namespace.selected.material.color.setHex(Editor_Namespace.select_color);
            }else{
                $.each(Editor_Namespace.selected.children[0].children, function(index,obj){
                    obj.material.color.setHex(Editor_Namespace.select_color);
                });
            }


            $('.name .info').html('<span>'+Editor_Namespace.selected.fileName.split('/')[Editor_Namespace.selected.fileName.split('/').length-1]+'</span>');
        },

        testCheckPoint : function(X, Y, size, step){
            //grid for multiple object positioning
            var size = size/step;
            var pointAR = [];
            var divisions = step;
            var gridHelper = new THREE.GridHelper( size, divisions , 0xff0000);
            gridHelper.position.set(X, 30, Y);          
            var gridAr = gridHelper.geometry.attributes.position.array;
            
            var array =  Array.prototype.slice.call(gridAr);

            for( var i = 0; i < array.length ; i += 3){
                
                if( Math.abs( array[i] ) ==  size/2 && Math.abs( array[i+2] ) ==  size/2 ){
                    
                    var tX = array[i] + X;
                    var tY = array[i+1] + 0;
                    var tZ = array[i+2] + Y;
                    if( Editor_Namespace.testIfArContains( pointAR , [tX, tY, tZ] ).length == 0 ){
                        pointAR.push( [tX, tY, tZ] );
                    }
                }
            }
            return pointAR;
        },

        getSpawnPoint :function(nb){
            if(nb == 0){
                return [];
            }

            if(nb == 1){
                return [[0,0,0]];
            }

            var power = 0;
            while(nb > Math.pow(4, power)){
                power += 1;
            }
            
            var testResAr = [];
            var lastTest = [[[0, 0, 0]]];
            for(var i = 0; i< power;i++){
                testResAr.push([]);
                
                $.each( lastTest ,  function(index, test){
                    $.each( test ,  function(index, vector){
                        var size = Editor_Namespace.bedSizeW;
                        testResAr[i].push( Editor_Namespace.testCheckPoint( 0+ vector[0] ,0+vector[2], size*2, Math.pow(2, 2+i)) );
                    });
                });
                
                lastTest = testResAr[i];
                
            }

            var total = [];
            $.each( testResAr[power-1],  function(index, item){
                $.each(item,  function(index, pts){
                    Editor_Namespace.addBox(pts[0], pts[1], pts[2], 1, 1, 1,0xff0000 ); //debug
                    total.push([pts[0], pts[1], pts[2]]);
                });
            });
           
            return total;
        },

        setSelectedScale :function(scale){
            console.log(  Editor_Namespace.selected);
            if(scale > 0.01){
                Editor_Namespace.selected.scale.set(scale, scale, scale);
            }

            Editor_Namespace.detectCollision();
        },

        setSelectedPosition : function(){
            
            switch(direction){
                case 'up':
                    Editor_Namespace.selected.position.set( Editor_Namespace.selected.position.x, Editor_Namespace.selected.position.y , Editor_Namespace.selected.position.z-Editor_Namespace.moveSpeed );
                    break;
                case 'right':
                    Editor_Namespace.selected.position.set( Editor_Namespace.selected.position.x+Editor_Namespace.moveSpeed , Editor_Namespace.selected.position.y , Editor_Namespace.selected.position.z);
                    break;
                case 'down':
                    Editor_Namespace.selected.position.set( Editor_Namespace.selected.position.x, Editor_Namespace.selected.position.y , Editor_Namespace.selected.position.z+Editor_Namespace.moveSpeed );
                    break;
                case 'left':
                    Editor_Namespace.selected.position.set( Editor_Namespace.selected.position.x-Editor_Namespace.moveSpeed , Editor_Namespace.selected.position.y , Editor_Namespace.selected.position.z);                
                    break;
            }

            Editor_Namespace.detectCollision(); 
        },

        resetSelectedPosition : function(){
            Editor_Namespace.selected.position.set( Editor_Namespace.selected.positionOrigin.x , Editor_Namespace.selected.positionOrigin.y, Editor_Namespace.selected.positionOrigin.z );
            Editor_Namespace.detectCollision();
        },

        setSelectedRotation :function(deg, axis){
                var rad = (deg * Math.PI)/180;
                var subject = Editor_Namespace.selected;
                if(axis == "z"){
                    subject.rotation.set( subject.rotation.x, subject.rotation.y , rad);
                }else if(axis == "x"){
                    subject.rotation.set( rad, subject.rotation.y, subject.rotation.z);
                }else if(axis == "y"){
                    subject.rotation.set( subject.rotation.x, rad, subject.rotation.z);
                }

                Editor_Namespace.detectCollision();
               
        },


        testIfArContains : function(arr, test) { 
            var matches = arr.filter(function(cur) {
                if( cur[0] == test[0] && cur[1] == test[1] && cur[2] == test[2]){
                    return test;
                }
            });
        
            return (matches.length > 0) ? matches : [];
        },
        

        addBox :function(x, y, z, w, h, d, color){
            var addGeo = new THREE.BoxBufferGeometry( w, h, d );
            var addMat = new THREE.MeshBasicMaterial( { color: color } );
            var addMesh = new THREE.Mesh( addGeo, addMat );
            addMesh.geometry.computeBoundingBox();
            addMesh.castShadow = true;
            addMesh.receiveShadow = true;
            addMesh.position.set(x, y, z);
            Editor_Namespace.scene.add( addMesh );
            return addMesh;
        },

        addPrinterLimitFace :function(x, y, z, w, h, d){
            var addGeo = new THREE.BoxBufferGeometry( w, h, d );
            var addMat = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
            var addMesh = new THREE.Mesh( addGeo, addMat );
            addMesh.position.set(x, y, z);
            var box = new THREE.BoxHelper(  addMesh, 0xffff00 );
            box.visible = false;
            addMesh.visible = false;
            Editor_Namespace.helperBox.push(box);
            addMesh["helper"] = box;
            Editor_Namespace.scene.add( box );
            Editor_Namespace.scene.add( addMesh );
            Editor_Namespace.faceAr.push(addMesh);

        },

        onWindowResize : function() {
            Editor_Namespace.camera.aspect = window.innerWidth / ( window.innerHeight-$('.header').height() );
            Editor_Namespace.camera.updateProjectionMatrix();
            Editor_Namespace.renderer.setSize( window.innerWidth, window.innerHeight-$('.header').height() );
        },
    
    
        animate_3D_viewer : function() {
            Editor_Namespace.running = true,
            Editor_Namespace.id_animate = requestAnimationFrame( Editor_Namespace.animate_3D_viewer );
            Editor_Namespace.render();
            Editor_Namespace.controls.update();
        },
    
        render : function() {
            if(Editor_Namespace.scene){
                var timer = Date.now() * 0.0002;
                
                Editor_Namespace.camera.lookAt( Editor_Namespace.cameraTarget );
                Editor_Namespace.renderer.render( Editor_Namespace.scene, Editor_Namespace.camera );
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
    
            if(  maxHeight > Editor_Namespace.printerHeight  ||  maxWidth > Editor_Namespace.bedSizeW ||  maxDepth > Editor_Namespace.bedSizeW){
                return true;
            }else{
                return false;
            }
    
            console.log(maxHeight, maxWidth , maxDepth);
        },
            
    
        addFiles : function(files_Path){
            $('.loading').fadeIn();
            var mesh_ar = [];
            
            $.each(files_Path, function(index, file){
                if(file.indexOf('.stl') !== -1){
                    var loader = new THREE.STLLoader();
                    loader.load( file, function ( geometry ) {
                        
                        var material = new THREE.MeshPhongMaterial( { color: Editor_Namespace.select_color, specular: 0x111111, shininess: 200 } );
                        var mesh = new THREE.Mesh( geometry, material );
                        mesh.castShadow = false;
                        mesh.receiveShadow = false;
                        
                
                        Editor_Namespace.rotateObject(mesh, -90, 0, 0);
                        mesh.geometry.computeBoundingBox();

                        mesh_ar.push( mesh );
                        mesh["fileName"] = file;

                        if(mesh_ar.length == files_Path.length){
                            var group = new THREE.Group();

                            var lastX = 0;
                            var lastZ = 0;
                            var biggest = 0;
                                
                            $.each(mesh_ar, function(index, item){
                                var objBox = new THREE.Box3().setFromObject(item);
                                var boxSize= objBox.getSize();
                                lastX += boxSize.x + 10;

                                if(  boxSize.z > biggest ){
                                    biggest = boxSize.z;
                                }
                                
                                if( index%3 == 0 && index != 0){
                                    lastX = boxSize.x;
                                    lastZ += biggest + 10;
                                }

                                var thisY = 0.1;
                                var thisX = (boxSize.x/2);
                                if( objBox.getCenter().y < 0.1  ){
                                    thisY = boxSize.y/2 - 0.1;
                                    thisX = boxSize.x;
                                }
                                item.position.set( lastX - thisX, thisY, lastZ-objBox.getCenter().z  );

                                var box = new THREE.BoxHelper(  item, 0xffff00 );
                                box.visible = false;
                                Editor_Namespace.helperBox.push(box);
                                item["helper"] = box;
                                Editor_Namespace.scene.add( box );
                                
                                
                                item["rotationOrigin"] = { "x":item.rotation['x'], "y":item.rotation['y'], "z":item.rotation['z'] };
                                item["positionOrigin"] = { "x":item.position['x'], "y":item.position['y'], "z":item.position['z'] };

                                var pivot = new THREE.Object3D();
                                pivot.position= objBox.getCenter();
                                pivot["positionOrigin"] = { "x":pivot.position['x'], "y":pivot.position['y'], "z":pivot.position['z'] };
                                
                                pivot.add(item);

                                group.add( pivot );                                
                            });
                            
                            var objBox = new THREE.Box3().setFromObject(group);
                            var boxSize= objBox.getSize();
                            
                            group.position.set( -objBox.getCenter().x, 0.00, -objBox.getCenter().z  );

                            var box = new THREE.BoxHelper(  group, 0xffff00 );
                            box.visible =false;
                            Editor_Namespace.helperBox.push(box);
                            Editor_Namespace.scene.add( box );
                            
                            Editor_Namespace.cameraTarget = new THREE.Vector3( 0,objBox.max.y/2,0 );
                            Editor_Namespace.objects_ar = mesh_ar;
                    
                            var pivot = new THREE.Object3D();
                            pivot.position= objBox.getCenter();
                            pivot.add(group);
                            pivot["positionOrigin"] = { "x":pivot.position['x'], "y":pivot.position['y'], "z":pivot.position['z'] };
                            
                            Editor_Namespace.scene.add(pivot);

                            Editor_Namespace.objects_group = pivot;
                            Editor_Namespace.selected = pivot;
                            setRotationRotation( Editor_Namespace.selected.rotation[current_axis] );
                            pivot["fileName"] = "Groupe";

                            $('.name .info').html('<span>'+pivot["fileName"]+'</span>');
                    
                            $('.loading').fadeOut();
                            console.log("loaded");
                        }
                    });
                }
            });
        },
    
    
        kill : function(){
            Editor_Namespace.running = false;
            /*
            Editor_Namespace.show_model.geometry.dispose();
            Editor_Namespace.show_model.material.dispose();
            Editor_Namespace.scene.remove( Editor_Namespace.show_model );				
            Editor_Namespace.renderer.dispose( Editor_Namespace.show_model );
            Editor_Namespace.renderer.dispose( Editor_Namespace.show_model.geometry);
            Editor_Namespace.renderer.dispose( Editor_Namespace.show_model.material);
            Editor_Namespace.show_model = null;
            */
            cancelAnimationFrame( Editor_Namespace.id_animate );
            
            Editor_Namespace.selected= null;
            Editor_Namespace.objects_ar= null;
            Editor_Namespace.objects_group= null;
            Editor_Namespace.camera= null;
            Editor_Namespace.cameraTarget= null;
            Editor_Namespace.scene= null;
            Editor_Namespace.renderer= null;
            Editor_Namespace.controls= null;
            Editor_Namespace.dirLight= null;
            Editor_Namespace.dirLightHeper= null;
            Editor_Namespace.hemiLight= null;
            Editor_Namespace.hemiLightHelper= null;
        }
    };
    