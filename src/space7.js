
var playerShip;

$(document).ready(
    function() {
        playerShip = new Ship(new Point(0,0), ships[0], new HumanPlayer(controls));
        var otherShip = new Ship(new Point(-150,-150), ships[0], new Player());
        
        $('#viewport').append(playerShip.getRootElement(), otherShip.getRootElement());

        initStars();
        
        updateRadar()
        gameloop();
    });
    
    
function cloneStatus(newIdPrefix) {
    var newStatus = $('#status').clone();
    
    newStatus.children().each( function () {
            $(this).attr('id', newIdPrefix + $(this).attr('id'));
        });
}
    
function updateStatus(ship) {
    var pos = ship.getPos().div(100);
    $("#pos").text(pos.x.toFixed(2) + ", " + (pos.y*-1).toFixed(2));

    var data = [ship.getArmor(), ship.getShield(), ship.getBattleEnergy()];
    var idPrefix = ["hp", "shield", "energy"];
    
    for (var i = 0; i < 3; i++) {
        var asString = data[i].toPrecision(3);
        if (asString.length < 4) {
            asString += "&nbsp;".repeat(4 - asString.length);
        }
    
        $("#"+idPrefix[i]).html(asString);
        $("#"+idPrefix[i]+"Bar").css('width', data[i]);
        $("#"+idPrefix[i]+"BarBack").css('width', 100-data[i]);
    }
}
function updateRadar() {
    var radar = $("#radar");
    radar.empty();
    radar.append('RADAR');
    $(".ship").each(function() {
            var colour;
            if ($(this).data('gameData')) {
                if (!isUndef($(this).data('gameData').getPlayer())) {
                    colour = $(this).data('gameData').getPlayer().getTeamColour();
                } else {
                    colour= 'grey';
                }
                var pos = $(this).data('gameData').getPos().sub(playerShip.getPos()).div(50).add(new Point(59, 59));
                radar.append('<div style="position: absolute; background: '+colour+'; left:'+pos.x+'; top:'+pos.y+'; width: 3px; height: 3px; opacity: 1"></div>');
            }
        });
}

var lastLoopTime = now();
var lastLoopHadError = false;
var errorCount = 0;

function gameloop() {
    try {
        var current = now();
        var delta = (current - lastLoopTime) / 1000;
        lastLoopTime = current;
        
        $(".ship").each( function() {
            $(this).data('gameData').doPlayerInput(delta);
        });

        StarFieldStar.viewPortVel = playerShip.getVel();

        $(".sprite").each( function() {
            $(this).data('gameData').update(delta);
        });

        var allShips = $(".ship");
        allShips.each( function(index, obj) {
            // all except current + the ones we already checked
            var restOfTheShips = allShips.slice(index+1);
            restOfTheShips.each( function() {
                // the if catches the case of a deleted (dead) sprite
                if ($(this).data('gameData') && $(obj).data('gameData')) {
                    $(this).data('gameData').checkForHit($(obj).data('gameData'));
                }
            })
        });
        
        updateRadar();
        
        updateStatus(playerShip);

        var viewPortPos = playerShip.getPos().neg().add(Point.windowSize().div(2));
        $('#viewport').css(viewPortPos.getAsCSSPosition());

        $(".sprite").each( function() {
            $(this).data('gameData').updateRenderPos();
        });
        
        lastLoopHadError = false;
    } catch (ex) {
        var msg = ex;
        if (!isUndef(ex.stack)) {
            msg = ex.stack;
            msg = msg.replace(/\n/g, "<br>");
            msg = msg.replace(/ /g, "&nbsp;");
        }
        logDebug("Error in gameloop: "+msg);
        
        if (lastLoopHadError) {
            errorCount ++;
        }
        lastLoopHadError = true;
    }
    
    if (errorCount > 5) {
        logDebug("too many errors exiting game loop");
    } else {
        window.setTimeout(gameloop, 10);
    }
}    
