// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//
var ipc = require('electron').ipcRenderer;


var gpFunc = document.getElementById('gp-func');
var gpParms = document.getElementById('gp-parms');

var editors = require("pasty-clipboard-editor/editors");
var names = editors.getAllFuncNames();
var i;
for(i=0;i<names.length;i++){
	var opt = document.createElement("option");
	opt.appendChild(document.createTextNode(names[i]));
	opt.value = names[i];
	gpFunc.appendChild(opt);
}

gpFunc.onchange = function(){
	var i;
	var fn = editors.getEditor(getSelectedFunction(), false);
	while(gpParms.childNodes[0]){
		gpParms.removeChild(gpParms.childNodes[0]);
	}
	gpParms.innerText = fn.oneLiner;

	var tb = document.createElement("table");
	gpParms.appendChild(tb);

	for(i=0;i<fn.parms.length;i++){
		var tr = document.createElement("tr");
		tb.appendChild(tr);
		var lbl = document.createElement("td");
		lbl.appendChild(document.createTextNode(fn.parms[i].name));
		tr.appendChild(lbl);
		var inpCell = document.createElement("td");
		var inp = document.createElement("input");
		inp.type="text";
		inp.id = "gpParm"+i;
		inp.value = fn.parms[i].defaultValue;
		inpCell.appendChild(inp);
		tr.appendChild(inpCell);
	}

	var btn = document.createElement("button");
	btn.appendChild(document.createTextNode("Run"));
	gpParms.appendChild(btn);
	btn.addEventListener("click", runFunction);
}

function getSelectedFunction(){
	return gpFunc.options[gpFunc.selectedIndex].value;
}

function runFunction(){
	var parms = [];
	parms.push(getSelectedFunction());
	var i=0;

	while(document.getElementById("gpParm"+i)){
		parms.push(document.getElementById("gpParm"+i).value);
		i++;
	}
	require('pasty-clipboard-editor').editClipboard(parms);
}


