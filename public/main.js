let canvas = document.getElementById('canvas')
let lifeCounter = document.getElementById('lifecounter')
let context = canvas.getContext('2d')
let enemyArray = []
let powerArray = []
let lastDirectionX = 0
let lastDirectionY = 0
let activateProtector = false
let protectorTimer = true
let startTime = 0
let endTime = 0

// styling
let windowHeight = window.innerHeight
let windowWidth = window.innerWidth
canvas.width = windowWidth * 0.9
canvas.height = windowHeight * 0.9
canvas.style.background = '#88f'

// spelare som ska kunna röra sig när man trycker på tangenter
// markörer för fiender som ska komma in från sidan av canvasen och röra sig till motsatt sida
// collision detection

let playerBall = {
  health: 3,
  pos: { x: canvas.width / 2, y: canvas.height / 2 },
  draw() {
    context.beginPath()
    context.arc(this.pos.x, this.pos.y, 30, 0, Math.PI * 2)
    context.fillStyle = 'rgb(255,255,255)'
    context.fill()
    context.closePath()
  },
  move() {
    this.pos.x += this.velx
    this.pos.y += this.vely
  },
}

let protectorCircle = {
  pos: { x: playerBall.pos.x, y: playerBall.pos.y },
  draw() {
    context.beginPath()
    context.strokeStyle = 'green'
    context.lineWidth = 10
    context.arc(this.pos.x, this.pos.y, 100, 0, Math.PI * 2)
    context.stroke()
    context.closePath()
  },
  move() {
    this.pos.x += lastDirectionX
    this.pos.y += lastDirectionY
  },
  bounce() {
    if (
      this.pos.x + 100 > canvas.width ||
      this.pos.x - 100 < canvas.width - canvas.width
    ) {
      lastDirectionX = lastDirectionX * -1
    }
    if (
      this.pos.y + 100 > canvas.height ||
      this.pos.y - 100 < canvas.height - canvas.height
    ) {
      lastDirectionY = lastDirectionY * -1
    }
  },
}

// functioner för att få bollen att röra sig rakt
window.addEventListener('keydown', function (event) {
  if (event.key == 'w') {
    playerBall.pos.y -= 6
    if (!activateProtector) {
      lastDirectionY = -6
    }
  }
})
window.addEventListener('keydown', function (event) {
  if (event.key == 's') {
    playerBall.pos.y += 6
    if (!activateProtector) {
      lastDirectionY = 6
    }
  }
})
window.addEventListener('keydown', function (event) {
  if (event.key == 'a') {
    playerBall.pos.x -= 7
    if (!activateProtector) {
      lastDirectionX = -7
    }
  }
})
window.addEventListener('keydown', function (event) {
  if (event.key == 'd') {
    playerBall.pos.x += 7
    if (!activateProtector) {
      lastDirectionX = 7
    }
  }
})

window.addEventListener('keydown', function (event) {
  if (event.key == 'w' && speedUp) {
    playerBall.pos.y -= 6
  }
})
window.addEventListener('keydown', function (event) {
  if (event.key == 's' && speedUp) {
    playerBall.pos.y += 6
  }
})
window.addEventListener('keydown', function (event) {
  if (event.key == 'a' && speedUp) {
    playerBall.pos.x -= 7
  }
})
window.addEventListener('keydown', function (event) {
  if (event.key == 'd' && speedUp) {
    playerBall.pos.x += 7
  }
})

window.addEventListener('keydown', function (event) {
  if (event.key === ' ' && protectorTimer) {
    activateProtector = true
    protectorTimer = false
    startTime = performance.now()
    setTimeout(() => {
      setTimeout(() => {
        protectorTimer = true
      }, 10000)
      activateProtector = false
    }, 5000)
  }
})

/*

*/
let speedUp = false
let godMode = false
class PowerUp {
  constructor(pos, radie, color) {
    this.pos = pos
    this.radie = radie
    this.color = color
  }
  draw() {
    context.beginPath()
    context.arc(this.pos.x, this.pos.y, this.radie, 0, Math.PI * 2)
    context.fillStyle = this.color
    context.fill()
    context.closePath()
  }
  /*
if (powerArray[i].color === ){
  speedUp()
}
*/
  speedUp(index) {
    let distanceX = (this.pos.x - playerBall.pos.x) ** 2
    let distanceY = (this.pos.y - playerBall.pos.y) ** 2
    let distance = Math.sqrt(distanceX + distanceY)
    if (distance < 70) {
      powerArray.splice(index, 1)
      speedUp = true
      setTimeout(() => {
        return (speedUp = false)
      }, 5000)
    }
  }

  healthUp(index) {
    let distanceX = (this.pos.x - playerBall.pos.x) ** 2
    let distanceY = (this.pos.y - playerBall.pos.y) ** 2
    let distance = Math.sqrt(distanceX + distanceY)
    if (distance < 70) {
      powerArray.splice(index, 1)
      playerBall.health += 1
      lifeCounter.innerHTML = playerBall.health
    }
  }

  godMode(index) {
    let distanceX = (this.pos.x - playerBall.pos.x) ** 2
    let distanceY = (this.pos.y - playerBall.pos.y) ** 2
    let distance = Math.sqrt(distanceX + distanceY)
    if (distance < 70) {
      powerArray.splice(index, 1)
      godMode = true
      setTimeout(() => {
        return (godMode = false)
      }, 5000)
    }
  }
}

class EnemyBall {
  constructor(pos, velx, vely, radie, color) {
    ;(this.pos = pos),
      (this.velx = velx),
      (this.vely = vely),
      (this.radie = radie),
      (this.color = color)
  }
  draw() {
    context.beginPath()
    context.arc(this.pos.x, this.pos.y, this.radie, 0, Math.PI * 2)
    context.fillStyle = this.color
    context.fill()
    context.closePath()
  }
  move() {
    this.pos.x += this.velx
    this.pos.y += this.vely
  }
  touchEdge(index) {
    if (
      this.pos.x > canvas.width ||
      this.pos.x < canvas.width - canvas.width ||
      this.pos.y > canvas.height ||
      this.pos.y < canvas.height - canvas.height
    ) {
      enemyArray.splice(index, 1)
    }
  }
  touchPlayer(index) {
    let distanceX = (this.pos.x - playerBall.pos.x) ** 2
    let distanceY = (this.pos.y - playerBall.pos.y) ** 2
    let distance = Math.sqrt(distanceX + distanceY)
    if (distance < 40 && !godMode) {
      enemyArray.splice(index, 1)
      playerBall.health -= 1
      lifeCounter.innerHTML = playerBall.health
    }
  }
  touchProtector(index) {
    let distanceX = (this.pos.x - protectorCircle.pos.x) ** 2
    let distanceY = (this.pos.y - protectorCircle.pos.y) ** 2
    let distance = Math.sqrt(distanceX + distanceY)
    if (distance < 110) {
      enemyArray.splice(index, 1)
    }
  }
}

/*


let distanceX = (ball.position.x - this.position.x) ** 2;
            let distanceY = (ball.position.y - this.position.y) ** 2;
            let distance = Math.sqrt(distanceX + distanceY);
*/

let posX = 0
let posY = 0
let ballStartPos = 1
let ballVelx = 0
let ballVely = 0

function decideBallVel() {
  ballVelx = -Math.floor(Math.random() * 10) + 5
  ballVely = Math.floor(Math.random() * 10) + 5
}

function decideBallPos() {
  if (ballStartPos === 1) {
    posX = Math.floor(Math.random() * canvas.width)
    posY = canvas.height - canvas.height
    ballVelx = ballVelx * -1
  }
  if (ballStartPos === 2) {
    posX = canvas.width - canvas.width
    posY = Math.floor(Math.random() * canvas.height)
    ballVely = ballVely * -1
  }
  if (ballStartPos === 3) {
    posX = canvas.width
    posY = Math.floor(Math.random() * canvas.height)
    ballVelx = ballVelx * -1
  }
  if (ballStartPos === 4) {
    posX = Math.floor(Math.random() * canvas.width)
    posY = canvas.height
    ballVely = ballVely * -1
  }

  if (ballStartPos < 4) {
    ballStartPos = ballStartPos + 1
  } else {
    ballStartPos = 1
  }
}

function runGame() {
  decideBallVel()
  decideBallPos()

  context.clearRect(0, 0, canvas.width, canvas.height)
  playerBall.draw()
  if (activateProtector) {
    protectorCircle.draw()
    protectorCircle.move()
    protectorCircle.bounce()
  }
  if (enemyArray.length < 20) {
    let r = Math.floor(Math.random() * 256)
    let g = Math.floor(Math.random() * 256)
    let b = Math.floor(Math.random() * 256)

    enemyArray.push(
      new EnemyBall(
        { x: posX, y: posY },
        ballVelx,
        ballVely,
        10,
        'rgb(' + r + ',' + g + ',' + b + ')'
      )
    )
  }

  let powerColor = ''

  let randomizer = Math.floor(Math.random() * 150)
  if (randomizer === 1 || randomizer === 2 || randomizer === 3) {
    if (randomizer === 1) {
      powerColor = 'rgb(255,0,0'
    } else if (randomizer === 2) {
      powerColor = 'rgb(0,0,255'
    } else {
      powerColor = 'rgb(0,255,0'
    }
    if (powerArray.length < 1) {
      powerArray.push(
        new PowerUp(
          {
            x: Math.floor(Math.random() * canvas.width),
            y: Math.floor(Math.random() * canvas.height),
          },
          40,
          powerColor
        )
      )
    }
  }
  for (let i = 0; i < powerArray.length; i++) {
    powerArray[i].draw()
    if (powerArray[i].color === 'rgb(255,0,0') {
      powerArray[i].healthUp(i)
    } else if (powerArray[i].color === 'rgb(0,0,255') {
      powerArray[i].speedUp(i)
    } else {
      powerArray[i].godMode(i)
    }
  }

  for (let i = 0; i < enemyArray.length; i++) {
    enemyArray[i].draw()
    enemyArray[i].move()
    if (activateProtector) {
      enemyArray[i].touchProtector(i)
    }
    enemyArray[i].touchPlayer(i)
    enemyArray[i].touchEdge(i)
  }
  if (playerBall.health < 1) {
    return (lifeCounter.innerHTML = 'You are Dead!')
  }
  setTimeout(() => {
    return runGame()
  }, 100)
}
lifeCounter.innerHTML = playerBall.health
runGame()

/*

touchPlayer()

*/
