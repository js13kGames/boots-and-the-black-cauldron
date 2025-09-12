/*
    LittleJS JS13K Starter Game
    - For size limited projects
    - Includes all core engine features
    - Builds to 7kb zip file
*/

'use strict';

let gameStarted, spriteAtlas, gameOver, level, levelSize, timer, initialTime, clickTimer, exit, boots, screenFadingFromBlack, screenAlpha, alph, fadeTime;
let cauldron, witches, items, ingredients, score, portals, trees, walls;

// sound effects
const new_game_sound = new Sound([1.1,,378,.03,.06,.18,1,2.2,,,105,.08,,,,.1,,.59,.02]); // Pickup 10
const player_hit_sound = new Sound([,,389,.03,.02,.04,1,2.5,-1,-1,,,,,129,,,.54,.02,,-1341]); // Blip 5
const exit_sound = new Sound([,,163,.07,.25,.22,,3.5,2,158,,,.06,,,,,.69,.18,.1,-948]); // Powerup 2
const game_over_sound = new Sound([2,,62,.03,.01,.46,3,0,,,,,,1.8,,.3,.47,.43,.16]); // Explosion 11
const tick_sound = new Sound([3,,12,.03,.04,.009,,1.7,-2,,4,.02,,,,,.49,.87,.01,.25]); // Blip 20
const buff_sound = new Sound([,,118,.05,.24,.3,,1.1,-10,,,,.1,,,,,.99,.12]); // Powerup 30
const debuff_sound = new Sound([,,188,.03,.05,.19,3,3.5,,,,,.05,1.4,,.1,,.97,.04,.36]); // Hit 33
const key_pickup_sound = new Sound([1.8,,438,.09,.29,.38,,2,,,462,.09,.04,,,.1,.06,.56,.18,.15,152]); // Powerup 58
const cauldron_ingredient_sound = new Sound([2.3,,155,.01,.15,.2,,.2,,-8,-146,.07,,,.1,,.19,.51,.27,,760]); // Powerup 61
cauldron_ingredient_sound.randomness = .3;
const drop_ingredient_sound = new Sound([1.7,,433,.02,.04,.02,4,3.7,,,,,,1.5,,.2,.04,.65,.09,,206]); // Hit 64
drop_ingredient_sound.randomness = .3;

// music section
let audio = document.createElement("audio");
audio.loop = true;
audio.volume = 1.0;
let msc_title_src, msc_action_src, msc_puzzle_src, msc_gameover_src, snd_mirror_src;

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

var action_player = new CPlayer();
action_player.init(action_song);

// Generate music...
var action_done = false;
setInterval(function () {
    if (action_done) {
      return;
    }

    action_done = action_player.generate() >= 1;

    if (action_done) {
      var t1 = new Date();
      console.log("msc action generate done (" + (t1 - t0) + "ms)");

      // Put the generated song in an Audio element.
      var wave = action_player.createWave();
      msc_action_src = URL.createObjectURL(new Blob([wave], {type: "audio/wav"}));
    }
});

var puzzle_player = new CPlayer();
puzzle_player.init(puzzle_song);

// Generate music...
var puzzle_done = false;
setInterval(function () {
    if (puzzle_done) {
      return;
    }

    puzzle_done = puzzle_player.generate() >= 1;

    if (puzzle_done) {
      var t1 = new Date();
      console.log("msc puzzle generate done (" + (t1 - t0) + "ms)");

      // Put the generated song in an Audio element.
      var wave = puzzle_player.createWave();
      msc_puzzle_src = URL.createObjectURL(new Blob([wave], {type: "audio/wav"}));
    }
});

var gameover_player = new CPlayer();
gameover_player.init(gameover_song);

var gameover_done = false;
setInterval(function () {
    if (gameover_done) {
      return;
    }

    gameover_done = gameover_player.generate() >= 1;

    if (gameover_done) {
      var t1 = new Date();
      console.log("msc gameover generate done (" + (t1 - t0) + "ms)");

      // Put the generated song in an Audio element.
      var wave = gameover_player.createWave();
      msc_gameover_src = URL.createObjectURL(new Blob([wave], {type: "audio/wav"}));
    }
});

let snd = document.createElement("audio");
snd.loop = false;
snd.volume = 1.0;

var mirror_player = new CPlayer();
mirror_player.init(mirror_song);

var mirror_done = false;
setInterval(function () {
    if (mirror_done) {
      return;
    }

    mirror_done = mirror_player.generate() >= 1;

    if (mirror_done) {
      var t1 = new Date();
      console.log("snd mirror generate done (" + (t1 - t0) + "ms)");

      // Put the generated song in an Audio element.
      var wave = mirror_player.createWave();
      snd_mirror_src = URL.createObjectURL(new Blob([wave], {type: "audio/wav"}));
    }
});

// webgl can be disabled to save even more space
//glEnable = false;
objectDefaultDamping = .7;

const actionLevelSize = vec2(80, 44);
const puzzleLevelSize = vec2(40, 22);
levelSize = actionLevelSize;

function play_sound(type) {
    snd.currentTime = 0.0;

    if(type == "mirror") {
        snd.volume = 0.3;
        snd.src = snd_mirror_src;

        snd.play();
    }
}

function play_music(type) {
    console.log("Switching track to " + type);
    audio.pause();
    audio.currentTime = 0.0;

    if(type == "title") {
        audio.volume = 0.3;
        audio.src = msc_title_src;
    }
    if(type == "action") {
        audio.volume = 0.3;
        audio.src = msc_action_src;
    }
    if(type == "puzzle") {
        audio.volume = 0.3;
        audio.src = msc_puzzle_src;
    }
    if(type == "gameover") {
        audio.volume = 0.3;
        audio.src = msc_gameover_src;
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
        this.ingredients = [];

        this.maxItems = 0;
        this.maxIngredients = 0;
    }

    update() {

        if(this.mode == 'puzzle') {
            // move camera with player
            cameraPos = this.pos;

            // movement control (puzzle) grid based
            this.move = vec2(0,0);

            if(keyWasPressed('ArrowLeft') || gamepadWasPressed(14)) {
                if(this.pos.x > this.size.x) {
                    this.move = vec2(-1,0);
                }
            }
            if(keyWasPressed('ArrowRight') || gamepadWasPressed(15)) {
                if(this.pos.x < levelSize.x - (this.size.x + 1)) {
                    this.move = vec2(1,0);
                }
            } 
            if(keyWasPressed('ArrowUp') || gamepadWasPressed(12)) {
                if(this.pos.y < levelSize.y - (this.size.y + 1)) {
                    this.move = vec2(0,1);
                }
            } 
            if(keyWasPressed('ArrowDown') || gamepadWasPressed(13)) {
                console.log(this.pos);
                if(this.pos.y > this.size.y + 1) {
                    this.move = vec2(0,-1);
                }
            }

            if(this.move.length() > 0) {
                this.motions -= 1;
                this.moving = true;
            } else {
                this.moving = false;
            }

            this.pos = this.pos.add(this.move);


            for(var i=0;i<portals.length;i++) {
                if(this.pos.x == portals[i].pos.x && this.pos.y == portals[i].pos.y) {
                    if(portals[i].teleportTo != null) {
                        boots.pos = vec2(portals[i].teleportTo.pos);
                        play_sound("mirror");
                    }
                }
            }
        }
        
        if(this.mode == 'action') {
            // move camera with player
            cameraPos = this.pos;

            // movement control (puzzle)
            this.moveInput = isUsingGamepad ? gamepadStick(0) : keyDirection();
            this.velocity = this.velocity.add(this.moveInput.clampLength(1).scale(this.speed)); // clamp and scale input

            if(this.velocity.length() < 0.2 && this.state != 'idle') {
                this.state = 'idle';
            }

            if(this.velocity.length() > 0.2 && this.state != 'walking') {
                if(!timer.active()) {
                    timer.set(initialTime + this.levelTimerAdd);
                    clickTimer.set(1);
                    tick_sound.play();
                }
                this.state = 'walking';
            }
        }

        // player actions
        if(keyWasPressed('Space') || gamepadWasPressed(0)) {
            // use ingredients
            this.useLastIngredient();
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

        super.update();
    }

    addItem(item) {
        if(this.items.length == this.maxItems) {
            return;
        }

        if(item.displayName != 'Key') {
            item.destroyTimer.set(5);
        }
        
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

    hasItem(itemName) {
        for (let i=0;i<this.items.length;i++) {
            if(this.items[i].itemName == itemName) {
                return true;
            }
        }

        return false;
    }

    destroyItem(itemName) {
        for (let i=0;i<this.items.length;i++) {
            if(this.items[i].itemName == itemName) {
                this.items[i].destroy();
                this.items.splice(i, 1);
                break;
            }
        }
    }

    cleanUpItems() {
        for (let i=0;i<this.items.length;i++) {
            if(this.items[i].itemName != ItemName.KEY) {
                this.items[i].destroy();
                this.items.splice(i, 1);
            }
        }
    }

    addIngredient(ingredient) {
        if(this.ingredients.length == this.maxIngredients) {
            return;
        }

        this.ingredients.push(ingredient);
    }

    hasIngredient(ingredientName) {
        for (let i=0;i<this.ingredients.length;i++) {
            if(this.ingredients[i].displayName = ingredientName) {
                return true;
            }
        }

        return false;
    }

    useLastIngredient() {
        console.log();

        var l = this.ingredients.length;

        if(l > 0) {
            if(cauldron && isOverlapping(this.pos, this.size, cauldron.pos, cauldron.size)) {
                // we have thrown it into the cauldron :)
                cauldron_ingredient_sound.play();
                score += this.ingredients[l-1].points;
            } else {
                drop_ingredient_sound.play();
            }
            
            this.ingredients[l-1].destroy();
            this.ingredients.splice(l-1, 1);
        }
    }

    destroyIngredient(ingredientName) {
        for (let i=0;i<this.ingredients.length;i++) {
            if(this.ingredients[i].ingredients == ingredientName) {
                this.ingredients[i].destroy();
                this.ingredients.splice(i, 1);
                break;
            }
        }
    }

    cleanUpIngredients() {
        for (let i=0;i<this.ingredients.length;i++) {
            this.ingredients[i].destroy();
        }

        this.ingredients = [];
    }

    collideWithObject(o) {
        if(o instanceof Item) {
            this.addItem(o);
            console.log(o);

            if(o.itemName == ItemName.KEY){
                key_pickup_sound.play();
            } else {
                if(o.type == ItemType.BUFF) {
                    buff_sound.play();
                } else {
                    debuff_sound.play();
                }
            }
            
            o.destroy();
        }

        if(o instanceof Ingredient) {
            this.addIngredient(o);
            console.log(o);

            buff_sound.play();
            o.destroy();
        }

        if(o instanceof Witch) {
            this.takeDamage(o.damage);
        }

        if(o instanceof MirrorPortal) {
            console.log(o.teleportTo);
            if(o.teleportTo != null) {
                this.pos = vec2(o.teleportTo.pos);
                play_sound("mirror");
            }

            return false;
        }

        if(o instanceof Exit) {
            if(this.hasItem(ItemName.KEY)) {
                if(this.mode == "action") {
                    this.destroyItem(ItemName.KEY);
                }
                exit_sound.play(null, 1, 1, 1.8);
                goToNextLevel();
            }
        }

        return true;
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
        super(pos, vec2(1,2));
        this.color = PURPLE;
        this.setCollision();
        this.mass = 1;
        this.damage = 1;
        this.travelDistance = 20;
        this.travelTarget = this.pos.add(vec2(randInt(-this.travelDistance, this.travelDistance), randInt(-this.travelDistance, this.travelDistance)));
        this.home = vec2(this.pos.x, this.pos.y);
        this.travelingHome = false;
        this.visible = true;
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

    render() {
        if(this.visible) {
            super.render();
        }
    }
}

const ItemType = {
    BUFF: 0,
    DEBUFF: 1,
    INGREDIENT: 2,
}

const ItemName = {
    KEY: 0,
    RABBIT_FOOT: 1,
    SALT: 2,
    CATNIP: 3,
    CLOVER: 4,
}

const IngredientName = {
    MUSHROOM: 0,
    SASSAFRAS: 1,
    WILLOW: 2,
}

class Item extends EngineObject {
    constructor(pos, type, itemName) {
        super(pos, vec2(1,1));
        if(itemName == ItemName.CLOVER || itemName == ItemName.RABBIT_FOOT) {
            this.color = GREEN;
        } else if(itemName == ItemName.KEY) {
            this.color = YELLOW;
        } else {
            this.color = RED;
        }

        this.type = type;
        this.itemName = itemName;
        this.displayName = '';

        if(itemName == ItemName.KEY) {
            this.displayName = "Key";
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
        if(itemName == ItemName.CLOVER) {
            this.displayName = "Clover";
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

class Ingredient extends EngineObject {
    constructor(pos, ingredientName) {
        super(pos, vec2(1,1));
        this.color = MAGENTA;

        if(ingredientName == IngredientName.MUSHROOM) {
            this.displayName = "Mushroom";
            this.points = 10;
        }
        if(ingredientName == IngredientName.SASSAFRAS) {
            this.displayName = "Sassafras";
            this.points = 10;
        }
        if(ingredientName == IngredientName.WILLOW) {
            this.displayName = "Willow";
            this.points = 10;
        }
        
        this.setCollision();
        this.mass = 0;
    }
}

class Tree extends EngineObject {
    constructor(pos) {
        var s = randInt(4)
        super(pos, vec2(s,s));
        this.color = new Color(0,0.5,0);
        this.setCollision();
        this.mass = 0;
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

class MirrorPortal extends EngineObject {
    constructor(pos) {
        super(pos, vec2(1,1));
        this.color = CYAN;
        this.setCollision();
        this.mass = 0;
        this.teleportTo = null;
        this.health = 1;
    }

    linkPortalTo(m) {
        this.teleportTo = m;
    }
}

class Cauldron extends EngineObject
{
    constructor(pos) {
        super(pos, vec2(3,3));
        this.color = PURPLE;
        this.setCollision();
        this.mass = 0;
    }
}

class Wall extends EngineObject
{
    constructor(pos, size)
    {
        super(pos, size); // set object position and size

        this.setCollision(); // make object collide
        this.mass = 0; // make object have static physics
        this.color = BLACK;
    }
}

function spawn_object(name=null) {
    if(name == null) {
        items.push(new Item(vec2(randInt(levelSize.x),randInt(5, levelSize.y)), randInt(0,Object.keys(ItemType).length), randInt(1,Object.keys(ItemName).length-1)));
    } else {
        items.push(new Item(vec2(randInt(levelSize.x),randInt(5, levelSize.y)), randInt(0,Object.keys(ItemType).length), name));
    }
    
}

function newGame() {
    cleanUpWitches();
    cleanUpItems();
    cleanUpIngredients();
    cleanUpTrees();
    cleanUpWalls();
    new_game_sound.play();
    gameStarted = true;
    gameOver = false;
    score = 0;
    level = 0;

    boots = new Boots();
    var i = new Item(vec2(0,0), ItemType.BUFF, ItemName.KEY);
    boots.items.push(i);
    i.destroy();
    exit = new Exit();

    goToNextLevel();
}

function goToNextLevel() {
    level += 1;
    boots.maxItems += 1;
    boots.maxIngredients += 1;

    // reset camera pos to center
    cameraPos = vec2(20,11);

    boots.velocity = vec2(0,0);
    boots.state = 'idle';

    cleanUpPortals();
    cleanUpTrees();
    cleanUpWalls();

    if(boots.mode == 'action') {
        boots.mode = 'puzzle';
        levelSize = puzzleLevelSize;
    } else {
        boots.mode = 'action';
        levelSize = actionLevelSize;
        boots.cleanUpIngredients();
    }

    boots.pos = vec2(randInt(1, 6),randInt(1, 6));
    exit.pos = vec2(randInt(levelSize.x),randInt(5, levelSize.y));
    
    portals.push(new MirrorPortal(vec2(randInt(levelSize.x),randInt(5, levelSize.y))));
    portals.push(new MirrorPortal(vec2(randInt(levelSize.x),randInt(5, levelSize.y))));
    if(portals[1].pos.distance(exit.pos) > portals[0].pos.distance(exit.pos)) {
        portals[1].linkPortalTo(portals[0]);
    } else {
        portals[0].linkPortalTo(portals[1]);
    }
    
    cleanUpItems();
    spawnWalls();
    
    if(boots.mode == 'action') {
        toggleWitches("action");
        spawnTrees(50);
        spawnIngredients(20);
        spawn_object();
        spawn_object();
        witches.push(new Witch(vec2(randInt(levelSize.x),randInt(5, levelSize.y))));
        cauldron.destroy();

        boots.levelTimerAdd = boots.motions;

        reset_timer();
        timer.unset();
        clickTimer.unset();

        play_music("action");
    } else {
        boots.levelMotionsAdd = Math.ceil(timer.get());

        boots.totalMotions += boots.motions;
        boots.motions = randInt(boots.minMotions, boots.maxMotions+1);

        boots.motionsThisLevel = boots.motions + boots.levelMotionsAdd;

        cauldron = new Cauldron(vec2(levelSize.x/2, levelSize.y/2));
        spawn_object(ItemName.KEY);

        toggleWitches("puzzle");
        cleanUpIngredients();

        play_music("puzzle");
    }
    
    screenFadingFromBlack = true;
    
}

function die() {
    boots.velocity = vec2(0,0);
    boots.cleanUpItems();
    boots.cleanUpIngredients();
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
    play_music("gameover");
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

    witches = [];
}

function toggleWitches(mode) {
    if(mode == "action") {
        for (let i=0;i<witches.length;i++) {
            witches[i].visible = true;
            witches[i].setCollision();
        }
    }

    if(mode == "puzzle") {
        for (let i=0;i<witches.length;i++) {
            witches[i].visible = false;
            witches[i].setCollision(false, false, false, false);
        }
    }
}

function spawnIngredients(amount) {
    for (let i=0;i<amount;i++) {

        ingredients.push(new Ingredient(vec2(randInt(levelSize.x),randInt(levelSize.y)), randInt(3)));
    }
}

function spawnWalls() {
    walls.push(new Wall(vec2(-.5,levelSize.y/2),            vec2(1,100))) // left
    walls.push(new Wall(vec2(levelSize.x+.5,levelSize.y/2), vec2(1,100))) // right
    walls.push(new Wall(vec2(levelSize.x/2,levelSize.y+.5), vec2(100,1))) // top
    walls.push(new Wall(vec2(levelSize.x/2,.5), vec2(100,1))) // bottom
}

function spawnTrees(amount) {
    for (let i=0;i<amount;i++) {
        trees.push(new Tree(vec2(randInt(levelSize.x),randInt(levelSize.y))));
    }
}

function cleanUpTrees() {
    for (let i=0;i<trees.length;i++) {
        trees[i].destroy();
    }

    trees = [];
}

function cleanUpWalls() {
    for (let i=0;i<walls.length;i++) {
        walls[i].destroy();
    }

    walls = [];
}

function cleanUpItems() {
    for (let i=0;i<items.length;i++) {
        items[i].destroy();
    }
    items = [];
}

function cleanUpIngredients() {
    for (let i=0;i<ingredients.length;i++) {
        ingredients[i].destroy();
    }
    ingredients = [];
}

function cleanUpPortals() {
    for (let i=0;i<portals.length;i++) {
        portals[i].destroy();
    }
    portals = [];
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

    score = 0;
    initialTime = 20;
    clickTimer = new Timer(1);
    clickTimer.unset();

    gameStarted = false;
    gameOver = false;

    cauldron = new Cauldron(vec2(levelSize.x/2, levelSize.y/2));
    trees = [];
    walls = [];
    witches = [];
    items = [];
    ingredients = [];
    portals = [];

    // create a table of all sprites
    /*spriteAtlas =
    {
        // large tiles
        boots: tile(0,16),
        priest: new TileInfo(vec2(16,0), vec2(16,32)),
        hut: new TileInfo(vec2(32,0), vec2(64,64)),
    }*/
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
        if(boots.mode == "action") {
            // woods so green ground
            drawRect(cameraPos, levelSize, new Color(0.0, 0.4, 0.0));
        } else {
            // hut so brown floor
            drawRect(cameraPos, levelSize, new Color(0.4, 0.4, 0.1));
        }
        

    }
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost()
{
    // draw to overlay canvas for hud rendering
    if (!gameStarted) {
        if(!gameOver) {
            drawTextScreen('Boots the Cat', vec2(mainCanvasSize.x/2, 0 + 70), 80);
            drawTextScreen('in', vec2(mainCanvasSize.x/2, mainCanvasSize.y/2 - 100), 80);
            drawTextScreen('Boots and the', vec2(mainCanvasSize.x/2, mainCanvasSize.y - 260), 80);
            drawTextScreen('Black Cauldron', vec2(mainCanvasSize.x/2, mainCanvasSize.y - 170), 80);
        } else {
            drawTextScreen('Game Over', vec2(mainCanvasSize.x/2, mainCanvasSize.y/2), 160, RED);
            drawTextScreen('Level ' + level + ' Reached', vec2(mainCanvasSize.x/2, mainCanvasSize.y/2+100), 60, RED);
            drawTextScreen('Final Score: ' + score, vec2(mainCanvasSize.x/2, mainCanvasSize.y/2+200), 60, RED);
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

        var ingrdientsHeld = '';
        for(var i=0;i<boots.ingredients.length;i++) {
            ingrdientsHeld += boots.ingredients[i].displayName + ', ';
        }
        drawTextScreen('Ingredient: ' + ingrdientsHeld, vec2(100, 160), 30, BLACK);
        drawTextScreen('Score: ' + score, vec2(80, 190), 30, new Color(0,0,0));
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