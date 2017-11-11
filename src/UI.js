
class StatusBar {
    constructor (value) {
        this.rootElement = $(document.createElement('div'))
        this.rootElement.addClass("ui")
        this.rootElement.addClass("bar")
        this.rootElement.css('background', '#004400')
        
        // actual bar
        this._bar =  $(document.createElement('div'))
        this._bar.css('background', '#00AA00')
        this.rootElement.append(this._bar)

        this._value = value
    }

    get value() { return value }
    set value(value) {
        this._value = Math.abs(value) % 101 
        this._bar.css('width', this._value)
        this._bar.css('height', this.rootElement.height())        
    }
}

function buildStatusUI (ypos, title) {
    function br () {
        return $(document.createElement('br'))
    }  
    function label (width) {
        let label = $(document.createElement('div'))
        label.addClass("label")
        if (width !== undefined) {
            label.css("width", width+"px")
        }
        return label
    }       

    let status = $(document.createElement('div'))
    status.addClass("status")
    status.addClass("ui")
    status.css("left", "0px")
    status.css("bottom", ypos+"px")
    
    let titleDiv = $(document.createElement('div'))
    titleDiv.addClass("status-title")
    titleDiv.text(title)

    let statusUI = {
        rootElement : status,
        position : { label: label() },
        armor    : { label: label(30), bar: new StatusBar(100) },
        shields  : { label: label(30), bar: new StatusBar(100) },
        energy   : { label: label(30), bar: new StatusBar(100) },
        update   : function(ship) {
            if (ship == null) {
                statusUI.rootElement.hide();
                return;
            }
            
            statusUI.rootElement.show();
        
            var pos = ship.pos.div(100);
            statusUI.position.label.text(pos.x.toFixed(2) + ", " + (pos.y*-1).toFixed(2));
        
            var displayInfo = [ [ship.armor, statusUI.armor], [ship.shield, statusUI.shields], [ship.battleEnergy, statusUI.energy]] 
            
            for (var [data, ui] of displayInfo) {
                var asString = data.toPrecision(3)
            
                ui.label.text(asString);
                ui.bar.value = data
            }
        } 
    }

    status.append(titleDiv, "Position ", statusUI.position.label, br(),
                    "Armor : ", statusUI.armor.label, statusUI.armor.bar.rootElement, br(),
                    "Sheild: ", statusUI.shields.label, statusUI.shields.bar.rootElement, br(),
                    "Energy: ", statusUI.energy.label, statusUI.energy.bar.rootElement)

    return statusUI
}