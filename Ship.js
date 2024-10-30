

class Ship {
    #shieldGradient = undefined;
    #maxShieldRadiusRatio = 1.1;
    #minShieldRadiusRatio = 0.8;
    #xAimCollision = null;
    #yAimCollision = null;
    #aimDashOffset = 0;
    #sprite;
    #spriteWidth;
    #spriteHeight;
    #aimAngle;
    #xAim;
    #yAim;

    constructor(x, y) {
        this.#sprite = new AnimatedSprite(shipSprite, 4, 2, 200);
        this.#spriteWidth = 50;
        this.#spriteHeight = this.#sprite.height / this.#sprite.width * this.#spriteWidth;
        this.#sprite.xAnchorRatio = 0.5;
        this.#sprite.yAnchorRatio = 0.44;
        this.#sprite.baseAngle = Math.PI / 2;
        this.solid = new SolidDisc(x, y, 0.75* this.#spriteWidth);

        this.course = 'aim';
        this.#aimAngle = this.solid.angle;
        this.#xAim = x;
        this.#yAim = y;
    }

    frameReset(){
        this.solid.store();
        this.solid.ax = this.solid.ay = 0;
        this.#sprite.currentRow = 0;
    }

    aim(x,y){
        this.#xAim = x;
        this.#yAim = y;
        const dx = x - this.solid.x;
        const dy = y - this.solid.y;
        if( dx*dx + dy*dy > 0 ){
            this.#aimAngle = Math.atan2(dy,dx);
        }
    }

    fireEngine(){
        let engineAcceleration = 0.00005;
        this.solid.ax += Math.cos( this.solid.angle ) * engineAcceleration;
        this.solid.ay += Math.sin( this.solid.angle ) * engineAcceleration;
        this.#sprite.currentRow = 1;
    }

    #seekAngle(){
        let angle = 0;

        switch( this.course ){
            case 'retrograde':
                angle = Math.PI;
            case 'prograde':
                angle += Math.atan2( this.solid.vy, this.solid.vx );
                break;
            case 'aim':
                angle = this.#aimAngle;
                break;
            default:
                console.error('No such course: ' + this.course );
        }

        if( angle !== this.solid.angle ){
            let da = ExtraMath.normAngle( angle - this.solid.angle );
            this.solid.angularVelocity = da / (2*Math.PI) * 0.05;
        }
    }

    updateAim(obstacles){
        let collisions = [];
        obstacles.forEach( p => {
            let collision = Solid.collisionLineDisc(this.solid.x, this.solid.y, this.#xAim, this.#yAim, p.solid );
            if( collision !== null )
                collisions.push(collision);
        });
        // Find which collision occurs first if many
        this.#xAimCollision = null;
        this.#yAimCollision = null;
        let dClosest = Number.MAX_VALUE;
        collisions.forEach( coords => {
            if( Math.abs(coords[0] - this.solid.x) < dClosest ){
                this.#xAimCollision = coords[0];
                this.#yAimCollision = coords[1];
            }
        });
    }

    updatePhysics(dt) {
        this.#seekAngle();
        this.solid.update(dt);
    }

    #drawAim(drawer, world){
        const rTarget = 10;
        let dr = this.solid.r * this.#maxShieldRadiusRatio;
        if( ExtraMath.distanceSquared( this.#xAim, this.#yAim, this.solid.x, this.solid.y ) > dr*dr )
        {
            const dashes = [10,20];
            drawer.ctx.setLineDash(dashes);
            drawer.ctx.lineDashOffset = this.#aimDashOffset;
            this.#aimDashOffset -= 1;
            const shieldOffset = this.solid.r * this.#maxShieldRadiusRatio;
            const [xShield, yShield] = ExtraMath.offsetAlongLine( this.solid.x, this.solid.y, this.#xAim, this.#yAim, shieldOffset );
            
            let alpha = 1;
            const lineWidth = 2;
            drawer.ctx.strokeStyle = 'rgba(255,0,0,1)';
            drawer.ctx.fillStyle = 'yellow';
            let [xShieldDraw, yShieldDraw] = world.worldToDrawCoords( xShield, yShield );
            let [xAimDraw, yAimDraw] = world.worldToDrawCoords( this.#xAim, this.#yAim );
            if( this.#xAimCollision === null ){
                
                drawer.strokeLine( xShieldDraw, yShieldDraw, xAimDraw, yAimDraw, lineWidth );
            }
            else{
                let [xDraw, yDraw] = world.worldToDrawCoords( this.#xAimCollision, this.#yAimCollision );
                drawer.strokeLine( xShieldDraw, yShieldDraw, xDraw, yDraw, lineWidth );
                alpha = 0.5;
            }
            drawer.ctx.lineDashOffset = 0;
            // Draw aim
            drawer.ctx.strokeStyle = 'rgba(255,255,0,' + alpha + ')';
            drawer.ctx.fillStyle = 'rgba(255,0,0,' + alpha + ')';
            drawer.fillCircle( xAimDraw, yAimDraw, lineWidth );
            let targetDash = rTarget*Math.PI/3;
            drawer.ctx.lineDashOffset = -this.#aimAngle * rTarget + targetDash / 2;
            drawer.ctx.setLineDash([targetDash, targetDash]);
            drawer.strokeCircle( xAimDraw, yAimDraw, rTarget, 2);
            drawer.ctx.setLineDash([]);
        }
    }

    #drawShield(drawer, world) {
        if( !this.#shieldGradient )
        {
            this.#shieldGradient = drawer.ctx.createRadialGradient(0, 0, this.solid.r * this.#minShieldRadiusRatio, 
                0, 0, this.solid.r * this.#maxShieldRadiusRatio)
            this.#shieldGradient.addColorStop(0, 'rgba(255,0,255,0)');
            this.#shieldGradient.addColorStop(0.75, 'rgba(255,0,255,0.75)');
            this.#shieldGradient.addColorStop(1, 'rgba(255,0,255,0)');
        }
        let [xDraw, yDraw] = world.worldToDrawCoords( this.solid.x, this.solid.y);
        drawer.ctx.save();
        drawer.ctx.translate( xDraw, yDraw );
        drawer.ctx.strokeStyle = this.#shieldGradient;
        drawer.strokeCircle( 0, 0, this.solid.r*(this.#maxShieldRadiusRatio + this.#minShieldRadiusRatio)/2,
            this.solid.r*(this.#maxShieldRadiusRatio - this.#minShieldRadiusRatio ));
        drawer.ctx.restore();
    }

    draw(drawer, world) {
        let [xDraw, yDraw] = world.worldToDrawCoords( this.solid.x, this.solid.y);
        this.#sprite.drawSprite(drawer, xDraw, yDraw, this.#spriteWidth, this.#spriteHeight, this.solid.angle);
        this.#drawShield(drawer, world);
        this.#drawAim(drawer,world);
    }
}