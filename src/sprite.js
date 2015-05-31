
function Sprite(pos1, lifetime) {
    var element = $(document.createElement('div'));
    var vel = new Point(0,0);
    var angle = 0;
    var pos = pos1;
    
    element.addClass("sprite");
    element.data('gameData', this);

    this.setPos = function (pt) {
        pos = pt;
    }
    this.getPos = function () {
        return pos;
    }
    this.setVel = function (pt) {
        vel = pt;
    }
    this.getVel = function () {
        return vel;
    }    
    this.setAngle = function (angle1) {
        angle = angle1;
        element.css("transform", "rotate("+angle+"deg)")
    }
    this.getAngle = function () {
        return angle;
    }  
    this.getSize = function () {
        return new Point(element.width(), element.height());
    }
    this.getRadius = function () {
        return Math.max(element.width()/2, element.height()/2);
    }
    this.getRootElement = function() { return element; }
    this.update = function (delta) {
        this.setPos(pos.add(vel.mult(delta)));
    
        if (!isUndef(lifetime)) {
            lifetime -= delta;
            
            if (lifetime <= 0) {
                element.remove();
            }
        }
    }
    this.updateRenderPos = function () {
        var cssPos = pos.sub(this.getSize().div(2));
        
        element.css(cssPos.getAsCSSPosition());
    };
    
    this.updateRenderPos();    
}

Sprite.loadImage = function(div, image) {
    div.css({width: image.size[0] + 'px', height: image.size[1] + 'px'});
    div.css("background-image",  "url("+image.url+")");
    if (!isUndef(image.tile)) {
        div.css("background-position", "-"+image.tile[0]*image.size[0] + 'px -' + image.tile[1]*image.size[1] + 'px');
    }
}

Sprite.foreach = function(selector, fcn) {
    if (isUndef(fcn)) {
        fcn = selector;
        selector = '.sprite';
    }
    
    $(selector).each(function(){
            fcn.call($(this).data('gameData'));
        });
}