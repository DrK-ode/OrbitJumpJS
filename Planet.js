class Planet {
    static planetSprites = [planet0Sprite, planet1Sprite, planet2Sprite, planet3Sprite, planet4Sprite];
    constructor(x, y, r) {
        this.sprite = new AnimatedSprite(Planet.planetSprites[ Math.floor( Math.random() * 5)], 6, 1, 500);
        this.sprite.currentCol = Math.floor( Math.random() *5 );
        this.spriteWidth = 2*r;
        this.spriteHeight = this.sprite.height / this.sprite.width * this.spriteWidth;
        this.sprite.xAnchorRatio = 0.5;
        this.sprite.yAnchorRatio = 0.5;
        this.solid = new SolidDisc(x, y, r);
        const planetDensity = 1e-4;
        this.solid.mass = planetDensity * r*r; // Makes more game sense
        this.solid.angularVelocity = Math.random() * 0.0005 - 0.00025;
    }

    updatePhysics(dt, world) {
        this.solid.update(dt);
    }

    draw(drawer, world) {
        let [xDraw, yDraw] = world.worldToDrawCoords( this.solid.x, this.solid.y);
        this.sprite.drawSprite(drawer, xDraw, yDraw, this.spriteWidth, this.spriteHeight, this.solid.angle);
    }
}