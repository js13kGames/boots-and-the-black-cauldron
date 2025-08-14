/*
    LittleJS JS13K Starter Game
    - For size limited projects
    - Includes all core engine features
    - Builds to 7kb zip file
*/

'use strict';

let gameStarted, gameOver, level, timer, initialTime, clickTimer, exit, boots, witches;

// sound effects
const new_game_sound = new Sound([1.1,,378,.03,.06,.18,1,2.2,,,105,.08,,,,.1,,.59,.02]); // Pickup 10
const player_hit_sound = new Sound([,,389,.03,.02,.04,1,2.5,-1,-1,,,,,129,,,.54,.02,,-1341]); // Blip 5
const exit_sound = new Sound([,,163,.07,.25,.22,,3.5,2,158,,,.06,,,,,.69,.18,.1,-948]); // Powerup 2
const game_over_sound = new Sound([2,,62,.03,.01,.46,3,0,,,,,,1.8,,.3,.47,.43,.16]); // Explosion 11
const tick_sound = new Sound([3,,12,.03,.04,.009,,1.7,-2,,4,.02,,,,,.49,.87,.01,.25]); // Blip 20

// game variables
let particleEmitter;

var title_player = new CPlayer();

// webgl can be disabled to save even more space
//glEnable = false;
objectDefaultDamping = .7;

const levelSize = vec2(40, 22);

class Boots extends EngineObject {
    constructor(pos) {
        super(pos, vec2(1,1));
        this.color = BLACK;
        this.setCollision();
        this.mass = 1;
        this.health = 1;
        this.lives = 9;
        this.speed = .1;
        this.state = 'idle';
        this.motions = 0;
        this.totalMotions = 0;
        this.damage = 1;
        this.currentFrame = 0;
        this.frameOffset = 0;
        this.maxFrames = 0;
        this.drawSize = vec2(1,1);
    }

    update() {
        // movement control
        this.moveInput = isUsingGamepad ? gamepadStick(0) : keyDirection();
        this.velocity = this.velocity.add(this.moveInput.clampLength(1).scale(this.speed)); // clamp and scale input

        if(this.velocity.length() < 0.2 && this.state != 'idle') {
            this.state = 'idle';
            this.motions += 1;
        }

        if(this.velocity.length() > 0.2 && this.state != 'walking') {
            if(!timer.active()) {
                timer.set(initialTime);
                clickTimer.set(1);
                tick_sound.play();
            }
            this.state = 'walking';
            this.motions += 1;
        }

        //cameraPos = this.pos;
        super.update();
    }

    collideWithObject(o) {
        if(o instanceof Witch) {
            this.takeDamage(o.damage);
        }

        if(o instanceof Exit) {
            exit_sound.play(null, 1, 1, 1.8);
            goToNextLevel();
        }
    }

    takeDamage(dmg) {
        this.health -= dmg;
        player_hit_sound.play();

        if(this.health < 1) {
            die();
        } 
    }
}

class Witch extends EngineObject {
    constructor(pos) {
        super(pos, vec2(1,1));
        this.color = PURPLE;
        this.setCollision();
        this.mass = 1;
        this.damage = 1;
        this.travelDistance = 20;
        this.travelTarget = this.pos.add(vec2(randInt(-this.travelDistance, this.travelDistance), randInt(-this.travelDistance, this.travelDistance)));
        this.home = vec2(this.pos.x, this.pos.y);
        this.travelingHome = false;
    }

    update() {
        if(this.travelingHome) {
            if(this.pos.distance(this.home) < 1) {
                this.travelingHome = false;
            } else {
                this.velocity = this.velocity.add(this.home.subtract(this.pos).normalize().scale(.1));
            }
        } else {
            if(this.pos.distance(this.travelTarget) < 1) {
                this.travelingHome = true;
            } else {
                this.velocity = this.velocity.add(this.travelTarget.subtract(this.pos).normalize().scale(.1));
            }
        }

        super.update();
    }
}

class Exit extends EngineObject {
    constructor(pos) {
        super(pos, vec2(2,2));
        this.color = BLUE;
        this.setCollision();
        this.mass = 0;
    }

    update() {
        super.update();
    }
}

function newGame() {
    cleanUpWitches();
    new_game_sound.play();
    gameStarted = true;
    gameOver = false;
    level = 0;

    boots = new Boots();
    exit = new Exit();

    goToNextLevel();
}

function goToNextLevel() {
    level += 1;
    boots.totalMotions += boots.motions;
    boots.motions = 0;
    boots.velocity = vec2(0,0);
    boots.state = 'idle';

    boots.pos = vec2(randInt(levelSize.x),randInt(levelSize.y));
    exit.pos = vec2(randInt(levelSize.x),randInt(levelSize.y));

    witches.push(new Witch(vec2(randInt(levelSize.x),randInt(levelSize.y))));
    
    reset_timer();
    timer.unset();
    clickTimer.unset();
    
}

function die() {
    boots.velocity = vec2(0,0);
    boots.state = 'idle';
    boots.lives -= 1;

    if(boots.lives < 1) {
        game_over();
    }

    boots.pos = vec2(randInt(levelSize.x),randInt(levelSize.y));
    reset_timer();
}

function game_over() {
    boots.destroy();
    exit.destroy();
    game_over_sound.play();
    gameOver = true;
    gameStarted = false;
}

function reset_timer() {
    timer = new Timer(initialTime);
    timer.unset();
    clickTimer = new Timer(1);
    clickTimer.unset();
}

function cleanUpWitches() {
    for (let i=0;i<witches.length;i++) {
        witches[i].destroy();
    }
}

///////////////////////////////////////////////////////////////////////////////
function gameInit()
{
    canvasFixedSize = vec2(1280, 720);

    cameraPos = levelSize.scale(.5);

    initialTime = 5;
    clickTimer = new Timer(1);
    clickTimer.unset();

    gameStarted = false;
    gameOver = false;

    witches = [];
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
    if(mouseWasPressed(0) || keyWasPressed('Space') || gamepadWasPressed(0) || gamepadWasPressed(1)) {
        if(!gameStarted || gameOver) {
            newGame();
        }
    }

    if(gameStarted && clickTimer.elapsed()) {
        tick_sound.play();
        clickTimer.set(1);
    }

    if(gameStarted && timer.elapsed()) {
        die();
    }
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost()
{

}

///////////////////////////////////////////////////////////////////////////////
function gameRender()
{
    // draw white background during play
    if(gameStarted) {
        drawRect(cameraPos, levelSize, WHITE);
    }
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost()
{
    // draw to overlay canvas for hud rendering
    if (!gameStarted) {
        if(!gameOver) {
            drawTextScreen('Boots the Cat', vec2(mainCanvasSize.x/2, 0 + 70), 80);
            drawTextScreen('in', vec2(mainCanvasSize.x/2, mainCanvasSize.y/2), 80);
            drawTextScreen('Broken Whiskerz', vec2(mainCanvasSize.x/2, mainCanvasSize.y - 70), 80);
        } else {
            drawTextScreen('Game Over', vec2(mainCanvasSize.x/2, mainCanvasSize.y/2), 160, RED);
            drawTextScreen('Level ' + level + ' Reached', vec2(mainCanvasSize.x/2, mainCanvasSize.y/2+100), 60, RED);
            //drawTextScreen('Total Motions: ' + boots.totalMotions, vec2(mainCanvasSize.x/2, mainCanvasSize.y/2+200), 60, new Color(1,0,0));
        }
        
    } else {
        drawTextScreen('Level: ' + level, vec2(80, 40), 30, BLACK);
        drawTextScreen('Lives: ' + boots.lives, vec2(80, 70), 30, BLACK);
        if (timer.active()) {
            drawTextScreen('Timer: ' + formatTime(abs(timer.get())), vec2(80, 100), 30, BLACK);
        } else {
            drawTextScreen('Timer: ' + formatTime(initialTime), vec2(80, 100), 30, BLACK);
        }
        
        //drawTextScreen('Motions: ' + boots.motions, vec2(80, 100), 30, new Color(0,0,0));
        //drawTextScreen('Total Motions: ' + boots.totalMotions, vec2(110, 130), 30, new Color(0,0,0));
    }
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, ['tiles.png']);