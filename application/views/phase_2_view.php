<link rel="stylesheet" type="text/css" href="<?php echo base_url("assets/css/phase_2_style.css"); ?><?php echo '?'.mt_rand(); ?>" >

<script src="<?php echo base_url("assets/3D_Editor/three.min.js"); ?><?php echo '?'.mt_rand(); ?>" ></script>
<script src="<?php echo base_url("assets/3D_Editor/STLLoader.js"); ?><?php echo '?'.mt_rand(); ?>" ></script>
<script src="<?php echo base_url("assets/3D_Editor/OBJLoader.js"); ?><?php echo '?'.mt_rand(); ?>" ></script>
<script src="<?php echo base_url("assets/3D_Editor/GCODELoader.js"); ?><?php echo '?'.mt_rand(); ?>" ></script>
<script src="<?php echo base_url("assets/3D_Editor/Detector.js"); ?><?php echo '?'.mt_rand(); ?>"></script>
<script src="<?php echo base_url("assets/3D_Editor/stats.min.js"); ?><?php echo '?'.mt_rand(); ?>"></script>
<script src="<?php echo base_url("assets/3D_Editor/OrbitControls.js"); ?><?php echo '?'.mt_rand(); ?>"></script>
<script src="<?php echo base_url("assets/3D_Editor/SimplifyModifier.js"); ?><?php echo '?'.mt_rand(); ?>"></script>
<script src="<?php echo base_url("assets/3D_Editor/3D_Editor.js"); ?><?php echo '?'.mt_rand(); ?>"></script>


<script type="x-shader/x-vertex" id="vertexShader">
			varying vec3 vWorldPosition;
			void main() {
				vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
				vWorldPosition = worldPosition.xyz;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}
</script>

<script type="x-shader/x-fragment" id="fragmentShader">
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;
    varying vec3 vWorldPosition;
    void main() {
        float h = normalize( vWorldPosition + offset ).y;
        gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
    }
</script>

<div class="content phase_2_content">
    <div class="no_file_selected">
        <p>You have to select at least one file to print</p>
        <p>Go back to Phase 1 :)</p>
    </div>

    <div id="3D_canvas"></div>
    <div class="scale">
        <div class="big_icon"><i class="fa fa-cube" aria-hidden="true"></i></div>
        <div class="ruler">
            <div class="support"></div>
            <div class="handle"><i class="fa fa-circle" aria-hidden="true"></i></div>
        </div>
        <div class="small_icon"><i class="fa fa-cube" aria-hidden="true"></i></div>
        <div class="reset_scale">Reset Scale</div>
    </div>
    <div class="position">
        <div class="arrow up"><i class="fa fa-caret-up" aria-hidden="true"></i></div>
        <div class="arrow right"><i class="fa fa-caret-right" aria-hidden="true"></i></div>
        <div class="arrow down"><i class="fa fa-caret-down" aria-hidden="true"></i></div>
        <div class="arrow left"><i class="fa fa-caret-left" aria-hidden="true"></i></div>
        <div class="reset_pos">Reset</div>
    </div>
    <div class="rotation">
        <div class='container'>
            <div id='circle'>
                <div id='slider'><span></span></div>
                <div class='axis_selector yaxis selected'>Y</div>
                <div class='axis_selector xaxis'>X</div>
                <div class='axis_selector zaxis'>Z</div>
            </div>
        </div>
    </div>
    <div class="reset_rotation" >Reset All Rotation</div>
    <div class="name">
        <div class="previous"><i class="fa fa-caret-square-o-left" aria-hidden="true"></i></div>
        <div class="info"></div>
        <div class="next"><i class="fa fa-caret-square-o-right" aria-hidden="true"></i></div>
    </div>
    <div class="select_group"><i class="fa fa-object-group" aria-hidden="true"></i><span>Select all objects</span></div>
    <div class="duplicate"></div>
    <div class="go_phase_3"></div>
    <div class="loading"><i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></div>
</div>
<script>
    if(selected_file.length > 0){
        $('.no_file_selected').hide();
    }

    if(selected_file.length > 0){
        if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
        Editor_Namespace.init_3D_viewer( selected_file , document.getElementById("3D_canvas") );
        Editor_Namespace.animate_3D_viewer();
    }

    var refreshIntervalId;
    var direction;
    $('.arrow').on('touchstart mousedown', function(){
        direction =  $(this).attr('class').split(" ")[1];
        refreshIntervalId = setInterval( Editor_Namespace.setSelectedPosition, 50);
    }).on('touchend mouseup', function(){
        clearInterval(refreshIntervalId);
    });

    $('.reset_pos').on('touchstart mousedown', function(){
        Editor_Namespace.resetSelectedPosition();
    });

    var val = 0;
    $('.phase_2_content .ruler .handle').on('touchstart mousedown', function(e){
        e.preventDefault();
        var drag = true;
        $(document).on('touchmove mousemove', function(e){
            var ev;
            if(e.type=='touchmove'){
                ev = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
            }else{
                ev = e;
            }
            if(drag){
                var offset =  $('.phase_2_content .ruler').offset();
                var relativeY = (ev.pageY - offset.top);

                if( relativeY > 7 &&  relativeY < 290 ){
                    val = relativeY;
                }else if(relativeY < 7 ){
                    val =  7;
                }else if( relativeY < 290 ){
                    val = relativeY;
                }else if(relativeY > 290){
                    val =  290;
                }
                $('.phase_2_content .ruler .handle').css('top', val-15  );
                var scale = ( 2 - ( ( ( ( parseInt($('.phase_2_content .ruler .handle').css('top'))+8)*400)/283 )/200 ) ).toFixed(2);
                Editor_Namespace.setSelectedScale(scale);
                
                //var relativeX = (e.pageX - offset.left);
            }
        });
        $(document).on('touchend mouseup', function(){
            drag = false;
        });
    });


    function setSliderScale(scale){
        var scalePx = ( ( 283 - 8 )/2 ) * (2-scale);
        $('.phase_2_content .ruler .handle').css('top', scalePx);
    }

    $('.select_group').on('click', function(){
        Editor_Namespace.clickSelectedObj(Editor_Namespace.objects_group);
    });

    $('.name .previous').on('click', function(){
        var cur  = Editor_Namespace.objects_ar.indexOf(Editor_Namespace.selected);
        if(cur > -1){
            if(cur-1 <0){
                cur = Editor_Namespace.objects_ar.length-1;
            }else{
                cur -= 1;
            }
            Editor_Namespace.clickSelectedObj(Editor_Namespace.objects_ar[ cur ] );
        }else{
            Editor_Namespace.clickSelectedObj( Editor_Namespace.objects_ar[0] );
        }
    });

    $('.name .next').on('click', function(){
        var cur  = Editor_Namespace.objects_ar.indexOf(Editor_Namespace.selected);
        if(cur > -1){
            if(cur+1 > Editor_Namespace.objects_ar.length-1){
                cur = 0;
            }else{
                cur +=1;
            }
            Editor_Namespace.clickSelectedObj(Editor_Namespace.objects_ar[ cur ] );
        }else{
            Editor_Namespace.clickSelectedObj( Editor_Namespace.objects_ar[0] );
        }
    });
    

    var current_axis = 'y';
    
    function setRotationRotation(rad){
        var slider = $('#slider');
        var sliderW2 = slider.width()/2;
        var sliderH2 = slider.height()/2;    
        var radius =( $('#circle').width()/2 ) ;
        var deg = rad*(180/Math.PI);
        X = Math.round(radius* Math.sin(deg*Math.PI/180));    
        Y = Math.round(radius*  -Math.cos(deg*Math.PI/180));
        slider.css({ left: X+radius-sliderW2, top: Y+radius-sliderH2 });   
        slider.find('span').html( deg.toFixed(1)+'°' );
    }

    $('.phase_2_content .rotation .axis_selector').on('touchstart mousedown', function(){
        $('.axis_selector').removeClass('selected');
        $(this).addClass('selected');
        if($(this).html() == 'Y'){
            current_axis = 'y'; 
        }else if($(this).html() == 'X'){
            current_axis = 'x'; 
        }else{
            current_axis = 'z'; 
        }
        var rot;
        if(Editor_Namespace.selected.rotationOrigin){
            rot =  Editor_Namespace.selected.rotation[current_axis] + (-Editor_Namespace.selected.rotationOrigin[current_axis]); 
        }else{
            rot =  Editor_Namespace.selected.rotation[current_axis];
        }
        setRotationRotation(rot);
    })

    $('.reset_rotation').on('click', function(){
        var rx = 0, ry = 0, rz = 0;
        if(Editor_Namespace.selected.rotationOrigin){
            rx = 360-(0 + (-Editor_Namespace.selected.rotationOrigin["x"])*(180/Math.PI) );
            ry = 360-(0 + (-Editor_Namespace.selected.rotationOrigin["y"])*(180/Math.PI) );
            rz = 360-(0 + (-Editor_Namespace.selected.rotationOrigin["z"])*(180/Math.PI) );
        }
        Editor_Namespace.setSelectedRotation(rx, 'x');
        Editor_Namespace.setSelectedRotation(ry, 'z');
        Editor_Namespace.setSelectedRotation(rz, 'y');
        setRotationRotation(0);
    });

    $('.reset_scale').on('click', function(){
        Editor_Namespace.setSelectedScale(1);
        setSliderScale(1);
    })

    $('.phase_2_content .rotation #slider').on('touchstart mousedown', function(e){
        var container = $('#circle');
        var slider = $('#slider');
        var sliderW2 = slider.width()/2;
        var sliderH2 = slider.height()/2;    
        var radius =( $('#circle').width()/2 ) ;
        var deg = 0;    
        var elP = $('#circle').offset();
        var elPos = { x: elP.left, y: elP.top};
        var X = 0, Y = 0;
        var mdown = false;

        var drag = true;
        $(document).on('touchmove mousemove', function(e){
            if(drag){
               var mPos = {x: e.clientX-elPos.x, y: e.clientY-elPos.y};
               var atan = Math.atan2(mPos.x-radius, mPos.y-radius);
                  
               deg = parseInt( (-atan/(Math.PI/180) + 180)/5 )*5;
                
               X = Math.round(radius* Math.sin(deg*Math.PI/180));    
               Y = Math.round(radius*  -Math.cos(deg*Math.PI/180));
               slider.css({ left: X+radius-sliderW2, top: Y+radius-sliderH2 });
               
               slider.find('span').html( deg.toFixed(1)+'°' ); 
               
               var rot;
               if(Editor_Namespace.selected.rotationOrigin){
                    rot = 360-(deg + (-Editor_Namespace.selected.rotationOrigin[current_axis])*(180/Math.PI) );
                    console.log(rot); 
                }else{
                    rot =  deg;
                }

               Editor_Namespace.setSelectedRotation(deg, current_axis);
            }
        });
        $(document).on('touchend mouseup', function(){
            drag = false;
        });
    });

</script>