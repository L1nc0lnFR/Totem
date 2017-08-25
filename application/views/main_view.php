<?php header("Content-type: text/html; charset=utf-8"); ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title>Totem</title>
        <script src="<?php echo base_url("assets/js/jquery-3.2.1.min.js"); ?><?php echo '?'.mt_rand(); ?>"></script>
        <link rel="stylesheet" type="text/css" href="<?php echo base_url("assets/jquery-ui-1.12.1/jquery-ui.min.css"); ?><?php echo '?'.mt_rand(); ?>" >
        <script src="<?php echo base_url("/assets/jquery-ui-1.12.1/jquery-ui.min.js"); ?><?php echo '?'.mt_rand(); ?>" ></script>
        <script src="<?php echo base_url("assets/js/jquery.ui.touch-punch.min"); ?><?php echo '?'.mt_rand(); ?>"></script>
        
        <link rel="stylesheet" type="text/css" href="<?php echo base_url("assets/css/main_style.css"); ?><?php echo '?'.mt_rand(); ?>">
        <link rel="stylesheet" type="text/css" href="<?php echo base_url("assets/font-awesome-4.7.0/css/font-awesome.min.css"); ?><?php echo '?'.mt_rand(); ?>">
        <script src="<?php echo base_url("assets/featherlight/featherlight.min.js"); ?><?php echo '?'.mt_rand(); ?>"></script>
		<link rel="stylesheet" type="text/css" href="<?php echo base_url("assets/featherlight/featherlight.min.css"); ?><?php echo '?'.mt_rand(); ?>">
    </head>
    <body>
        <div class="header">
            <div data-phase="1" class="phase_1 phase_btn">Phase 1</div>
            <div data-phase="2" class="phase_2 phase_btn">Phase 2</div>
            <div data-phase="3" class="phase_3 phase_btn">Phase 3</div>
            <div data-phase="4" class="phase_4 phase_btn">Phase 4</div>
        </div>
        <div class="page_content"></div>
    </body>
    <script>

        var selected_file = [];
        
        //debug
        selected_file = ["files/uploaded/HABU_stand.stl", "files/uploaded/HABU_stand.stl"];
        


        //init first phase
        $( document ).ready(function() {
            load_phase(2);
        });

        //load phase
        $(".phase_btn").on('click', function(){
            var phase = $(this).attr('data-phase');
            load_phase(phase);
        });

        function load_phase(phase){
            
            if (typeof Editor_Namespace !== 'undefined') {
                console.log(Editor_Namespace.running);
                if(Editor_Namespace.running){
                    Editor_Namespace.kill();
                }
            }

            if (typeof Viewer_Namespace !== 'undefined') {
                if(Viewer_Namespace.running){
                    Viewer_Namespace.kill();
                }
            }
            
           

            $.ajax({  
                    url: "http://127.0.0.1/commonslab/totem/index.php/main/load_phase",
                    method: "POST",
                    data: { phase: phase },
                    dataType :'text',
                    async:false,
                    context: document.body
            }).done(function( msg) {
                $('.page_content').fadeOut(100, function(){

                    $('.page_content').html('');
                    $('.page_content').html( $(msg) ).hide().fadeIn(100);

                    $('.page_content .content').hide();
                    var everythingLoaded = setInterval(function() {
                        if (/loaded|complete/.test(document.readyState)) {
                            clearInterval(everythingLoaded);
                            $('.page_content .content').fadeIn();
                        }
                    }, 10);

                   
                });
            }).fail(function(){
                console.log('fail');
                alert('ERREUR : PHP HS');
            });
        }
    </script>