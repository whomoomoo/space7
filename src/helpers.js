
function logDebug(msg) {
    $('#debug').html(msg+'<br>'+$('#debug').html());
}

function now() {
    return new Date().getTime();
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

function parseColour(colourString) {
    var retval = colourString.match(/(\w\w)(\w\w)(\w\w)/);
    
    if (retval != null) {
        return jQuery.map(retval.slice(1), function (value){ return parseInt(value, 16); });
    }
    
    //errorLog("parseColour can't parse " + colourString);
    return null;
}

jQuery.fn.extend({
    playSound : function() {
        return this.each(function() {
            this.pause();
            this.currentTime = 0;
            this.play();
        });
    }
});

function playSound(effect) {
    $("#sound"+effect).playSound();
}