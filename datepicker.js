/*
	Datepicker Widget by Micah Andersen <micah@bimi.org>
	Based on:
	Javascript Datepicker by Corion <corion@corion.net>
	Released under the Artistic License

	Additions:
		-This disclaimer
		-grep() from datepicker_widget.html (Corion)
		-added boxShadow and borderRadius to mimic Firefox datepicker
		-added frameBorder to fix ugly IE6 border
		-close datepicker when focus is lost (optimal)
			-if this is IE, we do this in create_datepicker_widget()
		-show_datepicker_widget() additions
			-call iframe.set_container(datepicker_widget)
			-set focus on datepicker_widget, then
			-set focus on iframe
			-if Chrome, use SetTimeout to make the focus() calls (bug workaround)
		-date_inputs() grep()s all the <input> elements on the current document for date inputs
		-attach_datepickers() gets all date inputs from date_inputs() and:
			-sets them readOnly
			-sets pointer to cursor, so it's obvious they are to be clicked
			-hook the onfocus handler to call show_datepicker_widget()
			-if Chrome, attach onclick to work around <iframe>/<input> focus bugs
		-hook the document's onload handler to call create_datepicker_widget() and attach_datepickers() on startup
	Modifications:
		-findPos() now prefers getBoundingClientRect() + viewport scroll offset over recursive element offset code
		-findPos() recursive element offset code now includes client left/top values to include border widths
		-parent/container elements renamed from calendar_widget to datepicker_widget
		-create_datepicker_widget() added from creation code in show_calendar_widget()
			-parent/container style moved into JS code to make the widget easier to include in various pages
		-show_datepicker_widget() can be called directly from an <input> element now
	Deletions:
		-unused Netscape 4 positioning code
		-unused date variable in show_datepicker_widget()
*/
var debug = false;

function grep(code,list) {
  var result = [];
  for (var i = 0; i < list.length; i++) {
    if (code(list[i])) {
      result.push( list[i]);
    }
  }
  return result;
}

function findPos(obj) {
  var pos = new Object;
  pos.left = 0;
  pos.top = 0;
	
	if (obj.getBoundingClientRect){
		var viewport = document.documentElement;
		var rect = obj.getBoundingClientRect();
		if (window.scrollY){
			var scrollX = window.scrollX;
			var scrollY = window.scrollY;
		}else{
			var scrollX = viewport.scrollLeft;
			var scrollY = viewport.scrollTop;
		}
		pos.left = scrollX + rect.left;
		pos.top = scrollY + rect.top;
		//alert (pos.top + "=" + scrollY + "+" + rect.top);
	} else if (obj.offsetParent)	{
		while (obj.offsetParent) {
			pos.left += obj.offsetLeft + obj.clientLeft;
			pos.top  += obj.offsetTop + obj.clientTop;
			obj = obj.offsetParent;
		};
	} else if (obj.x) {
		pos.left = obj.x;
		pos.top = obj.y;
	};
	return pos;
};

function parent(widget) {
  if (widget.parentElement) { return widget.parentElement; };
  if (widget.parentNode) { return widget.parentNode; };
  if (widget.parent) { return widget.parent; };
  return;
};

function create_datepicker_widget(){
  var datepicker_widget = document.getElementById('datepicker_widget');
  if (! datepicker_widget) {
    datepicker_widget = document.createElement('div');
    datepicker_widget.id = 'datepicker_widget';
	datepicker_widget.style.position = 'absolute';
	datepicker_widget.style.top = '0px';
	datepicker_widget.style.left = '0px';
	datepicker_widget.style.width = '153px';
	datepicker_widget.style.height = '200px';
	datepicker_widget.style.display = 'none';
	datepicker_widget.style.boxShadow = '0 5px 12px 0 rgba(0,0,0,0.20)';
	datepicker_widget.style.borderRadius = '3px';
    document.body.appendChild(datepicker_widget);
    var iframe = document.createElement('iframe');
    iframe.id = 'datepicker_widget_iframe';
    iframe.name = iframe.id;
	iframe.style.borderRadius = '3px';
    iframe.style.border = 'none';
	iframe.frameBorder = 0;		//IE6
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.src = 'datepicker_widget.html';
	if (!debug) {
		iframe.onblur = function(){
			var iframe = window.frames['datepicker_widget_iframe'];
			iframe.close_widget();
		};
	}

    datepicker_widget.appendChild( iframe );
  };
  return datepicker_widget;
}

function show_datepicker_widget(widget) {
  if (! document.getElementsByTagName) { return; };
  // find edit widget
  if (widget.tagName.toLowerCase() != "input"){
	  var edits = parent(widget).getElementsByTagName('input');
	  if (edits.length > 1) {
		alert("More than one date edit field found within the enclosing element");
		return 0;
	  } else if (edits.length == 0) {
		alert("No date edit field found within the enclosing element");
		return 0;
	  };
	  var date_edit = edits[0];
  }else{
	  var date_edit = widget;
  }

  // find/create calendar widget
  var datepicker_widget = create_datepicker_widget();

  // find lower edge of edit widget:
  var pos = findPos(date_edit);
  if (date_edit.offsetHeight) {
    pos.top += date_edit.offsetHeight;
  } else {
    pos.top += date_edit.clientHeight;
  };

  // move calendar widget
  if (document.all) {
    // IE
    datepicker_widget.style.posTop = pos.top;
    datepicker_widget.style.posLeft = pos.left;
    datepicker_widget.style.display = "block";
  } else {
    // Mozilla
    datepicker_widget.style.position = 'absolute';
    datepicker_widget.style.top = pos.top + "px";
    datepicker_widget.style.left = pos.left + "px";
    datepicker_widget.style.display = "block";
  };

  // Now connect the current edit to the iframe:
  var iframe = window.frames['datepicker_widget_iframe'];
  iframe.set_container(datepicker_widget);
  iframe.set_edit(date_edit);
  datepicker_widget.focus();
  iframe.focus();
  if (window.chrome) {	//chrome 'work-around'
    setTimeout(function (){
		document.getElementById('datepicker_widget').focus();
		window.frames['datepicker_widget_iframe'].focus();
	},10);
  }
};

function date_inputs() {															//FF 52, IE 11						 //IE 6
  return grep( function(i){ var tag = i.outerHTML.toLowerCase(); return (tag.indexOf('type="date"') != -1 || tag.indexOf('type=date') != -1)}, document.getElementsByTagName('input'));
}

function attach_datepickers(){
	var dateboxes = date_inputs();
	for (var offset = 0; offset < dateboxes.length; offset++) {
		dateboxes[offset].readOnly = true;
		dateboxes[offset].style.cursor = 'pointer';
		dateboxes[offset].onfocus = function(){
			show_datepicker_widget(this);
		};
		if (window.chrome){	//chrome 'work-around'
			dateboxes[offset].onclick = function(){
				show_datepicker_widget(this);
			};
		}
	}
}



window.onload = function(){
	//create calendar widget on startup
	create_datepicker_widget();
	//attach datepicker to <input>s on startup
	attach_datepickers();
};

