
function Player() {
    var teamColours = ['#4444FF', '#FF4444', '#FFFF99', '#FF99FF'];
    var teamId = Player.nextTeamId++ % 4;
    this.target = null;
    
    this.getTeamId = function() {
        return teamId;
    }
    this.getTeamColour = function() {
        return teamColours[teamId];
    }
    this.doPlayerInput = function () {}
    this.findTarget = function (me) {
        var ships = $('.ship');
        var i =0;
        
        for (i = 0; i < ships.length; i++) {
            if($(ships[i]).data('gameData') == me){
                break;
            }
        }
        
        for (var j = (i+1)%ships.length; j != i; j = (j+1)%ships.length) {
            var otherShip = $(ships[j]).data('gameData');
            if(otherShip != null && !isUndef(otherShip) &&
                otherShip.player !== null &&
                otherShip.player.getTeamId() != teamId){
                return otherShip;
            }
        }
        
        return null;
    }
}
Player.nextTeamId = 0;

function HumanPlayer(controls) {
    Player.call(this);

    this.doPlayerInput = function (delta, ship) {
        if (controls.findTarget) {
            this.target = this.findTarget(ship);
            controls.findTarget = false;
        }
        if (this.target != null && this.target.isDead) {
            this.target = null;
        }
    
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
        if (this.target != null && this.target.isDead) {
            this.target = null;
        }
        if (this.target == null) {
            this.target = this.findTarget(ship);
            
            if (this.target == null) {
                return null;
            }
        }
   
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
        
        if (distance < 150 && Math.abs(angleDiff) < 5) {
            ship.fire(delta);
        }
        
        // $('#debug').html("destAngle "+angleDiff + "<br>current angle "+ship.angle.toFixed(0));
    }
    
    this.computeDestAngle = function (ship) {
            var currentAngle = Vector.atAngle(ship.angle).normalize();
            var destAngle = this.target.pos.sub(ship.pos).normalize();
        
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
            return this.target.pos.distance(ship.pos);
        }
}

function SmartAIPlayer() {
    DumbAIPlayer.call(this);
    var runAway = false;

    this.doPlayerInput = function (delta, ship) { 
        if (this.target != null && this.target.isDead) {
            this.target = null;
        }
        if (this.target == null) {
            this.target = this.findTarget(ship);
            
            if (this.target == null) {
                return null;
            }
        }
   
        var angleDiff = this.computeDestAngle(ship);
        var distance = this.computeDistanceToTarget(ship);

        if (ship.battleEnergy < 10) {
            runAway = true;
        } else if (ship.battleEnergy > 75) {
            runAway = false;
        }

        if (runAway) {
            angleDiff *= -1;
        }

        if (Math.abs(angleDiff) > 3) {        
            if(angleDiff > 0)
                ship.left(delta);
            else 
                ship.right(delta);
        }
        
        if (runAway) {
          //  if  Math.abs(angleDiff) < 30) {
                ship.forwards(delta);
            //}
        } else {
            if (distance > 100 && Math.abs(angleDiff) < 30) {
                ship.forwards(delta);
            } else if (distance < 50 && Math.abs(angleDiff) < 30) {
                ship.backwards(delta);
            }
        }    
    
        if (distance < 150 && Math.abs(angleDiff) < 5 && !runAway) {
            ship.fire(delta);
        }
        
        // $('#debug').html("destAngle "+angleDiff + "<br>current angle "+ship.angle.toFixed(0));
    }
}