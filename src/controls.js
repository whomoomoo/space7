
var controls = { up: false, down: false, left: false, right: false, fire: false, pause: false, findTarget: false };
// key number to action name
var controlEventMap = {39:'left', 37:'right', 38:'up', 40:'down', 32:'fire', 84:'findTarget', 27:'pause'};
var controlDesc = [
    "--- SPACE 7 Game Keys ---",
    "left arrow key: turn left",
    "right arrow key: turn right", 
    "up arrow key: move forwards",
    "down arrow key: move back",
    "space bar: fire primary weapon",
    "t key: find new target",
    "esc key: pause game",
    "F5: restart",
    "-- press space to start the game --",
];

$(document).keydown(
    function(event){
        if (!isUndef(controlEventMap[event.which])) {
            controls[ controlEventMap[event.which] ] = true;
        }
    });

$(document).keyup(
    function(event){
        var wasPause = controls.pause;
        if (!isUndef(controlEventMap[event.which])) {
            controls[ controlEventMap[event.which] ] = false;
        }
        
        if (startMenu && event.which == 32) {
            wasPause = true;
            startMenu = false;
        }
        
        if (wasPause) {
            paused = !paused;
            
            if (paused) {
                $('#messageOverlay').html('PAUSED');
            } else {
                $('#messageOverlay').html('');
                lastLoopTime = now();
                gameloop();
            }
        }
    });