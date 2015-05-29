
function Ship(pos, properties, player) {
    Sprite.call(this, pos, getPropertyWithDefault(properties, 'lifetime', undefined));
    this.properties = properties;

    var superClass = createObjectForSuperClassCall(this);
    var fireDelay = 0;
    var shieldElement;
    var shield = 0;
    var armor = 0;
    var battleEnergy = 0;
    
    if (!isUndef(properties.shields)) {
        shieldElement = $(document.createElement('img'));
        shieldElement.attr('src', 'shield1.png');
        shieldElement.addClass('shield');
        shieldElement.css({width: properties.size[0] + 'px', height: properties.size[1] + 'px'});
        this.getRootElement().append(shieldElement);
        
        shield = properties.shields;
    }
    if (!isUndef(properties.armor)) {
        armor = properties.armor;
    }
    if (!isUndef(properties.battleEnergy)) {
        battleEnergy = properties.battleEnergy;
    }
    if (!isUndef(properties.weapon)) {
        properties.weapon.maxVelocity = properties.weapon.velocity + properties.maxVelocity;
    }

    var updateShieldRender = function () {
            var shieldOpacity = shield / (properties.shields *  2);
            
            shieldElement.css('opacity', Math.floor(shieldOpacity*10)/10);
        }
    
    this.loadImage(properties.image, properties.size);
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
        if (shipAngle > 360) {
            shipAngle -= 360;
        }
        this.setAngle(shipAngle);
    } 
    this.right = function (delta) {
        var shipAngle = this.getAngle();
        shipAngle -= properties.rotationRate * delta;
        if (shipAngle < 0) {
            shipAngle += 360;
        }
        this.setAngle(shipAngle);
    }
    this.fire = function (delta) {
        if (!isUndef(properties.weapon) && fireDelay <= 0 && battleEnergy >= properties.weapon.cost) {
            var weaponRadius = Math.max(properties.weapon.size[0], properties.weapon.size[1])/2;

            var direction = Vector.atAngle(this.getAngle());
            var vel = this.getVel().add(direction.mult(properties.weapon.velocity))
            var pos = this.getPos().add(direction.mult(this.getRadius()+weaponRadius+1))
            
            var particle = new Ship(pos, properties.weapon);
            particle.setVel(vel);
            
            fireDelay = (weaponRadius*2) / vel.length() * delta;
            
            battleEnergy -= properties.weapon.cost;
            
            $('#viewport').append(particle.getRootElement());
        }
    }
    
    // update loop utils
    this.checkForHit = function (otherShip) {
        if (otherShip.getPos().distance(this.getPos()) <= this.getRadius() + otherShip.getRadius()) {
            if (otherShip.getDamage() == 0 && this.getDamage() == 0) {
                var tmp = otherShip.getVel();
                otherShip.setVel(this.getVel());
                this.setVel(tmp);
            } else {
                otherShip.hit(this.getDamage());
                this.hit(otherShip.getDamage());
            }
        }
    }
    this.hit = function(dmg) {
        if (shield > 0) {
            shield -= dmg;
            if (shield < 0) {
                dmg = shield * -1;
                shield = 0;
            } else {
                dmg = 0;
            }
            updateShieldRender();
        }
        
        if (armor > 0) {
            armor -= dmg;
        }
        
        if (armor <= 0 && shield <= 0) {
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
        return shield / properties.shields * 100;
    }
    this.getBattleEnergy = function () {
        return battleEnergy / properties.battleEnergy *100;
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
        
        if (!isUndef(properties.shields) && shield < properties.shields) {
            shield = Math.min(properties.shields, shield + properties.shieldsRechargeRate * delta);
            updateShieldRender();
        }
        
        if (!isUndef(properties.battleEnergy) && battleEnergy < properties.battleEnergy) {
            battleEnergy = Math.min(properties.battleEnergy, battleEnergy + properties.battleEnergeyRechargeRate * delta);
        }
    }
    
    this.doPlayerInput = function(delta) {
        if (!isUndef(player)) {
            player.doPlayerInput(delta, this);
        }
    }
    this.getPlayer = function() { return player; }
}