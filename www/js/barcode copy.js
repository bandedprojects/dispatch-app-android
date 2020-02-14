var barCode ="";
var dispatch_json="";
var blob_pdf;
document.addEventListener("keypress", onKeyPress);




$(document).ready(function(){
	document.getElementById("myFile").addEventListener("change", function(){
		//alert(cordova.file.applicationDirectory);
		
		/*window.requestFileSystem(cordova.file.externalDataDirectory, 0, gotFS, fail);
		function gotFS(fileSystem) {
			alert("Vishnu : got FS");
			fileSystem.root.getFile("vishnu_new.txt", {create: true, exclusive: false}, gotFileEntry, fail);
		}
	
		function gotFileEntry(fileEntry) {
			alert("Vishnu : got ENTRY");
			fileEntry.createWriter(gotFileWriter, fail);
		}
	
		function gotFileWriter(writer) {
			alert("Vishnu : got Writter");
			writer.onwriteend = function(evt) {
				alert("contents of file now 'some sample text'");
				writer.truncate(11);
				writer.onwriteend = function(evt) {
					alert("contents of file now 'some sample'");
					writer.seek(4);
					writer.write(" different text");
					writer.onwriteend = function(evt){
						alert("contents of file now 'some different text'");
					}
				};
			};
			writer.write("some sample text");
		}
	
		function fail(error) {
			alert(error.code);
		}*/

		html2canvas(document.getElementById('tblCustomers'), {
			onrendered: function (canvas) {
				var data = canvas.toDataURL();
				var docDefinition = {
					content: [{
						image: data,
						width: 200
					}]
				};
				const pdfDocGenerator = pdfMake.createPdf(docDefinition);
				pdfDocGenerator.getBlob((blob) => {
					blob_pdf = blob;
				});
			}
		});

		var fileName = 'batches.pdf';    // your file name
		var data = 'sample data';               // your data, could be useful JSON.stringify to convert an object to JSON string
		window.resolveLocalFileSystemURL( cordova.file.externalRootDirectory, function( directoryEntry ) {
			alert("1");
			directoryEntry.getFile(fileName, { create: true }, function( fileEntry ) {
				alert("2");
				fileEntry.createWriter( function( fileWriter ) {
					fileWriter.onwriteend = function( result ) {
						alert( 'done.' );
					};
					fileWriter.onerror = function( error ) {
						alert( error );
					};
					var dataObj = new Blob(['some file data'], { type: 'text/plain' });
					fileWriter.write( blob_pdf );
				}, function( error ) { alert( error ); } );
			}, function( error ) { alert( error ); } );
		}, function( error ) { alert( error ); } );





		
		

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