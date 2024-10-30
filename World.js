class World{
    constructor(w,h,vpx,vpy,vpw,vph){
        this.width = w;
        this.height = h;
        this.vpx = vpx;
        this.vpy = vpy;
        this.vpw = vpw;
        this.vph = vph;
    }

    updateViewport(xShip,yShip){
        const boundary = 100; // The distance the ship can roam freely from the centre without moving the viewport
        const vpcx = this.vpx + this.vpw / 2;
        const vpcy = this.vpy + this.vph / 2;
        if( ExtraMath.distanceSquared( xShip, yShip, vpcx, vpcy ) < boundary*boundary )
            return;

        // Find closest coords within boundary of ship, these will define the new viewport centre
        let [xNew, yNew] = ExtraMath.offsetAlongLine( xShip, yShip, vpcx, vpcy, boundary );
        xNew = Math.max( xNew, this.vpw/2);
        xNew = Math.min( xNew, this.width - this.vpw/2);
        yNew = Math.max( yNew, this.vph/2);
        yNew = Math.min( yNew, this.height - this.vph/2);

        this.vpx = xNew - this.vpw/2;
        this.vpy = yNew - this.vph/2;
    }

    worldToDrawCoords(wx,wy){
        let x = wx - this.vpx;
        let y = wy - this.vpy;
        return [x,y];
    }

    drawToWorldCoords(x,y){
        let wx = this.vpx + x;
        let wy = this.vpy + y;
        return [wx,wy];
    }

    drawBorders(drawer){
        const borderWidth = 5;
        drawer.ctx.strokeStyle = 'rgb(150,150,0,1)';
        drawer.ctx.setLineDash([50,40]);
        if( this.vpx < borderWidth ){
            drawer.ctx.lineDashOffset = this.vpy;
            drawer.strokeLine( borderWidth/2 - this.vpx, 0,
                               borderWidth/2 - this.vpx, this.vph,
                               borderWidth);
        }
        if( this.vpx + this.vpw > this.width - borderWidth ){
            drawer.ctx.lineDashOffset = this.vpy;
            drawer.strokeLine( this.vpw - borderWidth/2 - (this.vpx + this.vpw - this.width), 0, 
                               this.vpw - borderWidth/2 - (this.vpx + this.vpw - this.width), this.vph,
                               borderWidth);
        }
        if( this.vpy < borderWidth ){
            drawer.ctx.lineDashOffset = this.vpx;
            drawer.strokeLine( 0,        borderWidth/2 - this.vpy, 
                               this.vpw, borderWidth/2 - this.vpy,
                               borderWidth);
        }
        if( this.vpy + this.vph > this.height - borderWidth ){
            drawer.ctx.lineDashOffset = this.vpx;
            drawer.strokeLine( 0,        this.vph - borderWidth/2 - (this.vpy + this.vph - this.height),
                               this.vpw, this.vph - borderWidth/2 - (this.vpy + this.vph - this.height),
                               borderWidth);
        }
        drawer.ctx.setLineDash([]);
        drawer.ctx.lineDashOffset = 0;
    }
}