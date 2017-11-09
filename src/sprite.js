
class Sprite {
    constructor(pos, lifetime = null) {
        this._element = $(document.createElement('div'));
        this._vel = new Point(0,0);
        this._angle = 0;
        this._lifetime = lifetime;
        
        this._element.addClass("sprite");
        this._element.data('gameData', this)

        this.pos = pos;      
    }

    get pos () { return this._pos }
    set pos (point) { 
        this._pos = point 

        var cssPos = this._pos.sub(this.size.div(2));
        
        this._element.css(cssPos.getAsCSSPosition());
    }
    move (vector) {
        this.pos = this.pos.add(vector)
    }

    get vel () { return this._vel }
    set vel (vector) { this._vel = vector } 

    set angle(angle) {
        this._angle = angle % 360;
        this._element.css("transform", "rotate("+this._angle+"deg)")
    }
    get angle () { return this._angle }    
    get size () {
        return new Point(this._element.width(), this._element.height());
    }
    get radius () {
        return Math.max(this._element.width()/2, this._element.height()/2);
    }
    get rootElement() { return this._element; }

    update (delta) {
        this.move(this._vel.mult(delta));

        if (this._lifetime != null) {
            this._lifetime -= delta;
            
            if (this._lifetime <= 0) {
                this._element.remove();
            }
        }
    }

    loadImage(url, size, tile = null) {
        this.rootElement.css({width: size[0] + 'px', height: size[1] + 'px'});
        this.rootElement.css("background-image",  "url("+url+")");
        if (tile != null) {
            this.rootElement.css("background-position", "-"+tile[0]*size[0] + 'px -' + tile[1]*size[1] + 'px');
        }
    }
}

Sprite.foreach = function (fcn, selector = '.sprite') { 
    $(selector).each(function(){
            fcn.call($(this).data('gameData'));
        });
}