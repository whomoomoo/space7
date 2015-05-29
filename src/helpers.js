
function logDebug(msg) {
    $('#debug').html(msg+'<br>'+$('#debug').html());
}

function now() {
    return new Date().getTime();
}

function getPropertyWithDefault(obj, propName, defaultValue) {
    if (propName in obj) {
        return obj[propName];
    } else {
        return defaultValue;
    }
}

function isUndef(value) {
	return typeof value === 'undefined';
}

function floatRand(min, max) {
    var num = max - min + 1;
    
    return (Math.random() * num)+min;
}

function intRand(min, max) {    
    return Math.floor(floatRand(min, max));
}

function boolRand() {    
    return intRand(0, 1) === 0;
}

function createObjectForSuperClassCall(object) {
    var superClass = new Object();
    for(var prop in object) {
        if (typeof object[prop] === 'function') {
            superClass[prop] = object[prop];
        }
    }
    return superClass;
}

function parseColour(colourString) {
    var retval = colourString.match(/(\w\w)(\w\w)(\w\w)/);
    
    if (retval != null) {
        return jQuery.map(retval.slice(1), function (value){ return parseInt(value, 16); });
    }
    
    //errorLog("parseColour can't parse " + colourString);
    return null;
}

String.prototype.repeat = function( num ) {
    return new Array( num + 1 ).join( this );
}

function isElementVisible(el) {
    var rect     = el.getBoundingClientRect(),
        vWidth   = window.innerWidth || doc.documentElement.clientWidth,
        vHeight  = window.innerHeight || doc.documentElement.clientHeight,
        efp      = function (x, y) { return document.elementFromPoint(x, y) };     

    // Return false if it's not in the viewport
    if (rect.right < 0 || rect.bottom < 0 
            || rect.left > vWidth || rect.top > vHeight)
        return false;

    // Return true if any of its four corners are visible
    return (
          el.contains(efp(rect.left,  rect.top))
      ||  el.contains(efp(rect.right, rect.top))
      ||  el.contains(efp(rect.right, rect.bottom))
      ||  el.contains(efp(rect.left,  rect.bottom))
    );
}