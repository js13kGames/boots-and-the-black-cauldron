/*
    LittleJS JS13K Starter Game
    - For size limited projects
    - Includes all core engine features
    - Builds to 7kb zip file
*/

'use strict';

let gameStarted, gameOver, level, exit, boots, witches;

// sound effects
const sound_click = new Sound([1,.5]);

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
        this.color = new Color(0,0,0);
        this.setCollision();
        this.mass = 1;
        this.lives = 2;
        this.speed = 1;
        this.state = 'idle';
        this.damage = 1;
        this.currentFrame = 0;
        this.frameOffset = 0;
        this.maxFrames = 0;
        this.drawSize = vec2(1,1);
    }

    update() {
        // movement control
        this.moveInput = isUsingGamepad ? gamepadStick(0) : keyDirection();

        //this.pos.x += this.moveInput.x * this.speed;
        //this.pos.y += this.moveInput.y * this.speed;
        // apply movement acceleration and clamp
        const maxCharacterSpeed = .1;
        //this.velocity.x = clamp(this.velocity.x + this.moveInput.x * .04, -maxCharacterSpeed, maxCharacterSpeed);
        //this.velocity.y = clamp(this.velocity.y + this.moveInput.y * .04, -maxCharacterSpeed, maxCharacterSpeed);
        this.velocity = this.velocity.add(this.moveInput.clampLength(1).scale(maxCharacterSpeed)); // clamp and scale input

        //cameraPos = this.pos;
        super.update();
    }

    collideWithObject(o) {
        if(o instanceof Witch) {
            console.log("Witch found! You lost a life!");
            die();
        }

        if(o instanceof Exit) {
            console.log("Exit found! Go to next level!");
            goToNextLevel();
        }
    }

    takeDamage(dmg) {
        this.health -= dmg;

        if(this.health < 1) {
            //snd_ark_destroy.play()
            boots = 0;
            this.destroy();
        } else {
            //snd_ark_hit.play();
        }
    }
}

class Witch extends EngineObject {
    constructor(pos) {
        super(pos, vec2(1,1));
        this.color = new Color(.2,.2,.2);
        this.setCollision();
        this.mass = 1;
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
        this.color = new Color(.3,.3,.3);
        this.setCollision();
        this.mass = 0;
    }

    update() {
        super.update();
    }
}

function newGame() {
    cleanUpWitches();
    gameStarted = true;
    gameOver = false;
    level = 0;

    boots = new Boots();
    exit = new Exit();

    goToNextLevel();
}

function goToNextLevel() {
    level += 1;

    boots.pos = vec2(randInt(levelSize.x),randInt(levelSize.y));
    exit.pos = vec2(randInt(levelSize.x),randInt(levelSize.y));
    console.log("Exit made");

    witches.push(new Witch(vec2(randInt(levelSize.x),randInt(levelSize.y))));
}

function die() {
    boots.lives -= 1;

    if(boots.lives < 1) {
        game_over();
    }

    boots.pos = vec2(randInt(levelSize.x),randInt(levelSize.y));
}

function game_over() {
    boots.destroy();
    exit.destroy();
    gameOver = true;
    gameStarted = false;
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

    gameStarted = false;
    gameOver = false;

    witches = [];
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
    if(mouseWasPressed(0)) {
        if(!gameStarted || gameOver) {
            newGame();
        }
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
        drawRect(cameraPos, levelSize, new Color(1,1,1));
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
            drawTextScreen('Game Over', vec2(mainCanvasSize.x/2, mainCanvasSize.y/2), 160, new Color(1,0,0));
            drawTextScreen('Level ' + level + ' reached', vec2(mainCanvasSize.x/2, mainCanvasSize.y/2+100), 60, new Color(1,0,0));
        }
        
    } else {
        drawTextScreen('Level: ' + level, vec2(80, 40), 30, new Color(0,0,0));
        drawTextScreen('Lives: ' + boots.lives, vec2(80, 140), 30, new Color(0,0,0));
    }
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, ['tiles.png']);