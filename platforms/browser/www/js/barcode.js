var barCode ="";
var dispatch_json="";
document.addEventListener("keypress", onKeyPress);




$(document).ready(function(){
	document.getElementById("myFile").addEventListener("change", function(){
	
		var fr = new FileReader();
		fr.onload = function() {
			dispatch_json = JSON.parse(this.result);
			console.log(dispatch_json.name);
		}
		fr.readAsText(this.files[0]);
	})	
});



function processBarCode(barCode){
	barCode = barCode.split("-");
	var error_state = document.getElementById("status_icon_error");
	var error_text = document.getElementById("status_text_error");
	var success_state = document.getElementById("status_icon_success");
	var success_text = document.getElementById("status_text_success");
	if("" == dispatch_json){
		alert("Dispach file cannot read");
		return;
	}

	var rejection_status = dispatch_json.rejected_cylinders.indexOf(barCode[1]);
	if(-1 == rejection_status)
	{
		error_state.style.display = "none";
		error_text.style.display = "none";      // Hide
		success_state.style.display = "block"; 
		success_text.innerText = barCode[1];
		success_text.style.display = "block"; 
	}
	else{
		error_state.style.display = "block"; 
		error_text.innerText = barCode[1] + " : Found Rejected in Batch : "+barCode[0];     // Hide
		error_text.style.display = "block";   
		success_state.style.display = "none";
		success_text.style.display = "none";
	}
}

function onKeyPress(event) {

	var keyCode = event.charCode || evt.keyCode;   // Get the Unicode value
	
	
	if(keyCode != 13){
		barCode = barCode+String.fromCharCode(keyCode); 
	}else{
		processBarCode(barCode);
		barCode="";
	}
}