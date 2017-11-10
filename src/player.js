var teamColours = ['#4444FF', '#FF4444', '#FFFF99', '#FF99FF'];

class Player {
    constructor () {
        this.teamId = Player.nextTeamId++ % 4;
        this.target = null;
        this.interactiveSprite = null
    }
    
    get teamColour() {
        return teamColours[this.teamId];
    }

    // control methods
    update() {}
    get shouldTurnLeft() { return false }
    get shouldTurnRight() { return false }
    get shouldGoForward() { return false }
    get shouldGoBackward() { return false }
    // weapon index or null for none
    get shouldFireWeapon() { return null }
    
    findTarget() {
        var interactiveSprites = $('.interactiveSprite');
        var i = 0;
        
        for (i = 0; i < interactiveSprites.length; i++) {
            if($(interactiveSprites[i]).gameData() === this.interactiveSprite){
                break;
            }
        }
        
        for (var j = (i+1)%interactiveSprites.length; j != i; j = (j+1)%interactiveSprites.length) {
            var otherInteractiveSprites = $(interactiveSprites[j]).gameData();
            if(otherInteractiveSprites != null &&
                otherInteractiveSprites.player !== null &&
                otherInteractiveSprites.player.teamId != this.teamId){
                return otherInteractiveSprites;
            }
        }
        
        return null;
    }
}
Player.nextTeamId = 0;

class HumanPlayer extends Player {
    constructor (controls) {
        super()
        this._controls = controls
    }

    update() {
        if (controls.findTarget) {
            this.target = this.findTarget();
            controls.findTarget = false;
        }
        if (this.target != null && this.target.isDead) {
            this.target = null;
        }
    }

    get shouldTurnLeft() { return controls.left }
    get shouldTurnRight() { return controls.right }
    get shouldGoForward() { return controls.up }
    get shouldGoBackward() { return controls.down }
    // weapon index or null for none
    get shouldFireWeapon() { return controls.fire ? 0 : null }
}

class DumbAIPlayer extends Player {
    constructor () {
        super()
        this._angleDiff = 0;        
        this._distance = 0;                
    }        

    update () { 
        if (this.target != null && this.target.isDead) {
            this.target = null;
        }
        if (this.target == null) {
            this.target = this.findTarget();
            
            if (this.target == null) {
                return;
            }
        }
   
        this._angleDiff = this.computeDestAngle();
        this._distance = this.computeDistanceToTarget();

        // $('#debug').html("destAngle "+angleDiff + "<br>current angle "+ship.angle.toFixed(0));
    }

    get shouldTurnLeft() { return this._angleDiff > 3 }
    get shouldTurnRight() { return this._angleDiff < -3 }
    get shouldGoForward() { return this._distance > 100 && Math.abs(this._angleDiff) < 30 }
    get shouldGoBackward() { return this._distance < 50 && Math.abs(this._angleDiff) < 30 }
    // weapon index or null for none
    get shouldFireWeapon() { return distance < 150 && Math.abs(angleDiff) < 5 }
    
    computeDestAngle () {
        var currentAngle = Vector.atAngle(this.interactiveSprite.angle).normalize();
        var destAngle = this.target.pos.sub(this.interactiveSprite.pos).normalize();
    
        // from cross product
        var direction = currentAngle.x * destAngle.y - currentAngle.y * destAngle.x;
        
        var diffAngle =  Math.radToDeg( Math.acos(currentAngle.dotProduct(destAngle)) );
        
        if (Math.sign(direction) !== 0) {
            return diffAngle * Math.sign(direction);
        } else {
            return Math.sign(direction);
        }
    }
    
    computeDistanceToTarget () {
        return this.target.pos.distance(this.interactiveSprite.pos);
    }
}

class SmartAIPlayer extends DumbAIPlayer {
    constructor () {
        super()
        this._runAway = false;   
        this._angleDiff = 0;        
        this._distance = 0;                
    }        

    update () { 
        if (this.target != null && this.target.isDead) {
            this.target = null;
        }
        if (this.target == null) {
            this.target = this.findTarget();
            
            if (this.target == null) {
                return;
            }
        }
   
        if (this.interactiveSprite.battleEnergy < 10) {
            this._runAway = true;
        } else if (this.interactiveSprite.battleEnergy > 75) {
            this._runAway = false;
        }

        this._angleDiff = this.computeDestAngle();
        this._distance = this.computeDistanceToTarget();

        if (this._runAway) {
            this._angleDiff *= -1;
        }
        
        // $('#debug').html("destAngle "+angleDiff + "<br>current angle "+ship.angle.toFixed(0));
    }

    get shouldTurnLeft() { return this._angleDiff > 3 }
    get shouldTurnRight() { return this._angleDiff < -3 }
    get shouldGoForward() { return this._runAway || (this._distance > 100 && Math.abs(this._angleDiff) < 30) }
    get shouldGoBackward() { return ! this._runAway && this._distance < 50 && Math.abs(this._angleDiff) < 30 }
    // weapon index or null for none
    get shouldFireWeapon() { return (this._distance < 150 && Math.abs(this._angleDiff) < 5 && !this._runAway) ? 0 : null; }
}