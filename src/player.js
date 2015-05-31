

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
    this.target = null;
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

function DumbAIPlayer() {
    Player.call(this);

   this.doPlayerInput = function (delta, ship) {
        var angleDiff = this.computeDestAngle(ship);
        var distance = this.computeDistanceToTarget(ship);

        if (Math.abs(angleDiff) > 3) {
            if(angleDiff > 0)
                ship.left(delta);
            else 
                ship.right(delta);
        }
        
        if (distance > 100 && Math.abs(angleDiff) < 30) {
            ship.forwards(delta);
        } else if (distance < 50 && Math.abs(angleDiff) < 30) {
            ship.backwards(delta);
        }
        
        if (distance > 200 && Math.abs(angleDiff) < 5) {
            ship.fire(delta);
        }
        
        // $('#debug').html("destAngle "+angleDiff + "<br>current angle "+ship.getAngle().toFixed(0));

    }
    
    this.computeDestAngle = function (ship) {
            var currentAngle = Vector.atAngle(ship.getAngle()).normalize();
            var destAngle = ship.target.getPos().sub(ship.getPos()).normalize();
        
            // from cross product
            var direction = currentAngle.x * destAngle.y - currentAngle.y * destAngle.x;
            
            var diffAngle =  Math.radToDeg( Math.acos(currentAngle.dotProduct(destAngle)) );
            
            if (Math.sign(direction) !== 0) {
                return diffAngle * Math.sign(direction);
            } else {
                return Math.sign(direction);
            }
        }
    
    this.computeDistanceToTarget = function (ship) {
            return ship.target.getPos().sub(ship.getPos()).length();
        }
}