// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//
var ipc = require('electron').ipcRenderer;


var gpFunc = document.getElementById('gp-func');
var gpParms = document.getElementById('gp-parms');
var log = document.getElementById('log');

var editors = require("pasty-clipboard-editor/editors");
var names = editors.getAllFuncNames();
var i;
for(i=0;i<names.length;i++){
	var opt = document.createElement("option");
	opt.appendChild(document.createTextNode(names[i]));
	opt.value = names[i];
	gpFunc.appendChild(opt);
}

function clearParmArea(){
	while(gpParms.childNodes[0]){
		gpParms.removeChild(gpParms.childNodes[0]);
	}
}

exports.functionChosen = function(){
	var i;
	var fn = editors.getEditor(getSelectedFunction(), false);
	fn.calledName = getSelectedFunction();
	if(fn.updateHelpText){fn.updateHelpText();}

	clearParmArea();

	gpParms.innerText = fn.oneLiner;

	var tb = document.createElement("table");
	gpParms.appendChild(tb);

	if(fn.parms){
		for(i=0;i<fn.parms.length;i++){
			var tr = document.createElement("tr");
			tb.appendChild(tr);
			var lbl = document.createElement("td");
			lbl.className = "label";
			lbl.appendChild(document.createTextNode(fn.parms[i].name));
			tr.appendChild(lbl);
			var inpCell = document.createElement("td");
			var inp = document.createElement("input");
			inp.type="text";
			inp.id = "gpParm"+i;
			if(fn.parms[i].defaultValue){
				inp.value = fn.parms[i].defaultValue.replace(/\n/,"\\n").replace(/\t/,"\\t");
			}
			inpCell.appendChild(inp);
			tr.appendChild(inpCell);
		}
	}

	var btn = document.createElement("button");
	btn.appendChild(document.createTextNode("Run"));
	btn.className = "round";
	btn.id = "runButton";
	gpParms.appendChild(btn);
	btn.addEventListener("click", runFunction);
}

function getSelectedFunction(){
	return gpFunc.value;
}

function editClipboard(parms){
	try{
		var content = "";
		const {clipboard} = require('electron')
		try{
			content = clipboard.readText();
		} catch(e) {
			clipboard.writeText(content);
		}
		var newContent = require('pasty-clipboard-editor/editorRunner').handleInput(content, parms);
		clipboard.writeText(newContent);
	} catch(err) {
		console.log(err);
	}

}

function runFunction(){
	try{
	var parms = [];
	parms.push(getSelectedFunction());
	var i=0;

	while(document.getElementById("gpParm"+i)){
		parms.push(document.getElementById("gpParm"+i).value);
		i++;
	}
	editClipboard(parms);
	} catch(e){
		console.log(e);
	}
	clearParmArea();
	gpFunc.value = "";

	document.getElementById('gp-func').select();
}


