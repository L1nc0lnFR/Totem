<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Phase_1 extends CI_Controller {

	public function index()
	{
		
    }
    
    function getFileList(){
        switch($_POST['sourceType']){
            case 'sdcard' :
                // linux get sdcard
                $dir = "";
                break;
            case 'usb' :
                // linux get USB
                $dir = "";
                break;
            case 'uploaded' :
                // from file of www folder
                $dir = "C:/wamp64/www/commonslab/totem/files/uploaded";
                break;
        }
        
        $files 	= scandir($dir.$_POST['path']);
        sort($files);
        $result = array();
        if( $_POST['path'] != '/'){
            $current_path = $_POST['path'].'/';
        }else{
            $current_path = '/';
        }

        foreach($files as $file){
            if ($file != '.' && $file != '..'){
                $type = "";
                if (is_dir($dir.$current_path.$file)) {
                    $type ="folder";
                    array_push($result, ["name"=>$file, "type"=>$type]);
                }else{
                    $type ="file";
                    if(strpos($file, '.stl') || strpos($file, '.gcode')){
                        array_push($result, ["name"=>$file, "type"=>$type, "size"=>filesize($dir.$current_path.$file)]);
                    }
                }
                
                
            }
        }
        echo json_encode(['FL'=>$result, 'currentPath'=> $current_path]);
    }

    function getFullPath(){
        switch($_POST['sourceType']){
            case 'sdcard' :
                // linux get sdcard
                $dir = "";
                break;
            case 'usb' :
                // linux get USB
                $dir = "";
                break;
            case 'uploaded' :
                // from file of www folder
                $dir = "files/uploaded";
                break;
        }

        if( $_POST['path'] == '/' ){
            echo $dir.substr($_POST['path'], 1);
        }else{
            echo $dir.$_POST['path'];
        }
        
    }
}
