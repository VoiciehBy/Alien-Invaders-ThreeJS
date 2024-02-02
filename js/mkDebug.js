function mkDebug() {
    //DEBUG
    console.log("aliens[numberOfAliensInARow-1].position.y=" + aliens[numberOfAliensInARow - 1].position.y);
    console.log("aliens[0].position.y=" + aliens[0].position.y);
    console.log("player.position.y=" + player.position.y); console.log("i=" + i);
    console.log("Distance Between alien[0] and Bullet)" + distanceBetweenAlienAndTheBullet(aliens[0]));
} mkDebug();