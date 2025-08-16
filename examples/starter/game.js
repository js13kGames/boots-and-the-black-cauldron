/*
    LittleJS JS13K Starter Game
    - For size limited projects
    - Includes all core engine features
    - Builds to 7kb zip file
*/

'use strict';

let gameStarted, gameOver, level, timer, initialTime, clickTimer, exit, boots, witches, items, screenFadingFromBlack, screenAlpha, alph, fadeTime;

// sound effects
const new_game_sound = new Sound([1.1,,378,.03,.06,.18,1,2.2,,,105,.08,,,,.1,,.59,.02]); // Pickup 10
const player_hit_sound = new Sound([,,389,.03,.02,.04,1,2.5,-1,-1,,,,,129,,,.54,.02,,-1341]); // Blip 5
const exit_sound = new Sound([,,163,.07,.25,.22,,3.5,2,158,,,.06,,,,,.69,.18,.1,-948]); // Powerup 2
const game_over_sound = new Sound([2,,62,.03,.01,.46,3,0,,,,,,1.8,,.3,.47,.43,.16]); // Explosion 11
const tick_sound = new Sound([3,,12,.03,.04,.009,,1.7,-2,,4,.02,,,,,.49,.87,.01,.25]); // Blip 20
const buff_sound = new Sound([,,118,.05,.24,.3,,1.1,-10,,,,.1,,,,,.99,.12]); // Powerup 30
const debuff_sound = new Sound([,,188,.03,.05,.19,3,3.5,,,,,.05,1.4,,.1,,.97,.04,.36]); // Hit 33

// music section
let audio = document.createElement("audio");
audio.loop = true;
audio.volume = 1.0;
let msc_title_src;

// game variables
let particleEmitter;

// Initialize music generation (player).
var t0 = new Date();
var title_player = new CPlayer();
title_player.init(title_song);

// Generate music...
var title_done = false;
setInterval(function () {
    if (title_done) {
      return;
    }

    title_done = title_player.generate() >= 1;

    if (title_done) {
      var t1 = new Date();
      console.log("msc title generate done (" + (t1 - t0) + "ms)");

      // Put the generated song in an Audio element.
      var wave = title_player.createWave();
      msc_title_src = URL.createObjectURL(new Blob([wave], {type: "audio/wav"}));

      play_music("title");
    }
});

// webgl can be disabled to save even more space
//glEnable = false;
objectDefaultDamping = .7;

const levelSize = vec2(40, 22);

function play_sound(type) {
    snd.currentTime = 0.0;

    if(type == "wave_start") {
        snd.volume = 0.3;
        snd.src = snd_wave_start_src;

        snd.play();
    }
    
}

function play_music(type) {
    audio.pause();
    audio.currentTime = 0.0;

    if(type == "title") {
        console.log("title music");
        audio.volume = 0.3;
        audio.src = msc_title_src;
    }

    audio.play();
}

function toggle_music() {
    if(audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}

function stop_music(type) {
    audio.pause();
    audio.currentTime = 0.0;
}

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
        this.mode = 'puzzle';
        this.moving = false;
        this.minMotions = 50;
        this.maxMotions = 60;
        this.motionsThisLevel = 0;
        this.motions = 0;
        this.totalMotions = 0;
        this.levelTimerAdd = 0;
        this.levelMotionsAdd = 0;
        this.damage = 1;
        this.currentFrame = 0;
        this.frameOffset = 0;
        this.maxFrames = 0;
        this.drawSize = vec2(1,1);

        this.items = [];
    }

    update() {

        if(this.mode == 'puzzle') {
            // movement control (puzzle) grid based
            this.move = vec2(0,0);

            if(gamepadWasPressed(14)) {
                this.move = vec2(-1,0);
            }
            if(gamepadWasPressed(15)) {
                this.move = vec2(1,0);
            } 
            if(gamepadWasPressed(12)) {
                this.move = vec2(0,1);
            } 
            if(gamepadWasPressed(13)) {
                this.move = vec2(0,-1);
            }

            if(keyWasPressed('ArrowLeft')) {
                this.move = vec2(-1,0);
            }
            if(keyWasPressed('ArrowRight')) {
                this.move = vec2(1,0);
            } 
            if(keyWasPressed('ArrowUp')) {
                this.move = vec2(0,1);
            } 
            if(keyWasPressed('ArrowDown')) {
                this.move = vec2(0,-1);
            }

            if(this.move.length() > 0) {
                this.motions -= 1;
                this.moving = true;
            } else {
                this.moving = false;
            }

            this.pos = this.pos.add(this.move);
        }
        
        if(this.mode == 'action') {
            // movement control (puzzle)
            this.moveInput = isUsingGamepad ? gamepadStick(0) : keyDirection();
            this.velocity = this.velocity.add(this.moveInput.clampLength(1).scale(this.speed)); // clamp and scale input

            if(this.velocity.length() < 0.2 && this.state != 'idle') {
                this.state = 'idle';
                this.motions += 1;
            }

            if(this.velocity.length() > 0.2 && this.state != 'walking') {
                if(!timer.active()) {
                    timer.set(initialTime + this.levelTimerAdd);
                    clickTimer.set(1);
                    tick_sound.play();
                }
                this.state = 'walking';
                this.motions -= 1;
            }
        }

        if(keyWasPressed('KeyM')) {
            if(this.mode == 'action') {
                this.mode = 'puzzle';
            } else {
                this.mode = 'action';
            }
        }

        if(keyWasPressed('KeyF')) {
            screenFadingFromBlack = true;
        }

        for(var i=0;i<this.items.length;i++) {
            if(this.items[i].destroyTimer.elapsed()) {
                if(this.items[i].displayName == 'Rabbit Foot') {
                    this.speed = .1;
                }
                if(this.items[i].displayName == 'Clover') {
                    this.health = 1;
                }
                if(this.items[i].displayName == 'Salt') {
                    this.speed = .1;
                }
                if(this.items[i].displayName == 'Catnip') {
                    this.speed = .1;
                }
                this.items.splice(i, 1);
            }
        }

        //cameraPos = this.pos;
        super.update();
    }

    addItem(item) {
        item.destroyTimer.set(5);
        this.items.push(item);
        if(item.displayName == 'Rabbit Foot') {
            this.speed = .2;
        }

        if(item.displayName == 'Clover') {
            this.health = 200;
        }

        if(item.displayName == 'Salt') {
            this.speed = .05;
        }

        if(item.displayName == 'Catnip') {
            this.speed = .8;
        }
    }

    cleanUpItems() {
        for (let i=0;i<this.items.length;i++) {
            this.items[i].destroy();
        }
    }

    collideWithObject(o) {
        if(o instanceof Item) {
            this.addItem(o);

            if(o.type == ItemType.BUFF) {
                buff_sound.play();
            } else {
                debuff_sound.play();
            }
            o.destroy();
        }

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
        if(boots.mode == 'action') {
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
        } else {
            if(this.travelingHome) {
                if(this.pos.distance(this.home) < 1) {
                    this.travelingHome = false;
                } else {
                    if(boots.moving) {
                        this.pos = this.pos.add(this.home.subtract(this.pos).normalize());
                    }
                }
            } else {
                if(this.pos.distance(this.travelTarget) < 1) {
                    this.travelingHome = true;
                } else {
                    if(boots.moving) {
                        this.pos = this.pos.add(this.travelTarget.subtract(this.pos).normalize());
                    }
                }
            }
        }
        

        super.update();
    }
}

const ItemType = {
    BUFF: 0,
    DEBUFF: 1,
}

const ItemName = {
    CLOVER: 0,
    RABBIT_FOOT: 1,
    SALT: 2,
    CATNIP: 3,
}

class Item extends EngineObject {
    constructor(pos, type, itemName) {
        super(pos, vec2(1,1));
        if(itemName == ItemName.CLOVER || itemName == ItemName.RABBIT_FOOT) {
            this.color = GREEN;
        } else {
            this.color = RED;
        }

        this.type = type;
        this.itemName = itemName;
        this.displayName = '';

        if(itemName == ItemName.CLOVER) {
            this.displayName = "Clover";
        }
        if(itemName == ItemName.RABBIT_FOOT) {
            this.displayName = "Rabbit Foot";
        }
        if(itemName == ItemName.SALT) {
            this.displayName = "Salt";
        }
        if(itemName == ItemName.CATNIP) {
            this.displayName = "Catnip";
        }
        this.destroyTimer = new Timer(5);
        this.destroyTimer.unset();
        this.setCollision();
        this.mass = 0;
    }

    update() {
        if(this.destroyTimer.elapsed()) {
            destroy();
        }
    }
}

class Exit extends EngineObject {
    constructor(pos) {
        super(pos, vec2(2,2));
        this.color = BLUE;
        this.setCollision();
        this.mass = 0;
    }
}

function spawn_object() {
    items.push(new Item(vec2(randInt(levelSize.x),randInt(5, levelSize.y)), randInt(0,Object.keys(ItemType).length), randInt(0,Object.keys(ItemName).length)));
}

function newGame() {
    cleanUpWitches();
    cleanUpItems();
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
    boots.velocity = vec2(0,0);
    boots.state = 'idle';

    if(boots.mode == 'action') {
        boots.mode = 'puzzle';
    } else {
        boots.mode = 'action';
    }

    boots.pos = vec2(randInt(1, 6),randInt(1, 6));
    exit.pos = vec2(randInt(levelSize.x),randInt(5, levelSize.y));

    witches.push(new Witch(vec2(randInt(levelSize.x),randInt(5, levelSize.y))));
    cleanUpItems();
    spawn_object();
    
    if(boots.mode == 'action') {
        boots.levelTimerAdd = boots.motions;

        reset_timer();
        timer.unset();
        clickTimer.unset();
    } else {
        boots.levelMotionsAdd = Math.ceil(timer.get());

        boots.totalMotions += boots.motions;
        boots.motions = randInt(boots.minMotions, boots.maxMotions+1);

        boots.motionsThisLevel = boots.motions + boots.levelMotionsAdd;
    }
    
    screenFadingFromBlack = true;
    
}

function die() {
    boots.velocity = vec2(0,0);
    boots.items = [];
    boots.speed = .1
    boots.health = 1;
    boots.state = 'idle';
    boots.lives -= 1;

    if(boots.lives < 1) {
        game_over();
    }

    boots.pos = vec2(randInt(1, 6),randInt(1, 6));
    if(boots.mode == 'action') {
        reset_timer();
    } else {
        boots.motions = boots.motionsThisLevel;
    }
    
}

function game_over() {
    boots.destroy();
    exit.destroy();
    game_over_sound.play();
    gameOver = true;
    gameStarted = false;
}

function reset_timer() {
    timer = new Timer(initialTime + boots.levelTimerAdd);
    timer.unset();
    clickTimer = new Timer(1);
    clickTimer.unset();
}

function cleanUpWitches() {
    for (let i=0;i<witches.length;i++) {
        witches[i].destroy();
    }
}

function cleanUpItems() {
    for (let i=0;i<items.length;i++) {
        items[i].destroy();
    }
}

///////////////////////////////////////////////////////////////////////////////
function gameInit()
{
    canvasFixedSize = vec2(1280, 720);
    screenFadingFromBlack = false;
    screenAlpha = 1;
    alph = screenAlpha;
    fadeTime = 1;
    cameraPos = levelSize.scale(.5);

    initialTime = 5;
    clickTimer = new Timer(1);
    clickTimer.unset();

    gameStarted = false;
    gameOver = false;

    witches = [];
    items = [];
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
    if(mouseWasPressed(0) || keyWasPressed('Space') || gamepadWasPressed(0) || gamepadWasPressed(1)) {
        if(!gameStarted || gameOver) {
            newGame();
            stop_music();
        }
    }

    if(boots != null && boots.mode == 'action') {
        if(gameStarted && clickTimer.elapsed()) {
            tick_sound.play();
            clickTimer.set(1);
        }

        if(gameStarted && timer.elapsed()) {
            die();
        }
    } else {
        if(gameStarted && boots.motions < 1) {
            die();
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
        
        if(boots.mode == 'action') {
            if (timer.active()) {
                drawTextScreen('Timer: ' + formatTime(abs(timer.get())), vec2(80, 100), 30, BLACK);
            } else {
                drawTextScreen('Timer: ' + formatTime(initialTime + boots.levelTimerAdd), vec2(80, 100), 30, BLACK);
            }
        } else {
            drawTextScreen('Motions: ' + boots.motions, vec2(80, 100), 30, new Color(0,0,0));
        }
        
        var itemsHeld = '';
        for(var i=0;i<boots.items.length;i++) {
            itemsHeld += boots.items[i].displayName + ', ';
        }
        drawTextScreen('Items: ' + itemsHeld, vec2(80, 130), 30, BLACK);
        
        
        //drawTextScreen('Motions: ' + boots.motions, vec2(80, 100), 30, new Color(0,0,0));
        //drawTextScreen('Total Motions: ' + boots.totalMotions, vec2(110, 130), 30, new Color(0,0,0));
    }

    if(screenFadingFromBlack) {
        
        drawRect(cameraPos, levelSize, new Color(0,0,0,alph));
        alph -= 1/(60*fadeTime);

        if(alph <= 0) {
            screenFadingFromBlack = false;
            alph = screenAlpha;
        }
    }
    
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, ['tiles.png']);