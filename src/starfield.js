const colours = ["0000FF", "999999", "FFFFFF"];

class StarFieldStar extends Sprite {
    constructor(pos, zdistance) {
        super(pos)
    
        this.rootElement.addClass("stars");
        this._zdistance = zdistance;

        if (zdistance > 2) {
            let colour = intRand(0, 2);
            
            this.rootElement.css("width", "2px");
            this.rootElement.css("height", "2px");
            this.rootElement.css("background-color", colours[colour]);
        } else {
            this.loadImage(boolRand() ? "bigstar1.png" : "bigstar2.png", [6, 6]);
        }
    }
    
    update(delta) {
        let vel = StarFieldStar.viewPortVel.mult(delta / this._zdistance * -1);
        let newPos = this.pos.add(vel);
        if (newPos.x > $(window).width()) {
            newPos.x -= $(window).width();
        }
        if (newPos.x < 0) {
            newPos.x += $(window).width();
        }
        if (newPos.y > $(window).height()) {
            newPos.y -= $(window).height();
        }
        if (newPos.y < 0) {
            newPos.y += $(window).height();
        }
        this.pos = newPos;
    };
}
StarFieldStar.MaxDistance = 11;
StarFieldStar.viewPortVel = new Point(0, 0);

$(window).resize(
    function () {        
        $(".stars").remove();
        initStars();
    });

function initStars() {
    let viewportSize = Point.windowSize().x * Point.windowSize().y;

    for(let i = 0; i < Math.floor(viewportSize/10000); i++){
        let distance = floatRand(1, StarFieldStar.MaxDistance);
        
        let star = new StarFieldStar(Point.random(Point.windowSize()), distance);
        $('body').append(star.rootElement);
    };
}