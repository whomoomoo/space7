
class StatusBar {
    constructor (value, width = 100) {
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

    get value() { return this._value }
    set value(value) {
        this._value = Math.abs(value) % (this._width+1) 
        this._bar.css('width', this._value)
        this._bar.css('height', this.rootElement.height())        
    }
    get width() { return this._width }
    set width(width) {
        this._width = width 
        this.rootElement.css('width', this._width)
        this.rootElement.css('height', this.rootElement.height()) 
        
        if (this.value > width) {
            this.value = width
        }
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
        
            let pos = ship.pos.div(100);
            statusUI.position.label.text(pos.x.toFixed(2) + ", " + (pos.y*-1).toFixed(2));
        
            let displayInfo = [ [ship.armor, statusUI.armor, ship.properties.armor],
                                [ship.shields, statusUI.shields, ship.properties.shields.max], 
                                [ship.battleEnergy, statusUI.energy, ship.properties.battleEnergy.max]] 
            
            for (let [data, ui, max] of displayInfo) {
                let asString = data.toPrecision(3)
            
                ui.label.text(asString);
                ui.bar.value = data
                ui.bar.width = max                
            }
        } 
    }

    status.append(titleDiv, "Position ", statusUI.position.label, br(),
                    "Armor : ", statusUI.armor.label, statusUI.armor.bar.rootElement, br(),
                    "Sheild: ", statusUI.shields.label, statusUI.shields.bar.rootElement, br(),
                    "Energy: ", statusUI.energy.label, statusUI.energy.bar.rootElement)

    return statusUI
}