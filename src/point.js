
function Point(x, y) {
    this.x = x;
    this.y = y;
    
    this.add = function (pt) {
            return new Point(this.x+pt.x,this.y+pt.y);
        }
    this.sub = function (pt) {
            return new Point(this.x-pt.x,this.y-pt.y);
        }
    this.mult = function (pt) {
        return new Point(this.x*pt,this.y*pt);
        }   
    this.div = function (pt) {
        return new Point(this.x/pt,this.y/pt);
        }
    this.neg = function () {
            return this.mult(-1);
        }
    this.rotate = function (rad) {
            return new Point(this.x * Math.cos(rad) - this.y * Math.sin(rad),
                             this.x * Math.sin(rad) + this.y * Math.cos(rad));
        }
    this.length = function () {
            return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        }
    this.normalize = function () {
            return new Point(this.x,this.y).div(this.length());
        }
    this.distance = function (pt) {
            return this.sub(pt).length();
        }
        
    this.getAsCSSPosition = function () {
            return {left: x + 'px', top: y + 'px'};
        }
}

Point.random = function (range) {
    if (isUndef(range)) {
        return new Point(Math.random(), Math.random());
    } else {
        return new Point(intRand(0, range.x), intRand(0, range.y));
    }
}

Point.windowSize = function () {
    return new Point($(window).width(), $(window).height());
}

Point.zero = new Point(0,0);

var Vector = {};
Vector.atAngle = function (angle) {
    return new Point(0, -1).rotate(angle * Math.PI / 180);
}

