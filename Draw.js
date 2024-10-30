class Draw{
    constructor(canvas, viewPortInfo ){
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    circlePath(x,y,r) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, 2*Math.PI);
    }

    linePath(x1,y1,x2,y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2,y2);
    }

    fillCircle(x,y,r){
        this.circlePath(x,y,r);
        this.ctx.fill();
    }

    strokeCircle(x,y,r,lw){
        this.circlePath(x,y,r);
        this.ctx.lineWidth = lw;
        this.ctx.stroke();
    }

    strokeLine(x1,y1,x2,y2,lw){
        this.linePath(x1,y1,x2,y2);
        this.ctx.lineWidth = lw;
        this.ctx.stroke();
    }
}