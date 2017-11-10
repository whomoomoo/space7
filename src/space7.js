var playerShip;
var paused = true;
var startMenu = true;

$(document).ready(
    function() {
        playerShip = new Ship(new Point(0,0), ships[0], new HumanPlayer(controls));
        var otherShip = new Ship(new Point(-150,-150), ships[1], new SmartAIPlayer());
        
        $('#viewport').append(playerShip.rootElement, otherShip.rootElement);

        playerShip.player.findTarget()

        initStars();
        cloneStatus('target');
        
        $('#messageOverlay').html(controlDesc.join('<br>'));
        
        renderAll();
        gameloop();
    });
    
function cloneStatus(newIdPrefix) {
    var newStatus = $('#status').clone();
    
    newStatus.children().each( function () {
            $(this).attr('id', newIdPrefix + $(this).attr('id'));
        });
    newStatus.attr('id', newIdPrefix + "status");
    
    $('#status').before(newStatus);
    $('#'+newIdPrefix+'title').html(newIdPrefix);

    var ypos = $('#radar').outerHeight()+10;
    $('.status').each( function() {
            $(this).css('bottom', ypos);
            ypos+=$(this).outerHeight()+10;
        })
}
    
function updateStatus(ship, prefix) {
    if (ship == null) {
        $('#'+prefix+'status').hide();
        return;
    }
    
    $('#'+prefix+'status').show();

    var pos = ship.pos.div(100);
    $("#pos").text(pos.x.toFixed(2) + ", " + (pos.y*-1).toFixed(2));

    var data = [ship.armor, ship.shield, ship.battleEnergy];
    var idPrefix = [prefix+"hp", prefix+"shield", prefix+"energy"];
    
    for (var i = 0; i < 3; i++) {
        var asString = data[i].toPrecision(3);
        if (asString.length < 5) {
            asString += "&nbsp;".repeat(5 - asString.length);
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
                if ($(this).data('gameData').player != null) {
                    colour = $(this).data('gameData').player.teamColour;
                } else {
                    colour= 'grey';
                }
                var pos = $(this).data('gameData').pos.sub(playerShip.pos).div(50).add(new Point(59, 59));
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
        
        if (paused) {
            return;
        }

        StarFieldStar.viewPortVel = playerShip.vel;

        // physics and input updates
        Sprite.foreach( function() {
            this.update(delta);
        });

        // hit detection
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
        
        renderAll();
        
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

function renderAll() {
    updateRadar();
    
    updateStatus(playerShip, '');
    updateStatus(playerShip.player.target, 'target');

    var viewPortPos = playerShip.pos.neg().add(Point.windowSize().div(2));
    $('#viewport').css(viewPortPos.getAsCSSPosition());
}
