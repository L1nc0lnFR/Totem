<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Main extends CI_Controller {

	public function index()
	{
		$this->load->view('main_view');
	}

	function load_phase(){
		$data = null;
		$response = $this->load->view('phase_'.$_POST['phase'].'_view',$data,TRUE);
		echo $response;
	}
}
