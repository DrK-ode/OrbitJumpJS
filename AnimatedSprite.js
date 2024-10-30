class AnimatedSprite {
    constructor(image, nCol, nRow, T) {
        this.image = image;
        this.nCol = nCol;
        this.nRow = nRow;
        this.currentCol = 0;
        this.currentRow = 0;
        this.width = image.width / nCol;
        this.height = image.height / nRow;
        this.period = T;
        this.timeSinceLastFrame = 0;
        this.xAnchorRatio = 0;
        this.yAnchorRatio = 0;
        this.baseAngle = 0;
    }

    drawSprite(drawer, x, y, width, height, angle) {
        drawer.ctx.save();
        drawer.ctx.resetTransform();
        drawer.ctx.translate(x, y);
        drawer.ctx.rotate( angle + this.baseAngle);
        drawer.ctx.drawImage(this.image,
            this.width * this.currentCol, this.height * this.currentRow,
            this.width, this.height,
            -this.xAnchorRatio * width, -this.yAnchorRatio * height,
            width, height);
        drawer.ctx.restore();
    }

    update(dt) {
        this.timeSinceLastFrame += dt;
        if (this.timeSinceLastFrame > this.period) {
            this.currentCol++
            if (this.currentCol >= this.nCol) {
                this.currentCol = 0;
            }
            this.timeSinceLastFrame = 0;
        }
    }
}