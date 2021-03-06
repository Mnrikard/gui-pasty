// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//
var ipc = require('electron').ipcRenderer;
var d = document;

var gpFunc = d.getElementById('gp-func');
var gpParms = d.getElementById('gp-parms');
var log = d.getElementById('log');

var editors = require("pasty-clipboard-editor/editors");
var names = editors.getAllFuncNames();
var i,opt;

for(i=0;i<names.length;i++){
	opt = d.createElement("option");
	opt.appendChild(d.createTextNode(names[i]));
	opt.value = names[i];
	gpFunc.appendChild(opt);
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

function getRecentFuncs(){
	var recentCalls = localStorage.getItem("recentPastyFunctions");
	if(!recentCalls){
		return [];
	}
	return JSON.parse(recentCalls);
}

function clearParmArea(){
	while(gpParms.childNodes[0]){
		gpParms.removeChild(gpParms.childNodes[0]);
	}
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

function getSelectedFunction(){
	return gpFunc.value;
}

Array.prototype.pluck = function(i){
	return this.splice(i,1);
};

Array.prototype.equals = function(arr2){
	if(this.length !== arr2.length) { return false; }
	for(var p=0;p<this.length;p++){
		if(this[p] !== arr2[p]){
			return false;
		}
	}
	return true;
};

function rememberFunction(parms){
	var recentCalls = getRecentFuncs();

	recentCalls.forEach(function(itm,i){
		if(itm.equals(parms)){
			recentCalls.pluck(i);
		}
	});

	while(recentCalls.length >= 25){
		recentCalls.pop();
	}
	recentCalls.unshift(parms);

	localStorage.setItem("recentPastyFunctions",JSON.stringify(recentCalls));
}

function runFunction(){
	try{
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

		rememberFunction(parms);
		editClipboard(parms);
	} catch(e){
		console.log(e);
	}
	clearParmArea();
	gpFunc.value = "";

	document.getElementById('gp-func').select();
	exports.showPastFunctions();
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

exports.functionChosen = function(){
	var i,tr,lbl,inpCell,inp;
	var fn = editors.getEditor(getSelectedFunction(), false);
	fn.calledName = getSelectedFunction();
	if (fn.getParms){
		fn.getParms();
	}
	if(fn.updateHelpText){fn.updateHelpText();}

	clearParmArea();

	gpParms.innerText = fn.oneLiner;

	var tb = d.createElement("table");
	gpParms.appendChild(tb);

	if(fn.parms){
		for(i=0;i<fn.parms.length;i++){
			tr = d.createElement("tr");
			tb.appendChild(tr);
			lbl = d.createElement("td");
			lbl.className = "label";
			lbl.appendChild(d.createTextNode(fn.parms[i].name));
			tr.appendChild(lbl);
			inpCell = d.createElement("td");
			inp = d.createElement("input");
			inp.type="text";
			inp.id = "gpParm"+i;
			inp.className = "functionParameter";
			if(fn.parms[i].defaultValue){
				inp.value = fn.parms[i].defaultValue.replace(/\n/,"\\n").replace(/\t/,"\\t");
			}
			inpCell.appendChild(inp);
			tr.appendChild(inpCell);
		}
	}

	var btn = d.createElement("button");
	btn.appendChild(d.createTextNode("Run"));
	btn.className = "round";
	btn.id = "runButton";
	gpParms.appendChild(btn);
	btn.addEventListener("click", runFunction);

	addSwitches(fn.allowedSwitches, tb);
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

function getRecentFuncs(){
	var recentCalls = localStorage.getItem("recentPastyFunctions");
	if(!recentCalls){
		return [];
	}
	return JSON.parse(recentCalls);
}

exports.showPastFunctions = function(){
	var container = document.getElementById('previousFuncs');
	while(container.childNodes[0]){
		container.removeChild(container.childNodes[0]);
	}
	var funcs = getRecentFuncs();
	funcs.forEach(function(itm){
		if(!itm || itm.length === 0){
			return;
		}
		var p = document.createElement("p");
		p.className = "likeLink";
		p.onclick = function(){
			document.getElementById('gp-func').value = itm[0];
			document.getElementById('getParmsButton').onclick();
			var parmEls = document.getElementsByClassName('functionParameter');
			for(var i=0;i<parmEls.length;i++){
				parmEls[i].value = itm[i+1];
			}
		}
		p.appendChild(document.createTextNode(itm.join(" ")));
		container.appendChild(p);
	});
}
