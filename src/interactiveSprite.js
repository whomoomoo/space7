
// a sprite that interacts (damages, bounces, etc) with other sprites
// and is optionally controlled by a player
class InteractiveSprite extends Sprite {
    constructor (pos, properties, player = null) {
        super (pos, properties.lifetime)
        this.properties = properties;

        this._fireDelay = 0
        this._shieldElement
        this._shields = 0
        this._armor = 0
        this._battleEnergy = 0
        this.player = player
        if (player != null) {
            player.interactiveSprite = this             
        }
        
        if (properties.shields !== undefined) {
            this._shieldElement = $(document.createElement('img'));
            this._shieldElement.attr('src', 'shield1.png');
            this._shieldElement.addClass('shield');
            this._shieldElement.css({width: properties.image.size[0] + 'px', height: properties.image.size[1] + 'px'});
            this.rootElement.append(this._shieldElement);
            
            this.shields = properties.shields.max;
        }
        
        if (properties.armor !== undefined) {
            this._armor = properties.armor;
        }
        if (properties.battleEnergy !== undefined) {
            this._battleEnergy = properties.battleEnergy.max;
        }
        if (properties.weapon != undefined) {
            this.properties.weapon.maxVelocity = properties.weapon.velocity + properties.maxVelocity;
        }

        this.loadImage(properties.image.url, properties.image.size, properties.image.tile);
        this.rootElement.addClass('interactiveSprite');
    }
    
    // update loop utils
    checkForHit (interactiveSprite) {
        if (interactiveSprite.pos.distance(this.pos) < this.radius + interactiveSprite.radius) {
            if (interactiveSprite.damage == 0 && this.damage == 0) {
                [interactiveSprite.vel, this.vel] = [this.vel, interactiveSprite.vel];
                
                // ensure we do not overlap
                let extraDistNeeded = ((this.radius + interactiveSprite.radius) - interactiveSprite.pos.distance(this.pos))
                
                if (interactiveSprite.vel.length + this.vel.length === 0) {
                    // use vector between the two sprites instead
                    let vector = this.pos.sub(interactiveSprite.pos).normalize()

                    this.move(this.vel.normalize().mult(extraDistNeeded  / 2));
                    interactiveSprite.move(interactiveSprite.vel.normalize().mult(extraDistNeeded / 2));
                } else {
                    let weight = this.vel.length / (interactiveSprite.vel.length + this.vel.length)
                    this.move(this.vel.normalize().mult(extraDistNeeded * weight));
                    interactiveSprite.move(interactiveSprite.vel.normalize().mult(extraDistNeeded * (1 - weight)));
                }
                
                playSound("bounce");
            } else {
                interactiveSprite.hit(this.damage);
                this.hit(interactiveSprite.damage);
            }
        }
    }
    
    hit(dmg) {
        let shields = this.shields
        if (shields > 0) {
            shields -= dmg
            if (shields < 0) {
                dmg = shields * -1
                shields = 0
            } else {
                dmg = 0
            }
            this.shields = shields
        }
        
        if (this._armor > 0) {
            this._armor -= dmg
        }
        
        if (this.isDead) {
            this.rootElement.remove()
        }
    }
    
    get damage () {
        if (this.properties.damage === undefined) {
            return 0
        } else {
            return this.properties.damage
        }
    }
    get armor () {
        return this._armor;
    }
    get shields () {
        return this._shields
    }
    set shields (value) {
        this._shields = Math.bounds(value, 0, this.properties.shields.max)

        let shieldOpacity = this._shields / (this.properties.shields.max *  2);
        
        this._shieldElement.css('opacity', shieldOpacity);
    }
    get battleEnergy () {
        return this._battleEnergy;
    }
    set vel (vector) {
        if (vector.length > this.properties.maxVelocity) {
            vector = vector.normalize().mult(this.properties.maxVelocity);
        }
        
        super.vel = vector
    }
    get vel () { return super.vel }
    
    update (delta) {
        if (this.player != null) {
            this.player.update()

            if (this.player.shouldGoForward) {
                this.vel = this.vel.add(Vector.atAngle(this.angle).mult(this.properties.acceleration*delta));                
            } else if (this.player.shouldGoBackwards) {
                this.vel = this.vel.add(Vector.atAngle(this.angle).mult(-0.5*this.properties.acceleration*delta));                
            }
            if (this.player.shouldTurnRight) {
                this.angle = this.angle - this.properties.rotationRate * delta
            } else if (this.player.shouldTurnLeft) {
                this.angle = this.angle + this.properties.rotationRate * delta
            }
        }            

        super.update(delta);

        if (this._fireDelay > 0) {
            this._fireDelay -= delta;
        }

        if (this.player != null) {
            let weaponToFire = this.player.shouldFireWeapon
            if (weaponToFire != null) {
                this.fire()
            }
        }  
        
        if (this.properties.shields !== undefined && this._shields < this.properties.shields.max) {
            this.shields = Math.min(this.properties.shields.max, this._shields + this.properties.shields.rechargeRate * delta);
        }
        
        if (this.properties.battleEnergy !== undefined && this._battleEnergy < this.properties.battleEnergy.max) {
            this._battleEnergy = Math.min(this.properties.battleEnergy.max, this._battleEnergy + this.properties.battleEnergy.rechargeRate * delta);
        }
    }
    
    fire () {
        if (this.properties.weapon !== undefined && this._fireDelay <= 0 && this._battleEnergy >= this.properties.weapon.damage*this.properties.weapon.pattern.length) {
            let weaponRadius = Math.max(this.properties.weapon.image.size[0], this.properties.weapon.image.size[1])/2;

            let direction = Vector.atAngle(this.angle);

            let vel = this.vel.add(direction.mult(this.properties.weapon.velocity))
            let pos = this.pos.add(direction.mult(this.radius+weaponRadius+1))
            
            this._fireDelay = (weaponRadius*2.5) / vel.length;

            for (let pattern of this.properties.weapon.pattern) {
                let pos = this.pos.add(Point.fromArray(pattern)
                                .normalize().rotate(this.angle * Math.PI / 180)
                                .mult(this.radius+weaponRadius+1));
                
                let particle = new InteractiveSprite(pos, this.properties.weapon);
                particle.vel = vel;
                
                this._battleEnergy -= this.properties.weapon.damage;
                
                $('#viewport').append(particle.rootElement);
            }
            
            playSound('laser');
        }
    }
    
    get isDead () {
        return this._armor <= 0 && this._shields <= 0;
    }

    toDBGString () {
        return `InteractiveSprite pos: $(this.pos) vel: $(this.vel)`
    }
}