let canvas = document.getElementById('canvas')
let lifeCounter = document.getElementById('lifecounter')
let protectorCooldown = document.getElementById('protectorcooldown')
let context = canvas.getContext('2d')
let enemyArray = []
let powerArray = []
let lastDirectionX = 0
let lastDirectionY = 0
let activateProtector = false
let protectorTimer = true
let speedUp = false
let godMode = false
let posX = 0
let posY = 0
let ballStartPos = 1
let ballVelx = 0
let ballVely = 0

// styling
let windowHeight = window.innerHeight
let windowWidth = window.innerWidth
canvas.width = windowWidth * 0.9
canvas.height = windowHeight * 0.9
canvas.style.background = '#88f'

// object for the player ball to move and exist
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
  shift() {
    if (this.pos.x > canvas.width) {
      this.pos.x -= canvas.width - 1
    }
    if (this.pos.x < canvas.width - canvas.width) {
      this.pos.x += canvas.width - 1
    }
    if (this.pos.y > canvas.height) {
      this.pos.y -= canvas.height - 1
    }
    if (this.pos.y < canvas.height - canvas.height) {
      this.pos.y += canvas.height - 1
    }
  },
}
//object for the protecting circle to exist, move and bounce
let protectorCircle = {
  pos: {
    x: Math.floor(Math.random() * (canvas.width * 0.7)) + 100,
    y: Math.floor(Math.random() * (canvas.height * 0.7)) + 100,
  },
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
      this.pos.x + 110 > canvas.width ||
      this.pos.x - 110 < canvas.width - canvas.width
    ) {
      lastDirectionX = lastDirectionX * -1
    }
    if (
      this.pos.y + 110 > canvas.height ||
      this.pos.y - 110 < canvas.height - canvas.height
    ) {
      lastDirectionY = lastDirectionY * -1
    }
  },
}

//class constructor for creating powerups and making them interact with the player
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
//class constructor for creating enemy balls and making them interact
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
  shift() {
    if (this.pos.x > canvas.width) {
      this.pos.x -= canvas.width - 1
    }
    if (this.pos.x < canvas.width - canvas.width) {
      this.pos.x += canvas.width - 1
    }
    if (this.pos.y > canvas.height) {
      this.pos.y -= canvas.height - 1
    }
    if (this.pos.y < canvas.height - canvas.height) {
      this.pos.y += canvas.height - 1
    }
  }
  touchEdge(index) {
    if (
      this.pos.x > canvas.width ||
      this.pos.x < canvas.width - canvas.width ||
      this.pos.y > canvas.height ||
      this.pos.y < canvas.height - canvas.height
    ) {
      console.log('disapear')
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
// functioner för speedUp poweruppen
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
//function för att aktivera protectorCircle
window.addEventListener('keydown', function (event) {
  if (event.key === ' ' && protectorTimer) {
    activateProtector = true
    protectorTimer = false
    protectorCooldown.innerHTML = 'Protector is on CoolDown!'
    setTimeout(() => {
      setTimeout(() => {
        protectorCooldown.innerHTML =
          'Protector Circle is ready, press Space to feel Safe!'
        protectorCircle.pos.x =
          Math.floor(Math.random() * (canvas.width * 0.7)) + 100
        protectorCircle.pos.y =
          Math.floor(Math.random() * (canvas.height * 0.7)) + 100
        protectorTimer = true
      }, 5000)
      activateProtector = false
    }, 10000)
  }
})
// function for deciding enemyBall velocity
function decideBallVel() {
  ballVelx = -Math.floor(Math.random() * 10) + 5
  ballVely = Math.floor(Math.random() * 10) + 5
}
// function for deciding enemyball starting possition
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
// function for drawing and moving the protectorCircle
function protector() {
  if (activateProtector) {
    protectorCircle.draw()
    protectorCircle.move()
    protectorCircle.bounce()
  }
}
// function for creating the enemyBalls
function createEnemyBall() {
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
}
// when touchProtector was in the same for loop as touch player there was an error
//function for handeling the enemyballs
function handleEnemyBall() {
  for (let i = 0; i < enemyArray.length; i++) {
    enemyArray[i].draw()
    enemyArray[i].move()
  }
  for (let i = 0; i < enemyArray.length; i++) {
    enemyArray[i].touchPlayer(i)
  }
  for (let i = 0; i < enemyArray.length; i++) {
    enemyArray[i].shift()
  }
  for (let i = 0; i < enemyArray.length; i++) {
    if (activateProtector) {
      enemyArray[i].touchProtector(i)
    }
  }
}
//Funktion för att skapa "powerUp's".
function createPowerUp() {
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
}
//Funktionen som kör spelet
function runGame() {
  decideBallVel()
  decideBallPos()
  context.clearRect(0, 0, canvas.width, canvas.height)
  playerBall.draw()
  playerBall.shift()
  protector()
  createEnemyBall()
  handleEnemyBall()
  createPowerUp()

  if (playerBall.health < 1) {
    return (lifeCounter.innerHTML = 'You are Dead!')
  }
  //Sätter hastigheten som spelet kör i
  setTimeout(() => {
    return runGame()
  }, 100)
}
protectorCooldown.innerHTML =
  'Protector Circle is ready, press Space to feel Safe!'
lifeCounter.innerHTML = playerBall.health
runGame()
