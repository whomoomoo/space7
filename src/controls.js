
let controls = { up: false, down: false, left: false, right: false, fire: false, pause: false, findTarget: false };
// key number to action name
let controlEventMap = {39:'left', 37:'right', 38:'up', 40:'down', 32:'fire', 84:'findTarget', 27:'pause'};
let controlDesc = [
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
        if (controlEventMap[event.which] !== undefined) {
            controls[ controlEventMap[event.which] ] = true;
        }
    });

$(document).keyup(
    function(event){
        let wasPause = controls.pause;
        if (controlEventMap[event.which] !== undefined) {
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