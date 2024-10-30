function main() {
    let game = new Game(5000,5000);
    game.callback(0);
}

class Game {
    #canvasPosition;
    #lastUpdate = 0;
    #mouseState = {
        x: 0,
        y: 0,
        buttonDown: false
    };
    #keyboardState = {
        keyDown: false,
        keys: new Set(),
    }
    #animatedBackgrounds;
    #ship;
    #planets = [];

    constructor(w, h) {
        this.drawer = new Draw(mainCanvas);
        this.drawer.canvas.width = window.innerWidth;
        this.drawer.canvas.height = window.innerHeight;
        this.world = new World(5000,5000,0,0,this.drawer.canvas.width, this.drawer.canvas.height );
        this.#canvasPosition = this.drawer.canvas.getBoundingClientRect();

        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('mousemove', this.handleMouse.bind(this) );
        window.addEventListener('mousedown', this.handleMouse.bind(this) );
        window.addEventListener('mouseup', this.handleMouse.bind(this) );
        window.addEventListener('keydown', this.handleKeyboard.bind(this) );
        window.addEventListener('keyup', this.handleKeyboard.bind(this) );

        this.#animatedBackgrounds = [ new AnimatedBackground( spaceBackground1), new AnimatedBackground(spaceBackground2)];
        this.#ship = new Ship( this.world.width / 2, this.world.height / 2);
        
        this.#distributePlanetsRandomly();
    }

    handleKeyboard( event ){
        switch( event.type ){
            case 'keydown':
                this.#keyboardState.keyDown = true;
                this.#keyboardState.keys.add( event.key );
                break;
            case 'keyup':
                this.#keyboardState.keys.delete( event.key );
                if( this.#keyboardState.keys.size == 0 )
                    this.#keyboardState.keyDown = false;
                break;
            default:
                console.error('Unknown keybord event: ' + event.type );
        }
    }

    handleMouse(event){
        this.#mouseState.x = event.x - this.#canvasPosition.x;
        this.#mouseState.y = event.y - this.#canvasPosition.y;
        switch( event.type ){
            case 'mousedown':
                this.#mouseState.buttonDown = true;
                break;
            case 'mouseup':
                this.#mouseState.buttonDown = false;
                break;
            case 'mousemove':
                break;
            default:
                console.error('Unknown mouse event: ' + event.type );
        }
    }

    handleResize(event) {
        this.drawer.canvas.width = window.innerWidth;
        this.drawer.canvas.height = window.innerHeight;
        this.world.vpw = window.innerWidth;
        this.world.vph = window.innerHeight;
        this.#canvasPosition = this.drawer.canvas.getBoundingClientRect();
    }

    #distributePlanetsRandomly(){
        const planetDensity = 1e-6;
        const nPlanets = this.world.width * this.world.height * planetDensity;
        for( let i = 0; i < nPlanets; ++i )
        {
            let planet;
            let collision;
            do {
                let r = Math.random() * 50 + 25;
                let x = Math.random() * (this.world.width - 4*r) + 2*r;
                let y = Math.random() * (this.world.height - 4*r) + 2*r;
                planet = new Planet( x,y,r );
                collision = false;
                for( let p = 0; p < this.#planets.length; ++p ){
                    if( Solid.collision( this.#planets[p].solid, planet.solid ) ){
                        collision = true;
                        break;
                    }
                }
                if( Solid.collision( this.#ship.solid, planet.solid ) ){
                    collision = true;
                }
            } while( collision );
            this.#planets.push( planet );
        }
    }

    callback(timeStamp) {
        let dt = timeStamp - this.#lastUpdate;
        this.frameReset();
        this.update(dt);
        this.draw();
        requestAnimationFrame(this.callback.bind(this));
        this.#lastUpdate = timeStamp;
    }

    frameReset(){
        this.#ship.frameReset();
    }

    update(dt) {
        this.#updateInput();
        this.#updatePhysics(dt);
        this.#animatedBackgrounds.forEach( b => b.update(dt, this.world) );
        this.#ship.updateAim(this.#planets);
        this.world.updateViewport(this.#ship.solid.x, this.#ship.solid.y);
    }

    #updatePhysics(dt){
        // Gravitation
        this.#planets.forEach( p => {
            const dx = p.solid.x - this.#ship.solid.x;
            const dy = p.solid.y - this.#ship.solid.y;
            const dist = Math.sqrt( dx*dx + dy*dy );
            const a = p.solid.mass / (dist*dist);
            this.#ship.solid.ax += a * dx / dist;
            this.#ship.solid.ay += a * dy / dist;
        });
        // Update solids
        this.#ship.updatePhysics(dt, this.world);
        this.#planets.forEach( p => p.updatePhysics(dt, this.world) );
        // Keep in bounds
        const dampening = 0.5;
        if( this.#ship.solid.x - this.#ship.solid.r < 0 ){
            this.#ship.solid.bounceWall( 0, this.#ship.solid.y, -1, this.#ship.solid.y, dampening );
        }
        if( this.#ship.solid.x + this.#ship.solid.r >= this.world.width ){
            this.#ship.solid.bounceWall( this.world.width , this.#ship.solid.y, this.world.width + 1, this.#ship.solid.y, dampening );
        }
        if( this.#ship.solid.y - this.#ship.solid.r < 0 ){
            this.#ship.solid.bounceWall( this.#ship.solid.x, 0, this.#ship.solid.x, -1, dampening );
        }
        if( this.#ship.solid.y + this.#ship.solid.r >= this.world.height ){
            this.#ship.solid.bounceWall( this.#ship.solid.x, this.world.height, this.#ship.solid.x, this.world.height + 1, dampening );
        }
        // Collisions
        this.#planets.forEach( p => {
            if( Solid.collision( p.solid, this.#ship.solid) ){
                this.#ship.solid.bounceDisc( p.solid, dampening );
            }
        });
        
    }

    #updateInput(){
        if( this.#mouseState.buttonDown )
        {
            this.#ship.fireEngine();
        }
        if( this.#keyboardState.keys.has('w') ){
            this.#ship.course = 'prograde';
        }
        else if( this.#keyboardState.keys.has('s') ){
            this.#ship.course = 'retrograde';
        }
        else{
            this.#ship.course = 'aim';
        }
        this.#ship.aim( ...this.world.drawToWorldCoords( this.#mouseState.x, this.#mouseState.y) );
    }

    draw() {
        this.#drawBackground();
        this.#ship.draw(this.drawer, this.world);
        this.#planets.forEach( p => p.draw(this.drawer, this.world) );
        this.#drawInstructions();
    }

    #drawBackground(){
        this.drawer.ctx.fillStyle = '#040273';
        this.drawer.ctx.fillRect(0,0,this.drawer.canvas.width,this.drawer.canvas.height);
        this.#animatedBackgrounds.forEach( b => b.draw(this.drawer,this.world) );
        this.world.drawBorders(this.drawer);
    }

    #drawInstructions(){
        this.drawer.ctx.fillStyle = 'rgba(200,200,2000,0.80)';
    
        let offset = 120;
        const rowHeight = 16;
        const firstRow = this.drawer.canvas.height - 3*rowHeight;

        this.drawer.ctx.font = 'bold 16px sans';
        this.drawer.ctx.textAlign = 'right';
        this.drawer.ctx.fillText('Left mouse:', offset, firstRow );
        this.drawer.ctx.fillText('W:', offset, firstRow + rowHeight);
        this.drawer.ctx.fillText('S:', offset, firstRow + 2*rowHeight);

        offset += 10;
        this.drawer.ctx.font = '16px sans';
        this.drawer.ctx.textAlign = 'left';
        this.drawer.ctx.fillText('accelerate', offset, firstRow );
        this.drawer.ctx.fillText('turn prograde', offset, firstRow + rowHeight);
        this.drawer.ctx.fillText('turn retrograde', offset, firstRow + 2*rowHeight);
    }
}
