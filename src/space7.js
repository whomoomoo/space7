var playerShip;
var paused = true;
var startMenu = true;
var playerStatus;
var targetStatus;

$(document).ready(
    function() {
        playerShip = new InteractiveSprite(new Point(0,0), ships[0], new HumanPlayer(controls));
        var otherShip = new InteractiveSprite(new Point(-150,-150), ships[1], new SmartAIPlayer());
        
        $('#viewport').append(playerShip.rootElement, otherShip.rootElement);

        playerShip.player.findTarget()

        initStars();
        
        playerStatus = buildStatusUI(200, "Player")
        targetStatus = buildStatusUI(130, "Target")

        $('body').append(playerStatus.rootElement, targetStatus.rootElement)
        
        $('#messageOverlay').html(controlDesc.join('<br>'));
        
        renderAll();
        gameloop();
    });
    
function updateRadar() {
    var radar = $("#radar");
    radar.empty();
    radar.append('RADAR');
    $(".interactiveSprite").each(function() {
            var colour;
            if ($(this).gameData() != null) {
                if ($(this).gameData().player != null) {
                    colour = $(this).gameData().player.teamColour;
                } else {
                    colour= 'grey';
                }
                var pos = $(this).gameData().pos.sub(playerShip.pos).div(50).add(new Point(59, 59));
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
        var allInteractiveSprites = $(".interactiveSprite");
        allInteractiveSprites.each( function(index, obj) {
            // all except current + the ones we already checked
            var restOfTheInteractiveSprites = allInteractiveSprites.slice(index+1);
            restOfTheInteractiveSprites.each( function() {
                // the if catches the case of a deleted (dead) sprite
                if ($(this).gameData() && $(obj).gameData()) {
                    $(this).gameData().checkForHit($(obj).gameData());
                }
            })
        });
        
        renderAll();
        
        lastLoopHadError = false;
    } catch (ex) {
        var msg = ex;
        if (ex.stack) {
            msg = ex.stack.replace(/\n/g, "<br>").replace(/ /g, "&nbsp;");
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
    
    playerStatus.update(playerShip);
    targetStatus.update(playerShip.player.target);

    var viewPortPos = playerShip.pos.neg().add(Point.windowSize().div(2));
    $('#viewport').css(viewPortPos.getAsCSSPosition());
}
