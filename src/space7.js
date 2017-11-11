let playerShip;
let paused = true;
let startMenu = true;
let playerStatus;
let targetStatus;

$(document).ready(
    function() {
        playerShip = new InteractiveSprite(new Point(0,0), ships[0], new HumanPlayer(controls));
        let otherShip = new InteractiveSprite(new Point(-150,-150), ships[1], new SmartAIPlayer());
        
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
    let radar = $("#radar");
    radar.empty();
    radar.append('RADAR');
    $(".interactiveSprite").each(function() {
            let colour;
            if ($(this).gameData() != null) {
                if ($(this).gameData().player != null) {
                    colour = $(this).gameData().player.teamColour;
                } else {
                    colour= 'grey';
                }
                let pos = $(this).gameData().pos.sub(playerShip.pos).div(50).add(new Point(59, 59));
                radar.append('<div style="position: absolute; background: '+colour+'; left:'+pos.x+'; top:'+pos.y+'; width: 3px; height: 3px; opacity: 1"></div>');
            }
        });
}

let lastLoopTime = now();
let lastLoopHadError = false;
let errorCount = 0;

function gameloop() {
    try {
        let current = now();
        let delta = (current - lastLoopTime) / 1000;
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
        let allInteractiveSprites = $(".interactiveSprite");
        allInteractiveSprites.each( function(index, obj) {
            // all except current + the ones we already checked
            let restOfTheInteractiveSprites = allInteractiveSprites.slice(index+1);
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
        let msg = ex;
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

    let viewPortPos = playerShip.pos.neg().add(Point.windowSize().div(2));
    $('#viewport').css(viewPortPos.getAsCSSPosition());
}
