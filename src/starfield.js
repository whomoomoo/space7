function StarFieldStar(pos, zdistance) {
    Sprite.call(this, pos);
    
    this.getRootElement().addClass("stars");

    if (zdistance > 2) {
        var colours = ["0000FF", "999999", "FFFFFF"];
        var colour = intRand(0, 2);
        
        this.getRootElement().css("width", "2px");
        this.getRootElement().css("height", "2px");
        this.getRootElement().css("background-color", colours[colour]);
    } else {
        Sprite.loadImage(this.getRootElement(), {url: boolRand() ? "bigstar1.png" : "bigstar2.png", size: [6, 6]});
    }
    
    this.update = function(delta) {
        var vel = StarFieldStar.viewPortVel.mult(delta / zdistance * -1);
        var newPos = this.getPos().add(vel);
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
        this.setPos(newPos);
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
    var viewportSize = Point.windowSize().x * Point.windowSize().y;

    for(var i = 0; i < Math.floor(viewportSize/10000); i++){
        var distance = floatRand(1, StarFieldStar.MaxDistance);
        
        var star = new StarFieldStar(Point.random(Point.windowSize()), distance);
        $('body').append(star.getRootElement());
    };
}