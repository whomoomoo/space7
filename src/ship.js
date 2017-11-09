
function Ship(pos, properties, player) {
    Sprite.call(this, pos, getPropertyWithDefault(properties, 'lifetime', undefined));
    this.properties = properties;

    var superClass = createObjectForSuperClassCall(this);
    var fireDelay = 0;
    var shieldElement;
    var shields = 0;
    var armor = 0;
    var battleEnergy = 0;
    
    if (!isUndef(properties.shields)) {
        shieldElement = $(document.createElement('img'));
        shieldElement.attr('src', 'shield1.png');
        shieldElement.addClass('shield');
        shieldElement.css({width: properties.image.size[0] + 'px', height: properties.image.size[1] + 'px'});
        this.getRootElement().append(shieldElement);
        
        shields = properties.shields.max;
    }
    if (!isUndef(properties.armor)) {
        armor = properties.armor;
    }
    if (!isUndef(properties.battleEnergy)) {
        battleEnergy = properties.battleEnergy.max;
    }
    if (!isUndef(properties.weapon)) {
        properties.weapon.maxVelocity = properties.weapon.velocity + properties.maxVelocity;
    }

    var updateShieldRender = function () {
            var shieldOpacity = shields / (properties.shields.max *  2);
            
            shieldElement.css('opacity', Math.floor(shieldOpacity*10)/10);
        }
    
    Sprite.loadImage(this.getRootElement(), properties.image);
    this.getRootElement().addClass('ship');
    
    // player commands
    this.forwards = function (delta) {
        this.setVel( this.getVel().add(Vector.atAngle(this.getAngle()).mult(properties.acceleration*delta)) );
    }
    this.backwards = function (delta) {
        this.setVel( this.getVel().add(Vector.atAngle(this.getAngle()).mult(-0.5*properties.acceleration*delta)) );
    }
    this.left = function (delta) {
        var shipAngle = this.getAngle();
        shipAngle += properties.rotationRate * delta;
        this.setAngle(shipAngle);
    } 
    this.right = function (delta) {
        var shipAngle = this.getAngle();
        shipAngle -= properties.rotationRate * delta;
        this.setAngle(shipAngle);
    }
    this.fire = function (delta) {
        if (!isUndef(properties.weapon) && fireDelay <= 0 && battleEnergy >= properties.weapon.damage*properties.weapon.pattern.length) {
            var weaponRadius = Math.max(properties.weapon.image.size[0], properties.weapon.image.size[1])/2;

            var direction = Vector.atAngle(this.getAngle());

            var vel = this.getVel().add(direction.mult(properties.weapon.velocity))
            var pos = this.getPos().add(direction.mult(this.getRadius()+weaponRadius+1))
            
            fireDelay = (weaponRadius*2) / vel.length() * delta;

            for (var i = 0; i < properties.weapon.pattern.length; i++) {
                pos = this.getPos().add(new Point(properties.weapon.pattern[i][0], properties.weapon.pattern[i][1])
                        .normalize().rotate(this.getAngle() * Math.PI / 180).mult(this.getRadius()+weaponRadius+1));
                
                var particle = new Ship(pos, properties.weapon);
                particle.setVel(vel);
                
                battleEnergy -= properties.weapon.damage;
                
                $('#viewport').append(particle.getRootElement());
            }
            
            playSound('laser');
        }
    }
    
    // update loop utils
    this.checkForHit = function (otherShip) {
        if (otherShip.getPos().distance(this.getPos()) < this.getRadius() + otherShip.getRadius()) {
            if (otherShip.getDamage() == 0 && this.getDamage() == 0) {
                var tmp = otherShip.getVel();
                otherShip.setVel(this.getVel());
                this.setVel(tmp);
                
                // ensure we do not overlap
                var extraDistNeeded = ((this.getRadius() + otherShip.getRadius()) - otherShip.getPos().distance(this.getPos()))
                
                if (otherShip.getVel().length() + this.getVel().length() === 0) {
                    // use vector between the two ships instead
                    var vector = this.getPos().sub(otherShip.getPos()).normalize()

                    this.move(this.getVel().normalize().mult(extraDistNeeded  / 2));
                    otherShip.move(otherShip.getVel().normalize().mult(extraDistNeeded / 2));
                } else {
                    var weight = this.getVel().length() / (otherShip.getVel().length() + this.getVel().length())
                    this.move(this.getVel().normalize().mult(extraDistNeeded * weight));
                    otherShip.move(otherShip.getVel().normalize().mult(extraDistNeeded * (1 - weight)));
                }
                
                playSound("bounce");
            } else {
                otherShip.hit(this.getDamage());
                this.hit(otherShip.getDamage());
            }
        }
    }
    this.hit = function(dmg) {
        if (shields > 0) {
            shields -= dmg;
            if (shields < 0) {
                dmg = shields * -1;
                shields = 0;
            } else {
                dmg = 0;
            }
            updateShieldRender();
        }
        
        if (armor > 0) {
            armor -= dmg;
        }
        
        if (armor <= 0 && shields <= 0) {
            this.getRootElement().remove();
        }
    }
    
    this.getDamage = function () {
        if (isUndef(properties.damage)) {
            return 0;
        } else {
            return properties.damage;
        }
    }
    this.getArmor = function () {
        return armor / properties.armor * 100;
    }
    this.getShield = function () {
        return shields / properties.shields.max * 100;
    }
    this.getBattleEnergy = function () {
        return battleEnergy / properties.battleEnergy.max *100;
    }
    this.setVel = function (pt) {
        if (pt.length() > properties.maxVelocity) {
            pt = pt.normalize().mult(properties.maxVelocity);
        }
        
        superClass.setVel(pt);
    }
    
    this.update = function (delta) {
        superClass.update(delta);
        
        if (fireDelay > 0) {
            fireDelay -= delta;
        }
        
        if (!isUndef(properties.shields) && shields < properties.shields.max) {
            shields = Math.min(properties.shields.max, shields + properties.shields.rechargeRate * delta);
            updateShieldRender();
        }
        
        if (!isUndef(properties.battleEnergy) && battleEnergy < properties.battleEnergy.max) {
            battleEnergy = Math.min(properties.battleEnergy.max, battleEnergy + properties.battleEnergy.rechargeRate * delta);
        }
    }
    
    this.doPlayerInput = function(delta) {
        if (!isUndef(player)) {
            player.doPlayerInput(delta, this);
        }
    }
    this.getPlayer = function() {
        if(!isUndef(player)) {
            return player; 
        } else {
            return null;
        }
    }
    
    this.isDead = function() {
        return armor <= 0 && shields <= 0;
    }

    this.toDBGString = function () {
        return "Ship pos: " + this.getPos().toString() + ", vel: " + this.getVel()
    }
}