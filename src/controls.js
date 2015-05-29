
var controls = { up: false, down: false, left: false, right: false, fire: false };

$(document).keydown(
    function(event){
        if (event.which == 39) {
            controls.left = true;
        } else if (event.which == 37) { 
            controls.right = true;
        } else if (event.which == 38) {
            controls.up = true;
        } else if (event.which == 40) {
            controls.down = true;
        } else if (event.which == 32) {
            controls.fire = true;
        }
    });

$(document).keyup(
    function(event){
        if (event.which == 39) {
            controls.left = false;
        } else if (event.which == 37) { 
            controls.right = false;
        } else if (event.which == 38) {
            controls.up = false;
        } else if (event.which == 40) {
            controls.down = false;
        } else if (event.which == 32) {
            controls.fire = false;
        }
    });