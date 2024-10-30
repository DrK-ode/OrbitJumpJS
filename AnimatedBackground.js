class AnimatedBackground {
    constructor(image) {
        this.image = image;
        this.x = 0;
        this.y = 0;
        const v = Math.random() * 0.0025 + 0.001;
        const a = Math.random()*2*Math.PI;
        this.vx = v * Math.cos(a);
        this.vy = v * Math.sin(a);
    }

    update(dt) {
        this.x += this.vx * dt;
        while( this.x < 0)
            this.x += this.image.width;
        while( this.x > this.image.width)
            this.x -= this.image.width;
        this.y += this.vy * dt;
        while( this.y < 0 )
            this.y += this.image.height
        while( this.y > this.image.height)
            this.y -= this.image.height;
    }

    draw(drawer, world) {
        let [xStart,yStart] = world.worldToDrawCoords( this.x , this.y );
        while( xStart < 0 )
            xStart += this.image.width;
        while( xStart > drawer.canvas.width )
            xStart -= this.image.width;
        xStart -= this.image.width;
        while( yStart < 0 )
            yStart += this.image.height;
        while( yStart > drawer.canvas.height )
            yStart -= this.image.height;
        yStart -= this.image.height;

        for( let x = xStart; x < world.vpx + world.vpw; x += this.image.width ){
            for( let y = yStart; y < world.vpy + world.vph; y += this.image.height ){
                drawer.ctx.drawImage(this.image, x, y, this.image.width, this.image.height);
            }
        }
    }
}