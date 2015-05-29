

function Player() {
    var teamColours = ['#4444FF', '#FF4444', '#FFFF99', '#FF99FF'];
    var teamId = Player.nextTeamId++ % 4;
    
    this.getTeamId = function() {
        return teamId;
    }
    this.getTeamColour = function() {
        return teamColours[teamId];
    }
    this.doPlayerInput = function () {}
}
Player.nextTeamId = 0;

function HumanPlayer(controls) {
    Player.call(this);

    this.doPlayerInput = function (delta, ship) {
        if (controls.up) {
            ship.forwards(delta);
        } else if (controls.down) {
            ship.backwards(delta);
        }

        if (controls.left) {
            ship.left(delta);
        } 
        if (controls.right) {
            ship.right(delta);
        }
        if (controls.fire) {
            ship.fire(delta);
        }
    }
}