// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//
var ipc = require('electron').ipcRenderer;
var d = document;

var gpFunc = d.getElementById('gp-func');
var gpParms = d.getElementById('gp-parms');

var editors = require("pasty-clipboard-editor/editors");
var names = editors.getAllFuncNames();
var i,opt;

for(i=0;i<names.length;i++){
	opt = d.createElement("option");
	opt.appendChild(d.createTextNode(names[i]));
	opt.value = names[i];
	gpFunc.appendChild(opt);
}

function getSelectedFunction(){
	return gpFunc.options[gpFunc.selectedIndex].value;
}

function getSwitchValue(){
	var switches = d.getElementsByName("gp-switches");
	var i;
	var output = "-";
	for(i=0;i<switches.length;i++){
		if(switches[i].value === "m" && switches[i].checked){
			output += "m";
		}
		if(switches[i].value === "I" && switches[i].checked){
			output += "I";
		}
		if(switches[i].value === "g"){
			if(switches[i].checked){
				output += "g";
			} else {
				output += "G";
			}
		}
		if(switches[i].value === "r" && switches[i].checked){
			output += "r";
		}
	}

	if(output !== "-"){
		return output;
	}
	return null;
}

function runFunction(){
	var parms = [];
	parms.push(getSelectedFunction());
	var i=0;

	while(d.getElementById("gpParm"+i)){
		parms.push(d.getElementById("gpParm"+i).value);
		i++;
	}
	var switches = getSwitchValue();
	if(switches){
		parms.push(switches);
	}
	require('pasty-clipboard-editor').editClipboard(parms);
}

function addSwitches(switches,tbl){
	if(!switches || switches === ""){
		return;
	}

	var tr,td,cb,rx,lbl;
	var available = [
		{name:"Multiline",indicator:"m",checked:false},
		{name:"Case Sensitive",indicator:"I",checked:false},
		{name:"Global",indicator:"g",checked:true},
		{name:"Reverse",indicator:"r",checked:false}
	];

	tr = d.createElement("tr");
	td = d.createElement("td");
	td.colspan = "2";
	tr.appendChild(td);
	tbl.appendChild(tr);
	available.forEach(function(el){
		rx = new RegExp(el.indicator,"ig");
		if(rx.test(switches)){
			lbl = d.createElement("label");
			td.appendChild(lbl);
			cb = d.createElement("input");
			cb.type = "checkbox";
			cb.name = "gp-switches";
			cb.value = el.indicator;
			cb.checked = el.checked ? "checked" : null;
			lbl.appendChild(cb);
			lbl.appendChild(d.createTextNode(el.name));
			td.appendChild(d.createElement("br"));
		}
	});
}

gpFunc.onchange = function(){
	var i,tr,lbl,inpCell,inp;
	var fn = editors.getEditor(getSelectedFunction(), false);
	while(gpParms.childNodes[0]){
		gpParms.removeChild(gpParms.childNodes[0]);
	}
	gpParms.innerText = fn.oneLiner;

	var tb = d.createElement("table");
	gpParms.appendChild(tb);

	for(i=0;i<fn.parms.length;i++){
		tr = d.createElement("tr");
		tb.appendChild(tr);
		lbl = d.createElement("td");
		lbl.appendChild(d.createTextNode(fn.parms[i].name));
		tr.appendChild(lbl);
		inpCell = d.createElement("td");
		inp = d.createElement("input");
		inp.type="text";
		inp.id = "gpParm"+i;
		inp.value = fn.parms[i].defaultValue ? fn.parms[i].defaultValue.replace(/\n/g,"\\n") : null;
		inpCell.appendChild(inp);
		tr.appendChild(inpCell);
	}
	// exports.allowedSwitches = "rmigIGL";

	var btn = d.createElement("button");
	btn.appendChild(d.createTextNode("Run"));
	gpParms.appendChild(btn);
	btn.addEventListener("click", runFunction);

	addSwitches(fn.allowedSwitches, tb);
};


