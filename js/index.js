//CONSTANTS 
const offsetXBetweenAliens = 75;
const offsetYBetweenAliensRow = 100;
const offsetYBetweenFirstAlienRowAndPlayer = 1000;
const alienLeftCorner = -500;
const numberOfAliensInARow = 14;
const groundY = -512;
const groundBound = 600;
const playerMvm = 50;
const angle = -0.15;
const playerY = playerMvm + groundY;
const antiliasingValue = 16;

var mv = playerMvm;
var yAScene = new THREE.Scene();//new Scene initialization 
var yACamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerWidth, 0.5, 10000);//fieldOfView,aspectRatio,near,far
yACamera.position.y = Math.sin(angle) * 1200
yACamera.position.z = Math.cos(angle) * 1200
yACamera.lookAt(yAScene.position);
var yARenderer = new THREE.WebGLRenderer({ antialias: true });//new Scene initialization,turning on antiliasing
var yAKeyboard = new KeyboardState();
//var yAControls = new THREE.OrbitControls(yACamera, yARenderer.domElement);

//MATERIALS
//Loading and Wraping texture
var yASkyboxTexture = THREE.ImageUtils.loadTexture('https://upload.wikimedia.org/wikipedia/commons/3/30/Starry_Night_at_La_Silla.jpg');

yASkyboxTexture.repeat.set(1, 1);// texture repeat
yASkyboxTexture.wrapS = THREE.RepeatWrapping;//drawing from the start
yASkyboxTexture.wrapT = THREE.RepeatWrapping;
yASkyboxTexture.anisotropy = antiliasingValue;//anisotropic filtering
var yASkyboxMaterial = new THREE.MeshPhongMaterial({ map: yASkyboxTexture, side: THREE.BackSide });

var playerMaterial = new THREE.MeshBasicMaterial({ color: 0x0000FF });
var alienMaterial = new THREE.MeshBasicMaterial({ color: 0x00FFB0 });
var alienMaterial1 = new THREE.MeshBasicMaterial({ color: 0x00FFA0 });
var alienMaterial2 = new THREE.MeshBasicMaterial({ color: 0x00FF90 });
var alienMaterial3 = new THREE.MeshBasicMaterial({ color: 0x00FF80 });
var bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF70 });

var groundMaterial;

//Loading and Wraping texture
var simpleTexture = THREE.ImageUtils.loadTexture('img/cobblestone_by_nomeradona.jpg');
simpleTexture.repeat.set(16, 16);// texture repeat
simpleTexture.wrapS = THREE.RepeatWrapping;//drawing from the start
simpleTexture.wrapT = THREE.RepeatWrapping;
simpleTexture.anisotropy = antiliasingValue;//anisotropic filtering
groundMaterial = new THREE.MeshPhongMaterial({ map: simpleTexture });//binding material with the ground

//Loading and Wraping texture
var manualTexture = THREE.ImageUtils.loadTexture('img/manual.png');
manualTexture.repeat.set(1, 1);// texture repeat
manualTexture.wrapS = THREE.RepeatWrapping;//drawing from the start
manualTexture.wrapT = THREE.RepeatWrapping;
var manualMaterial = new THREE.MeshBasicMaterial({ map: manualTexture });

//GEOMETRIES
var yASkyboxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
var playerGeometry = new THREE.CubeGeometry(50, 50, 50);
var groundGeometry = new THREE.CubeGeometry(1150, 1, 1150);
var manualGeometry = new THREE.CubeGeometry(440, 1, 600);
var bulletGeometry = new THREE.CylinderGeometry(10, 10, 100);

//MESHES DECLARATIONS
var yASkybox = new THREE.Mesh(yASkyboxGeometry, yASkyboxMaterial);
var player = new THREE.Mesh(playerGeometry, playerMaterial);
var leftPlayer = new THREE.Mesh(playerGeometry, playerMaterial);
var rightPlayer = new THREE.Mesh(playerGeometry, playerMaterial);
var topPlayer = new THREE.Mesh(playerGeometry, playerMaterial);
var ground = new THREE.Mesh(groundGeometry, groundMaterial);
var manual = new THREE.Mesh(manualGeometry, manualMaterial);
var bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
var aliens = [];
var aliens1 = [];
var aliens2 = [];
var aliens3 = [];
var aliensStates = [];
var aliens1States = [];
var aliens2States = [];
var aliens3States = [];

ground.position.y = groundY;
manual.position.y = groundY + 1;
manual.position.z = 250;

//LIGHTS
var yAAmbientLight = new THREE.AmbientLight(0x00006F);//0x0000FF
var moon = new THREE.DirectionalLight(0xFF0000);//0x0000FF
moon.position.set(0, groundY + 512.005, 0);
var blood = new THREE.DirectionalLight(0xFF0000);//0x0000FF
blood.position.set(0, groundY + 512.005, 0);

var i = 0;
var bulletInMotion = false;
var isGamePaused = false;

yARenderer.setSize(window.innerWidth * 0.98, window.innerHeight * 0.98); // rendererWindowSize
document.body.appendChild(yARenderer.domElement); //adding renderer child (canvas) to HTML doc

//"METHODS"

//PLAYER
function initPlayer() {
    player.position.x = 0;
    player.position.y = playerY;
    player.position.z = 0;

    leftPlayer.position.x = player.position.x - playerMvm;
    leftPlayer.position.y = player.position.y;
    leftPlayer.position.z = 0;

    rightPlayer.position.x = player.position.x + 50;
    rightPlayer.position.y = player.position.y;

    topPlayer.position.x = 0;
    topPlayer.position.y = player.position.y + 50;
    topPlayer.position.z = 0;
} initPlayer();

function resetPlayer() {
    initPlayer();
}

//BULLET
bullet.position.y = topPlayer.position.y;

function isAlienAlive(alienState) {
    if (alienState == 1) return true;
    else return false;
}

function isAllAliensDead() {
    for (var j = 0; j < numberOfAliensInARow; j++) {
        if ((isAlienAlive(aliensStates[j])) ||
            (isAlienAlive(aliens1States[j])) ||
            (isAlienAlive(aliens2States[j])) || (isAlienAlive(aliens3States[j])))
            return false;
    }
    return true;
}

function removeAlien(alien, alienStateIndex) {
    yAScene.remove(alien);
    aliensStates[alienStateIndex] = 0;
}

function remove1Alien(alien, alienStateIndex) {
    yAScene.remove(alien);
    aliens1States[alienStateIndex] = 0;
}

function remove2Alien(alien, alienStateIndex) {
    yAScene.remove(alien);
    aliens2States[alienStateIndex] = 0;
}

function remove3Alien(alien, alienStateIndex) {
    yAScene.remove(alien);
    aliens3States[alienStateIndex] = 0;
}

function distanceBetweenAlienAndTheBullet(alien) {
    return Math.sqrt((alien.position.x - bullet.position.x) ** 2 + (alien.position.y - bullet.position.y) ** 2);
}

function removeAlienHitByTheBullet() {
    for (var j = 0; j < numberOfAliensInARow; j++)
        if (isAlienAlive(aliensStates[j]) && distanceBetweenAlienAndTheBullet(aliens[j]) <= 30)
            removeAlien(aliens[j], j);
    for (var j = 0; j < numberOfAliensInARow; j++)
        if (isAlienAlive(aliens1States[j]) && distanceBetweenAlienAndTheBullet(aliens1[j]) <= 30)
            remove1Alien(aliens1[j], j);
    for (var j = 0; j < numberOfAliensInARow; j++)
        if (isAlienAlive(aliens2States[j]) == true && distanceBetweenAlienAndTheBullet(aliens2[j]) <= 30)
            remove2Alien(aliens2[j], j);
    for (var j = 0; j < numberOfAliensInARow; j++)
        if (isAlienAlive(aliens3States[j]) && distanceBetweenAlienAndTheBullet(aliens3[j]) <= 30)
            remove3Alien(aliens3[j], j);
}

function moveAliensByX(xMove) {
    for (var j = 0; j < numberOfAliensInARow; j++) {
        aliens[j].position.x += xMove;
        aliens1[j].position.x += xMove;
        aliens2[j].position.x += xMove;
        aliens3[j].position.x += xMove;
    }
}
function moveAliensByY(yMove) {
    var aMove = Math.abs(yMove);
    for (var j = 0; j < numberOfAliensInARow; j++) {
        aliens[j].position.y -= aMove;
        aliens1[j].position.y -= aMove;
        aliens2[j].position.y -= aMove;
        aliens3[j].position.y -= aMove;
    }
}
function movePlayer(direction) {
    var pMvm = playerMvm * direction;
    player.position.x += pMvm;
    leftPlayer.position.x += pMvm;
    rightPlayer.position.x += pMvm;
    topPlayer.position.x += pMvm;
}
function movePlayerLeft() {
    movePlayer(-1);
}
function movePlayerRight() {
    movePlayer(1);
}

function moveBullet() {
    yAScene.add(bullet);
    bullet.position.y += 20;
    bulletInMotion = true;
}

yAScene.add(yASkybox);
yAScene.add(yAAmbientLight);
yAScene.add(moon);
yAScene.add(blood);
yAScene.add(ground);
yAScene.add(manual);
function createPlayer() {
    yAScene.add(player);
    yAScene.add(leftPlayer);
    yAScene.add(rightPlayer);
    yAScene.add(topPlayer);
} createPlayer();

function initAliens() {
    for (var j = 0; j < numberOfAliensInARow; j++) {
        aliens[j] = new THREE.Mesh(playerGeometry, alienMaterial);
        aliens1[j] = new THREE.Mesh(playerGeometry, alienMaterial1);
        aliens2[j] = new THREE.Mesh(playerGeometry, alienMaterial2);
        aliens3[j] = new THREE.Mesh(playerGeometry, alienMaterial3);
        aliensStates[j] = 1;
        aliens1States[j] = 1;
        aliens2States[j] = 1;
        aliens3States[j] = 1;

        aliens[j].position.x = alienLeftCorner + (j + 1) * offsetXBetweenAliens;
        aliens1[j].position.x = alienLeftCorner + (j + 1) * offsetXBetweenAliens;
        aliens2[j].position.x = alienLeftCorner + (j + 1) * offsetXBetweenAliens;
        aliens3[j].position.x = alienLeftCorner + (j + 1) * offsetXBetweenAliens;

        aliens[j].position.y = player.position.y + offsetYBetweenFirstAlienRowAndPlayer;
        aliens1[j].position.y = player.position.y + offsetYBetweenFirstAlienRowAndPlayer + offsetYBetweenAliensRow;
        aliens2[j].position.y = player.position.y + offsetYBetweenFirstAlienRowAndPlayer + 2 * offsetYBetweenAliensRow;
        aliens3[j].position.y = player.position.y + offsetYBetweenFirstAlienRowAndPlayer + 3 * offsetYBetweenAliensRow;
    }
} initAliens();

function createAliens() {
    for (var j = 0; j < numberOfAliensInARow; j++) {
        yAScene.add(aliens[j]);
        yAScene.add(aliens1[j]);
        yAScene.add(aliens2[j]);
        yAScene.add(aliens3[j]);
    }
} createAliens();

function resetAliens() {
    for (var j = 0; j < numberOfAliensInARow; j++) {
        aliens[j].position.x = alienLeftCorner + (j + 1) * offsetXBetweenAliens;
        aliens1[j].position.x = alienLeftCorner + (j + 1) * offsetXBetweenAliens;
        aliens2[j].position.x = alienLeftCorner + (j + 1) * offsetXBetweenAliens;
        aliens3[j].position.x = alienLeftCorner + (j + 1) * offsetXBetweenAliens;

        aliens[j].position.y = player.position.y + offsetYBetweenFirstAlienRowAndPlayer;
        aliens1[j].position.y = player.position.y + offsetYBetweenFirstAlienRowAndPlayer + offsetYBetweenAliensRow;
        aliens2[j].position.y = player.position.y + offsetYBetweenFirstAlienRowAndPlayer + 2 * offsetYBetweenAliensRow;
        aliens3[j].position.y = player.position.y + offsetYBetweenFirstAlienRowAndPlayer + 3 * offsetYBetweenAliensRow;

        aliensStates[j] = 1;
        aliens1States[j] = 1;
        aliens2States[j] = 1;
        aliens3States[j] = 1;
    }
}

function resetBullet() {
    bullet.position.x = player.position.x;
    bullet.position.y = topPlayer.position.y;
    bullet.position.z = player.position.z;
    bulletInMotion = false;
}

function isAlienCrossedTheLine() {
    for (var j = 0; j < numberOfAliensInARow; j++)
        if (aliensStates[j] == 1 && (aliens[j].position.y <= groundY))
            return true;
    for (var j = 0; j < numberOfAliensInARow; j++)
        if (aliens1States[j] == 1 && (aliens1[j].position.y <= groundY))
            return true;
    for (var j = 0; j < numberOfAliensInARow; j++)
        if (aliens2States[j] == 1 && (aliens2[j].position.y <= groundY))
            return true;
    for (var j = 0; j < numberOfAliensInARow; j++)
        if (aliens3States[j] == 1 && (aliens3[j].position.y <= groundY))
            return true;
    return false;
}

function resetGame() {
    resetPlayer();
    resetAliens();
    createAliens();
    resetBullet();
}

function update() {
    //KEYBOARD HANDLING
    yAKeyboard.update();

    if (yAKeyboard.down("esc"))
        resetGame();
    if (yAKeyboard.down("enter"))
        isGamePaused = !isGamePaused;

    if (isGamePaused == true)
        return;

    if (yAKeyboard.down("left") && player.position.x - playerMvm > -500)
        movePlayerLeft();
    if (yAKeyboard.down("right") && player.position.x + playerMvm < 500)
        movePlayerRight();
    if (yAKeyboard.down("space")) {
        resetBullet();
        moveBullet();
    }
    if (bulletInMotion == true)
        moveBullet();
    if (bullet.position.y >= 1000) {
        resetBullet();
        yAScene.remove(bullet);
    }

    removeAlienHitByTheBullet();

    switch (i) {
        case 0:
            moveAliensByX(mv / 16);
            if (yAKeyboard.down("right") && player.position.x + Math.abs(playerMvm) < groundBound)
                player.position.x += Math.abs(playerMvm);
            break;
        case 5://20
            moveAliensByX(mv / 4);
            break;
        case 10://30
            moveAliensByX(mv / 2);
            break;
        case 20://50
            i = 0;
            if (aliens[0].position.x < -groundBound || aliens[numberOfAliensInARow - 1].position.x > groundBound) {
                moveAliensByY(mv);
                mv *= -1;
            }
            if (isAlienCrossedTheLine() || isAllAliensDead())
                resetGame();
            break;
    }
    ++i;
}

function render() { //renderLoop (60 FPS)
    requestAnimationFrame(render);
    update();
    yARenderer.render(yAScene, yACamera);
} render();