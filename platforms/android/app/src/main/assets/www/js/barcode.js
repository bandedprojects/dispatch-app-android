var barCode ="";
var dispatch_json="";
var blob_pdf;
var batch_name = "dispatch_output.csv"
var excel_data = "No, Serial Number, TareWeight, TareWeight, Mfg Date, Mfg Year,Batch Number \r\n";
var fileName = 'batches';
var rejection_reason = "cannot proceed";
var global_serialno="";
var scanned_serial_number =[];

document.addEventListener("keypress", onKeyPress);

function download(){
	
	fileName = fileName + Math.random()+".csv";
	var data = "sample,sample,sample";
	data+="\r\nsample1,sample2,sample3";               // your data, could be useful JSON.stringify to convert an object to JSON string
	window.resolveLocalFileSystemURL( cordova.file.externalRootDirectory, function( directoryEntry ) {
		
		directoryEntry.getFile(fileName, { create: true }, function( fileEntry ) {
			
			fileEntry.createWriter( function( fileWriter ) {
				fileWriter.onwriteend = function( result ) {
					alert( 'Download is success.' );
				};
				fileWriter.onerror = function( error ) {
					console.log( error );
				};
				var dataObj = new Blob(['some file data'], { type: 'text/plain' });
				fileWriter.write( excel_data );
			}, function( error ) { console.log( error ); } );
		}, function( error ) { console.log( error ); } );
	}, function( error ) { console.log( error ); } );
}

function savePDF(){
	html2canvas(document.getElementById('Dispatch_table'), {
		onrendered: function (canvas) {
			var data = canvas.toDataURL();
			var docDefinition = {
				content: [{
					image: data,
					width: 500
				}]
			};
			const pdfDocGenerator = pdfMake.createPdf(docDefinition).download();
			pdfDocGenerator.getBlob((blob) => {
				blob_pdf = blob;
			});
		}
	});

	    // your file name
	var data = 'sample data';               // your data, could be useful JSON.stringify to convert an object to JSON string
	window.resolveLocalFileSystemURL( cordova.file.externalRootDirectory, function( directoryEntry ) {
		console.log("1");
		directoryEntry.getFile(fileName, { create: true }, function( fileEntry ) {
			console.log("2");
			fileEntry.createWriter( function( fileWriter ) {
				fileWriter.onwriteend = function( result ) {
					console.log( 'done.' );
				};
				fileWriter.onerror = function( error ) {
					console.log( error );
				};
				var dataObj = new Blob(['some file data'], { type: 'text/plain' });
				fileWriter.write( blob_pdf );
			}, function( error ) { console.log( error ); } );
		}, function( error ) { console.log( error ); } );
	}, function( error ) { console.log( error ); } );

}


function AddToTable(batch_number, serial_number, weightObj){
	//savePDF();
	var weight  = 0 ;
	if(weightObj ==null || weightObj == undefined || weightObj.weight =="" || weightObj.weight == undefined){
		alert("Tare weight info not found. cannot add to table");
		
	}
	else{
		weight = parseFloat(weightObj.weight);
	}
	var table = document.getElementById("Dispatch_table");
	var nextRow = table.rows.length;
	var row = table.insertRow(nextRow);
	var cell_no = row.insertCell(0);
	var cell_serial = row.insertCell(1);
	var cell_weight1 = row.insertCell(2);
	var cell_weight2 = row.insertCell(3);
	var cell_month = row.insertCell(4);
	var cell_year = row.insertCell(5);
	var cell_batch = row.insertCell(6);
	cell_no.innerHTML = nextRow;
	cell_serial.innerHTML = serial_number;
	cell_weight1.innerHTML = weight;
	cell_weight2.innerHTML = weight.toFixed(1);
	cell_batch.innerHTML = batch_number;
	document.getElementById("table-scroll").scrollTo(0,500000);

	excel_data = excel_data + nextRow + ", " + serial_number + ", " + weight
	+ ", " + weight.toFixed(1) + ", "+"  ,"+" ," + batch_number + "\r\n";
	scanned_serial_number.push(serial_number);
	fileName = batch_number;
}

function clearAllStatus(){
	//clear all the status;
	var error_state = document.getElementById("status_icon_error");
	var error_text = document.getElementById("status_text_error");
	var success_state = document.getElementById("status_icon_success");
	var success_text = document.getElementById("status_text_success");
	error_state.style.display = "none";
	error_text.style.display = "none"; 
	success_state.style.display = "none";
	success_text.style.display = "none";
}

$(document).ready(function(){
	var _docHeight = (document.height !== undefined) ? document.height : document.body.offsetHeight;
	_docHeight = _docHeight - 250;
	document.getElementById("table-scroll").style.height = _docHeight+"px";
	document.getElementById("myFile").addEventListener("change", function(){
		
		var fr = new FileReader();
		fr.onload = function() {

			dispatch_json = JSON.parse(this.result);
			console.log(dispatch_json.name);
			$("#Dispatch_table").find("tr:not(:first)").remove();
			scanned_serial_number.length = 0;
			clearAllStatus();
		}
		fr.readAsText(this.files[0]);
	})	
});

var readWeight = (obj) => {
	return obj.serialno === global_serialno;
}

var getWeight = (serial_no) => {
	global_serialno = serial_no
	return dispatch_json.tareweight.find(readWeight)
} 

function processBarCode(serialno){
	serialno = parseInt(serialno);

	var error_state = document.getElementById("status_icon_error");
	var error_text = document.getElementById("status_text_error");
	var success_state = document.getElementById("status_icon_success");
	var success_text = document.getElementById("status_text_success");
	if("" == dispatch_json){
		alert("Dispach file cannot read");
		return;
	}

	if(scanned_serial_number.indexOf(serialno) != -1){
		alert(serialno +" is already added to dipacthed table!");
		return;
	}

	
	var rejection_status = 0;
	if(dispatch_json.rejectedCylinders.indexOf(serialno) != -1) {
		rejection_status = 1;
		rejection_reason = " found rejected"
	}
	else if (serialno < dispatch_json.starting_serialno ||  serialno> dispatch_json.ending_serialno){
		rejection_status = 1;
		rejection_reason = " not found "
	}
		
	if(0 == rejection_status) //sunccess
	{
		error_state.style.display = "none";
		error_text.style.display = "none";      // Hide
		success_state.style.display = "block"; 
		success_text.innerText = serialno;
		success_text.style.display = "block"; 
		AddToTable(dispatch_json.batchname, serialno, getWeight(serialno));
	}
	else{
		error_state.style.display = "block"; 
		error_text.innerText = serialno + " : "+rejection_reason+ " in batch: "+dispatch_json.batchname;     // Hide
		error_text.style.display = "block";   
		success_state.style.display = "none";
		success_text.style.display = "none";
	}


}

function onKeyPress(event) {
	//AddToTable("samplesample", "sample", "sample");
	
	var keyCode = event.charCode || evt.keyCode;   // Get the Unicode value
	
	
	if(keyCode != 13){
		barCode = barCode+String.fromCharCode(keyCode); 
	}else{
		processBarCode(barCode);
		barCode="";
	}
}