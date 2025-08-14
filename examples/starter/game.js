/*
    LittleJS JS13K Starter Game
    - For size limited projects
    - Includes all core engine features
    - Builds to 7kb zip file
*/

'use strict';

let gameStarted, level, exit, boots;

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
        this.health = 10;
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
    gameStarted = true;
    level = 0;

    goToNextLevel();
}

function goToNextLevel() {
    level += 1;

    if(boots) {
        boots.destroy();
    }

    boots = new Boots(vec2(levelSize.x/2,levelSize.y/2));
    console.log("Boots made");

    if(exit) {
        exit.destroy();
    }

    exit = new Exit(vec2(randInt(levelSize.x),randInt(levelSize.y)));
    console.log("Exit made");
}

///////////////////////////////////////////////////////////////////////////////
function gameInit()
{
    canvasFixedSize = vec2(1280, 720);

    cameraPos = levelSize.scale(.5);

    gameStarted = false;
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
    if(mouseWasPressed(0)) {
        if(!gameStarted) {
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
        drawTextScreen('Boots the Cat', vec2(mainCanvasSize.x/2, 0 + 70), 80);
        drawTextScreen('in', vec2(mainCanvasSize.x/2, mainCanvasSize.y/2), 80);
        drawTextScreen('Broken Whiskerz', vec2(mainCanvasSize.x/2, mainCanvasSize.y - 70), 80);
    } else {
        drawTextScreen('Level: ' + level, vec2(80, 40), 30, new Color(0,0,0));
    }
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, ['tiles.png']);