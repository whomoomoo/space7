
class Ship extends Sprite {
    constructor (pos, properties, player = null) {
        super (pos, getPropertyWithDefault(properties, 'lifetime', undefined))
        this.properties = properties;

        this._fireDelay = 0
        this._shieldElement
        this._shields = 0
        this._armor = 0
        this._battleEnergy = 0
        this.player = player            
        
        if (!isUndef(properties.shields)) {
            this._shieldElement = $(document.createElement('img'));
            this._shieldElement.attr('src', 'shield1.png');
            this._shieldElement.addClass('shield');
            this._shieldElement.css({width: properties.image.size[0] + 'px', height: properties.image.size[1] + 'px'});
            this.rootElement.append(this._shieldElement);
            
            this._shields = properties.shields.max;
        }
        
        if (!isUndef(properties.armor)) {
            this._armor = properties.armor;
        }
        if (!isUndef(properties.battleEnergy)) {
            this._battleEnergy = properties.battleEnergy.max;
        }
        if (!isUndef(properties.weapon)) {
            this.properties.weapon.maxVelocity = properties.weapon.velocity + properties.maxVelocity;
        }

        Sprite.loadImage(this.rootElement, properties.image);
        this.rootElement.addClass('ship');
    }

    _updateShieldRender() {
        var shieldOpacity = this.shields / (this.properties.shields.max *  2);
            
        this._shieldElement.css('opacity', Math.floor(shieldOpacity*10)/10);
    }
    
    // player commands
    forwards (delta) {
        this.vel = this.vel.add(Vector.atAngle(this.angle).mult(this.properties.acceleration*delta));
    }
    backwards (delta) {
        this.vel = this.vel.add(Vector.atAngle(this.angle).mult(-0.5*this.properties.acceleration*delta));
    }
    left (delta) {
        this.angle = this.angle + this.properties.rotationRate * delta
    } 
    right (delta) {
        this.angle = this.angle - this.properties.rotationRate * delta
    }
    fire (delta) {
        if (!isUndef(this.properties.weapon) && this._fireDelay <= 0 && this._battleEnergy >= this.properties.weapon.damage*this.properties.weapon.pattern.length) {
            var weaponRadius = Math.max(this.properties.weapon.image.size[0], this.properties.weapon.image.size[1])/2;

            var direction = Vector.atAngle(this.angle);

            var vel = this.vel.add(direction.mult(this.properties.weapon.velocity))
            var pos = this.pos.add(direction.mult(this.radius+weaponRadius+1))
            
            this._fireDelay = (weaponRadius*2) / vel.length * delta;

            for (var i = 0; i < this.properties.weapon.pattern.length; i++) {
                var pos = this.pos.add(new Point(this.properties.weapon.pattern[i][0], this.properties.weapon.pattern[i][1])
                        .normalize().rotate(this.angle * Math.PI / 180).mult(this.radius+weaponRadius+1));
                
                var particle = new Ship(pos, this.properties.weapon);
                particle.vel = vel;
                
                this._battleEnergy -= this.properties.weapon.damage;
                
                $('#viewport').append(particle.rootElement);
            }
            
            playSound('laser');
        }
    }
    
    // update loop utils
    checkForHit (otherShip) {
        if (otherShip.pos.distance(this.pos) < this.radius + otherShip.radius) {
            if (otherShip.damage == 0 && this.damage == 0) {
                [otherShip.vel, this.vel] = [this.vel, otherShip.vel];
                
                // ensure we do not overlap
                var extraDistNeeded = ((this.radius + otherShip.radius) - otherShip.pos.distance(this.pos))
                
                if (otherShip.vel.length + this.vel.length === 0) {
                    // use vector between the two ships instead
                    var vector = this.pos.sub(otherShip.pos).normalize()

                    this.move(this.vel.normalize().mult(extraDistNeeded  / 2));
                    otherShip.move(otherShip.vel.normalize().mult(extraDistNeeded / 2));
                } else {
                    var weight = this.vel.length / (otherShip.vel.length + this.vel.length)
                    this.move(this.vel.normalize().mult(extraDistNeeded * weight));
                    otherShip.move(otherShip.vel.normalize().mult(extraDistNeeded * (1 - weight)));
                }
                
                playSound("bounce");
            } else {
                otherShip.hit(this.damage);
                this.hit(otherShip.damage);
            }
        }
    }
    hit(dmg) {
        if (this._shields > 0) {
            this._shields -= dmg;
            if (this._shields < 0) {
                dmg = this._shields * -1;
                this._shields = 0;
            } else {
                dmg = 0;
            }
            this._updateShieldRender();
        }
        
        if (this._armor > 0) {
            this._armor -= dmg;
        }
        
        if (this.isDead) {
            this.rootElement.remove();
        }
    }
    
    get damage () {
        if (isUndef(this.properties.damage)) {
            return 0;
        } else {
            return this.properties.damage;
        }
    }
    get armor () {
        return this._armor / this.properties.armor * 100;
    }
    get shield () {
        return this._shields / this.properties.shields.max * 100;
    }
    get battleEnergy () {
        return this._battleEnergy / this.properties.battleEnergy.max *100;
    }
    set vel (vector) {
        if (vector.length > this.properties.maxVelocity) {
            vector = vector.normalize().mult(this.properties.maxVelocity);
        }
        
        super.vel = vector
    }
    get vel () { return super.vel }
    
    update (delta) {
        super.update(delta);
        
        if (this._fireDelay > 0) {
            this._fireDelay -= delta;
        }
        
        if (!isUndef(this.properties.shields) && this._shields < this.properties.shields.max) {
            this._shields = Math.min(this.properties.shields.max, this._shields + this.properties.shields.rechargeRate * delta);
            this._updateShieldRender();
        }
        
        if (!isUndef(this.properties.battleEnergy) && this._battleEnergy < this.properties.battleEnergy.max) {
            this._battleEnergy = Math.min(this.properties.battleEnergy.max, this._battleEnergy + this.properties.battleEnergy.rechargeRate * delta);
        }
    }
    
    doPlayerInput(delta) {
        if (this.player != null) {
            this.player.doPlayerInput(delta, this);
        }
    }
    
    get isDead () {
        return this._armor <= 0 && this._shields <= 0;
    }

    toDBGString () {
        return `Ship pos: $(this.pos) vel: $(this.vel)`
    }
}