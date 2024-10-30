class Solid {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        
        this.store();

        this.angle = 0;
        this.angularVelocity = 0;
        this.angularAcceleration = 0;

        this.mass = 1;
    }

    store() {
        this.x0 = this.x;
        this.y0 = this.y;
        this.vx0 = this.vx;
        this.vy0 = this.vy;
        this.ax0 = this.ax;
        this.ay0 = this.ay;
    }

    isInside() {
        // Must be overridden
        console.error('Solid.isInside() not overridden');
    }

    update(dt) {
        this.vx += this.ax*dt;
        this.vy += this.ay*dt;
        this.x += (this.vx0 + this.vx)*0.5*dt;
        this.y += (this.vy0 + this.vy)*0.5*dt;

        this.angle = ExtraMath.normAngle( this.angle + this.angularVelocity*dt );
        this.angularVelocity += this.angularAcceleration*dt;
    }

    static distanceSquared(a,b){
        return ExtraMath.distanceSquared( a.x, a.y, b.x, b.y );
    }

    static distance(a,b){
        return Math.sqrt( this.distanceSquared(a,b) );
    }

    static collision(a, b) {
        switch (a.type) {
            case 'rect':
                return this.collisionAnyRect(b, a);
                break;
            case 'disc':
                return this.collisionDisc(a, b);
                break;
            default:
                // Should never happen
                console.error('Unknown solid ' + a.type);
        }
    }
    
    static collisionDisc(a, b) {
        switch (b.type) {
            case 'rect':
                return this.collisionAnyRect(a, b);
                break;
            case 'disc':
                return this.collisionDiscDisc(a, b);
                break;
            default:
                // Should never happen
                console.error('Unknown solid ' + b.type);
        }
    }
    
    static collisionDiscDisc(a, b) {
        const dist = a.r + b.r;
        return this.distanceSquared(a,b) < dist * dist;
    }
    
    static collisionAnyRect(a, b) {
        const c = Math.cos(b.angle);
        const s = Math.sin(b.angle);
        return a.isInside(b.x * c - b.y * s, b.x * s + b.y * c) ||
               a.isInside(b.x * c - (b.y + b.height) * s, b.x * s + (b.y + b.height) * c) ||
               a.isInside((b.x + b.width) * c - b.y * s, (b.x + b.width) * s + b.y * c) ||
               a.isInside((b.x + b.width) * c - (b.y + b.height) * s, (b.x + b.width) * s + (b.y + b.height) * c);
    }

    static collisionLineDisc(x1,y1,x2,y2,disc){
        let x;
        if( x1 === x2 )
        {
            if( y1 === y2 )
                return null; // Not defining a line
            let dx = x1 - disc.x;
            if( Math.abs(dx) < disc.r ){
                let dy = Math.sqrt( disc.r*disc.r - dx*dx );
                if( y1 < y2 )
                    dy *= -1;
                let y = disc.y + dy;
                if( y )
                x = disc.x + dx;
                if( y < Math.min(y1,y2) || y > Math.max(y1,y2) ) // Outside range
                    return null;
                else
                    return [x,y]
            }
            else
                return null; // No solution
        }
        else{
            let k = (y2-y1)/(x2-x1);
            let m = y1 - k*x1;

            let tmp = m - disc.y;
            let a = 1 + k*k;
            let b = 2*( k*tmp - disc.x );
            let c = disc.x*disc.x + tmp*tmp - disc.r*disc.r;
            
            let solutions = ExtraMath.solve2eq(a,b,c);
            if( solutions === [] ){
                return null;
            }
            if( solutions.length === 1 ){
                x = solutions[0];
            }
            else{
                // Pick a candidate
                if( solutions[0] < Math.min(x1,x2) || solutions[0] > Math.max(x1,x2) ) // Outside range
                    x = solutions[1];
                else if( solutions[1] < Math.min(x1,x2) || solutions[1] > Math.max(x1,x2) ) // Outside range
                    x = solutions[0];
                else
                    x = Math.abs(solutions[0] - x1) < Math.abs(solutions[1] - x1) ? solutions[0] : solutions[1];
            }
            if( x < Math.min(x1,x2) || x > Math.max(x1,x2) ) // Outside range
                return null;
            
            let y = k*x + m;
            return [x, y];
        }
    }
}

class SolidDisc extends Solid {
    constructor(x, y, radius) {
        super(x, y);
        this.type = 'disc';
        this.r = radius;
    }
    isInside(x, y) {
        const dx = this.x - x;
        const dy = this.y - y;
        return dx * dx + dy * dy < this.r * this.r;
    }
    // four first arguments define a normal vector to the wall starting at the collision point
    bounceWall( x0, y0, x1, y1, dampening ){
        [x1, y1] = ExtraMath.unitVector( x0, y0, x1, y1 );
        // Find radial component
        let vr = x1*this.vx + y1*this.vy;
        let vrx = vr*x1;
        let vry = vr*y1;

        this.vx -= (1+dampening)*vrx;
        this.vy -= (1+dampening)*vry;

        let d = this.r - ExtraMath.distance( this.x, this.y, x0, y0 );
        this.x -= x1*2*d;
        this.y -= y1*2*d;
    }
    bounceDisc( disc, dampening ){
        let [x1, y1] = ExtraMath.unitVector( this.x, this.y, disc.x, disc.y );
        // Find radial component
        let vr = x1*this.vx + y1*this.vy;
        let vrx = vr*x1;
        let vry = vr*y1;

        this.vx -= (1+dampening)*vrx;
        this.vy -= (1+dampening)*vry;

        let d = this.r + disc.r - ExtraMath.distance( this.x, this.y, disc.x, disc.y );
        this.x -= x1*2*d;
        this.y -= y1*2*d;
    }
}

class SolidRect extends Solid {
    constructor(x, y, w, h) {
        super(x, y);
        this.type = 'rect';
        this.width = w;
        this.height = h;
    }
    isInside(x, y) {
        const c = Math.cos(this.angle);
        const s = Math.sin(this.angle);
        const dx = x - this.x;
        const dy = y - this.y;
        const rotx = dx * c - dy * s;
        const roty = dx * s + dy * c;
        return abs(rotx) < b.width / 2 && abs(roty) < b.height / 2;
    }
}