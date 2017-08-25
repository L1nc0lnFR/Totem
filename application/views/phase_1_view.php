
<link rel="stylesheet" type="text/css" href="<?php echo base_url("/assets/css/phase_1_style.css"); ?><?php echo '?'.mt_rand(); ?>" >

<script src="<?php echo base_url("/assets/3D_Viewer/three.min.js"); ?><?php echo '?'.mt_rand(); ?>" ></script>
<script src="<?php echo base_url("/assets/3D_Viewer/STLLoader.js"); ?><?php echo '?'.mt_rand(); ?>" ></script>
<script src="<?php echo base_url("/assets/3D_Viewer/OBJLoader.js"); ?><?php echo '?'.mt_rand(); ?>" ></script>
<script src="<?php echo base_url("/assets/3D_Viewer/GCODELoader.js"); ?><?php echo '?'.mt_rand(); ?>" ></script>
<script src="<?php echo base_url("/assets/3D_Viewer/Detector.js"); ?><?php echo '?'.mt_rand(); ?>"></script>
<script src="<?php echo base_url("/assets/3D_Viewer/stats.min.js"); ?><?php echo '?'.mt_rand(); ?>"></script>
<script src="<?php echo base_url("/assets/3D_Viewer/OrbitControls.js"); ?><?php echo '?'.mt_rand(); ?>"></script>
<script src="<?php echo base_url("/assets/3D_Viewer/3D_Viewer.js"); ?><?php echo '?'.mt_rand(); ?>"></script>


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

<div class="content phase_1_content">
    <div class="header_text">Where is your file ?</div>
    <div class="source_list big">
            <div data-type="sdcard" class="source_btn"><i class="fa fa-floppy-o" aria-hidden="true"></i><span> SD Card</span></div>
            <div data-type="usb" class="source_btn"><i class="fa fa-usb" aria-hidden="true"></i><span> USB stick</span></div>
            <div data-type="uploaded" class="source_btn"><i class="fa fa-upload" aria-hidden="true"></i><span> Uploaded</span></div>
    </div>
    <div class="file_list">
    </div>
    <div class="file_selected"><div class="nb_selected"><span>0</span> File selected</div> <div class="go_button">Next step!</div></div>
    <div id="3d_viewer"></div>
</div>

<script>
     var urlAjax = "<?php 
                if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                    echo "http://127.0.0.1/commonslab";
                } else {
                    echo "http://127.0.0.1";
                } ?>";

    var sourceType ='';
    var path = '';
    selected_file = [];
    $('.source_btn').on('click', function(){
        $(".source_list").addClass('small');
        $(".source_list").removeClass('big');
        $(this).addClass('selected');
        $('.header_text').html('Choose your files');
        sourceType = $(this).attr('data-type');
        path =  '/';
        var fileList = getFileList();
        displayFileList(fileList);
        $(".file_selected").slideToggle().css('display', 'flex');
    
    });

    function displayFileList(fileList){
        $('.file_list').html('');
        var pathHTML = $('<div class="path"><div class="back"><i class="fa fa-chevron-left" aria-hidden="true"></i></div><span>'+fileList['currentPath']+'</span></div>');
        addPathEvent(pathHTML);
        $('.file_list').append(pathHTML);
        $('.file_list').append('<div class="files"></div>');
        $.each(fileList['FL'], function(index, file){
            var obj = "";
            if(file["type"] == "folder"){
                obj = $([
                    '<div class="folder">',
                        '<i class="fa fa-folder-o" aria-hidden="true"></i>',
                        '<div class="name">'+file["name"]+'</div>',
                    '</div>'
                ].join(''));
                addFolderEvent(obj);
            }else{
                obj = $([
                    '<div class="file">',
                        selectBox(file["name"]),
                        typeOfFile(file["name"]),
                        '<div class="name">'+file["name"]+'</div>',
                        '<div class="size">'+formatFileSize(file["size"])+' </div>',
                        '<div class="preview"><i class="fa fa-eye" aria-hidden="true"></i></div>',
                    '</div>'
                ].join(''));
                addFileEvent(obj);
            }
            $('.file_list > .files').append(obj);
        });
    }

    function selectBox(file){
        if( file.indexOf('.gcode') !== -1){
            return '<div class="directPrint"><i class="fa fa-print" aria-hidden="true"></i></div>';
        }else{
            return '<div class="checkbox"><i class="fa fa-square-o" aria-hidden="true"></i></div>';
        }
        
    }

    function typeOfFile(file){
        if( file.indexOf('.gcode') == -1){
            return '<div class="type"><i class="fa fa-cube" aria-hidden="true"></i></div>';
        }else{
            return '<div class="type"><i class="fa fa-codepen" aria-hidden="true"></i></div>';
        }
    }

    function addFileEvent(file){
        var fullPath = getFullPath(file.find('.name').html());

        file.find('.preview').on('click', function(){
            
            console.log("Path :",path);
            console.log("FullPath :",fullPath);

            $.featherlight('<div id="3d_viewer"></div><div class="loading"><i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></div><div class="warning"></div>', {afterContent:function(){
                if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
                Viewer_Namespace.init_3D_viewer("<?php echo base_url('/'); ?>"+fullPath, document.getElementsByClassName("featherlight-content")[0]);
                Viewer_Namespace.animate_3D_viewer();
            }, beforeClose:function(){
                Viewer_Namespace.kill();
            }});
        });


        file.find('.checkbox').on('click', function(){
            if($(this).find('i').hasClass('fa-square-o')){
                $(this).find('i').removeClass('fa-square-o');
                $(this).find('i').addClass('fa-check-square-o');

                addSelectedFile(fullPath);
            }else{
                $(this).find('i').addClass('fa-square-o');
                $(this).find('i').removeClass('fa-check-square-o');

                removeSelectedFiler(fullPath);
            }
            $('.nb_selected > span').html(selected_file.length);
        });

        file.find('.directPrint').on('click', function(){
            var content = $( [ 
                '<div class="disclaimer">',
                    '<p>This is a GCODE File</p>',
                    '<p>It is a file already set for printing</p>',
                    '<p>You have to be sure that this file is set for this printer, otherwise it could damage your printer</p>',
                    '<p>If you want to print this file, you will skip Phase 2 and go to Phase 3</p>',
                    '<p>Are you sure ?</p>',
                    '<p><span class="yes">YES</span><span class="no">NO</span></p>',  
                '</div>'
            ].join('') );

            content.find('.yes').on('click', function(){
                console.log("yes", fullPath);
            });

            
            content.find('.no').on('click', function(){
                console.log("no");
                $.featherlight.close();
            });

            $.featherlight(content);
        });
    }

    $('.go_button').on('click', function(){
        if(selected_file.length == 0){
            $.featherlight('<p class="no_file_feather_style">No File Selected !</p>');
        }else{
            load_phase(2);
        }
    });

    function testIfArContains(arr, letter) { 
        var matches = arr.filter(function(str) {
            if(str.indexOf(letter) > -1){
                return letter;
            }
        });
    
        return (matches.length > 0) ? matches : [];
    }
    
     //returns ['da', 'da']


    function addSelectedFile(file){
        selected_file.push(file);
        /*if(file.indexOf('.gcode') !== -1){
            $.featherlight('<div>Warning: You have selected a GCODE file, you will not be able to select another file.</div>');
        }*/
    }

    function removeSelectedFiler(file){
        var index = selected_file.indexOf(file);
        if (index > -1) {
            selected_file.splice(index, 1);
        }
    }

    function addPathEvent(pathHtml){
        pathHtml.find('.back').on('click', function(){
            var tempAr = $('.path > span').html().split('/');
            var tempPath = tempAr.splice( (tempAr.length-2), 2);
            path = tempAr.join('/');
            var fileList = getFileList();
            displayFileList(fileList)
        });
    }

    function addFolderEvent(folder){
        folder.on('click', function(){
            path = $('.path > span').html()+folder.find('.name').html();
            var fileList = getFileList();
            displayFileList(fileList)
        });
    }

    function formatFileSize(size){
       if( Number((size/1024).toFixed(1)) > 1000 ){
           return Number((size/1024/1024).toFixed(1))+' Mo';
       }else{
           return Number((size/1024).toFixed(1))+' Ko';
       }
    }

    function getFileList() {
        return JSON.parse($.ajax({  
                url: urlAjax+"/Totem/index.php/phase_1/getFileList",
                method: "POST",
                data: { sourceType: sourceType, path:path },
                dataType :'text',
                async:false,
                context: document.body
        }).done(function( msg) {
        }).fail(function(){
            console.log('fail');
            alert('ERREUR : PHP HS');
        }).responseText);
    }


    function getFullPath(filePath){
        if(path !== '/'){
            filePath = '/'+filePath;
        }
        return $.ajax({  
                url: urlAjax+"/Totem/index.php/phase_1/getFullPath",
                method: "POST",
                data: { sourceType: sourceType, path:path+filePath },
                dataType :'text',
                async:false,
                context: document.body
        }).done(function( msg) {
        }).fail(function(){
            console.log('fail');
            alert('ERREUR : PHP HS');
        }).responseText;
    }
</script>