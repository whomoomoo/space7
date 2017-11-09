
class Sprite {
    constructor(pos, lifetime) {
        this._element = $(document.createElement('div'));
        this._vel = new Point(0,0);
        this._angle = 0;
        this._pos = pos;
        this._lifetime = lifetime;

        this._element.addClass("sprite");
        this._element.data('gameData', this)

        this.updateRenderPos();        
    }

    get pos () { return this._pos }
    set pos (point) { this._pos = point }
    move (vector) {
        this._pos = this._pos.add(vector)
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
    
        if (!isUndef(this._lifetime)) {
            this._lifetime -= delta;
            
            if (this._lifetime <= 0) {
                this._element.remove();
            }
        }
    }
    updateRenderPos() {
        var cssPos = this._pos.sub(this.size.div(2));
        
        this._element.css(cssPos.getAsCSSPosition());
    };

    static loadImage(div, image) {
        div.css({width: image.size[0] + 'px', height: image.size[1] + 'px'});
        div.css("background-image",  "url("+image.url+")");
        if (!isUndef(image.tile)) {
            div.css("background-position", "-"+image.tile[0]*image.size[0] + 'px -' + image.tile[1]*image.size[1] + 'px');
        }
    }
}

Sprite.foreach = function (selector, fcn) {
    if (isUndef(fcn)) {
        fcn = selector;
        selector = '.sprite';
    }
    
    $(selector).each(function(){
            fcn.call($(this).data('gameData'));
        });
}