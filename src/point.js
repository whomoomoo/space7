
class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    
    add (point) {
        return new Point(this.x+point.x, this.y+point.y);
    }
    sub (pt) {
        return this.add(pt.neg());
    }
    mult (value) {
        return new Point(this.x*value,this.y*value);
    }   
    div (value) {
        return this.mult(1.0/value);
    }
    neg () {
        return this.mult(-1);
    }
    rotate (rad) {
        return new Point(this.x * Math.cos(rad) - this.y * Math.sin(rad),
                         this.x * Math.sin(rad) + this.y * Math.cos(rad));
    }
    get length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    normalize () {
            var length = this.length
            if (length !== 0) {
                return this.div(length);
            } else {
                return this
            }
        }
    distance (pt) {
        return this.sub(pt).length;
    }
    dotProduct(pt) {
        return this.x * pt.x + this.y * pt.y;
    }
    getAsCSSPosition () {
        return {left: this.x + 'px', top: this.y + 'px'};
    }
    toString() {
        return `x: $(this.x y: $(this.y`
    }

    static fromArray ([x, y]) {
        return new Point(x, y)
    }

    static random (range = null) {
        if (range == null) {
            return new Point(Math.random(), Math.random());
        } else {
            return new Point(intRand(0, range.x), intRand(0, range.y));
        }
    }

    static windowSize () {
        return new Point($(window).width(), $(window).height())
    }

    static zero () {
        return new Point(0,0)
    }


}

var Vector = {};
Vector.atAngle = function (angle) {
    return new Point(0, -1).rotate(angle * Math.PI / 180);
}

Math.degToRad = function(deg) {
    return deg * Math.PI / 180;
}

Math.radToDeg = function(rad) {
    return rad / Math.PI * 180;
}
