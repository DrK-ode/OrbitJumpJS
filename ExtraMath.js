var ExtraMath = {
    distanceSquared: function(x1,y1,x2,y2){
        const dx = x1 - x2;
        const dy = y1 - y2;
        return dx*dx + dy*dy;
    },

    distance: function(x1,y1,x2,y2){
        return Math.sqrt( this.distanceSquared(x1,y1,x2,y2) );
    },

    rem: function(a,b){
        let n = Math.floor(a / b);
        if( n < 0 ) n++;
        return a - n*b
    },

    normAngle: function(a){
        a = this.rem(a, 2*Math.PI);
        if( a > Math.PI ) a -= 2* Math.PI;
        else if( a < -Math.PI ) a += 2* Math.PI;
        return a;
    },

    intersectionLineLine: function(a1,b1,a2,b2){
        if( a1 === a2)
            return null;
        const x = (b1-b2)/(a1-a2);
        const y = (a1*b2-a2*b1)/(a1-a2);
        return [x, y];
    },

    solve2eq: function(a,b,c){
        let term1 = b/(2*a);
        let root2 = term1*term1 - c/a;
        if( root2 < 0 )
            return []; // No solutions
        if( root2 === 0 )
        {
            let xSol = -term1;
            return [xSol];
        }
        let root = Math.sqrt(root2);
        let x1 = -term1 + root;
        let x2 = -term1 - root;
        return [x1, x2];
    },

    offsetAlongLine: function( x0,y0,x1,y1, offset){
        const [xVec, yVec] = this.unitVector(x0,y0,x1,y1);
        const x = x0 + xVec*offset;
        const y = y0 + yVec*offset;
        return [x, y];
    },

    unitVector: function(x1,y1,x2,y2){
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx*dx+dy*dy);
        const x = dx / dist;
        const y = dy / dist;
        return [x,y];
    }
}