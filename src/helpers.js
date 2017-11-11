
function logDebug(msg) {
    $('#debug').html(msg+'<br>'+$('#debug').html());
}

function now() {
    return new Date().getTime();
}

function floatRand(min, max) {
    let num = max - min + 1;
    
    return (Math.random() * num)+min;
}

function intRand(min, max) {    
    return Math.floor(floatRand(min, max));
}

function boolRand() {    
    return intRand(0, 1) === 0;
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