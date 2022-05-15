import kaboom from "kaboom"
import big from "./big"
import patrol from "./patrol"
import loadAssets from "./assets"


kaboom({
  background: [38, 99, 255] // The RGB code
})
loadAssets()

// define some constants
const JUMP_FORCE = 1320
const MOVE_SPEED = 480
const FALL_DEATH = 2400

const LEVELS = [
	[
		"                          $.   ",
		"                          $.   ",
		"                          $.   ",
		"                          $.   ",
		"                          $.   ", 
		"           $$         =   $.   ",
		"  %      ====         =   $.   ",
		"                      =   $.   ",
		"                      =        ",
		"       ^^      = >    =       @",
		"===============================",
	],
	[
		"     $        $    $       ",
		"     $        $    $       ",
		"                           ",
		"                           ",
		"             ===           ",
		"       =                   ",
		"       =                   ",
		"     > = ^^    >          @",
		"===========================",
	],
  [
		"                   $       ",
		"              $    $       ",
		"              $    $       ",
		"                         $ ",
		"             ===         $ ",
		"         =                 ",
		"         =                 ",
		"   ^^  > =      ^^^>^^^   @",
		"===========================",
	],
  [
		"     $    $    $    $     $",
		"     $    $    $    $     $",
		"                           ",
		"                           ",
		"                           ",
		"                           ",
		"                           ",
		"    ^>^^^^>^^^^>^^^^>     @",
		"===========================",
	],
  [
		"     $    $    $    $     $",
		"     $    $    $    $     $",
		"                           ",
		"                           ",
		"                           ",
		"                           ",
		"                           ",
		" ^^^^>^^^^>^^^^>^^^^>^^^^^@",
		"===========================",
	],
]

// define what each symbol means in the level graph
const levelConf = {
	// grid size
	width: 64,
	height: 64,
	// define each object as a list of components
	"=": () => [
		sprite("grass"),
		area(),
		solid(),
		origin("bot"),
	],
	"$": () => [
		sprite("coin"),
		area(),
		pos(0, -9),
		origin("bot"),
		"coin",
	],
	"%": () => [
		sprite("prize"),
		area(),
		solid(),
		origin("bot"),
		"prize",
	],
	"^": () => [
		sprite("spike"),
		area(),
		solid(),
		origin("bot"),
		"danger",
	],
	"#": () => [
		sprite("apple"),
		area(),
		origin("bot"),
		body(),
		"apple",
	],
	">": () => [
		sprite("ghosty"),
		area(),
		origin("bot"),
		body(),
		patrol(),
		"enemy",
	],
	"@": () => [
		sprite("portal"),
		area({ scale: 0.5, }),
		origin("bot"),
		pos(0, -12),
		"portal",
	],
}

scene("splash", () => {
  
	add([pos(460,120),
		text("",
        {
        size: 30, // 48 pixels tall
        width: 320, // it'll wrap to next line when width exceeds this value
        font: "sink", // there're 4 built-in fonts: "apl386", "apl386o", "sink", and "sinko"
    }),
	])

  add([sprite("innblikklogo",
             pos(width() / 4, height() / 4),
    origin("center"),
    // Allow the background to be scaled
    scale(1),
    // Keep the background position fixed even when the camera moves
    fixed()  
  )])

  

  const mark = add([
		sprite("portal"),
		pos(width() / 1.2, height() / 3.5),
		scale(10),
		rotate(0),
		origin("center"),
	]);



  
  //loadFont("unscii", "/fonts/unscii_8x8.png", 8, 8)
    // add a text at position (100, 100)
    add([
        text("Hjelp team kundebetjenings maskott <druen> med å nå målene for 2.tertial. \nVed å løse så mange jira tickets som mulig. \n\nTrykk på space for å starte spillet", {size: 24,font: "mccloud"}),
        pos(50, 300),
    ]);

  mark.action(() => {
		mark.scale = Math.sin(time()) * 1;
		mark.angle += dt();
	});

  
	onKeyPress(() => go("interlude"))
})

scene("interlude", ({ levelId, coins } = { levelId: 0, coins: 0 }) => {

  let levelMessage = "";

  switch(levelId) {
  case 1:
    levelMessage = "\n\n - Ada kundelogg";
    break;
  case 2:
    levelMessage = "\n\n - Innsiktsfase - Sikker dialog";
    break;
  case 3:
    levelMessage = "\n\n - Styringsverktøy for å prioritere smertepunkter";
    break;
  case 4:
    levelMessage = "\n\n - Etablere baseline for videre maalinger av smertepunkter";
    break;
  default:
    levelMessage = "\n\n - Opplyste pensjonsvalg fase III";
}
  
  add([pos(50,300),
       fixed(),
    text("Level "+(levelId+1)+levelMessage,{
      size: 24,
      width: width()/1,
      font: "mccloud",
      transform: (idx, ch) => ({
			color: hsl2rgb((time() * 0.2 + idx * 0.1) % 1, 0.7, 0.8),
			pos: vec2(0, wave(-4, 4, time() * 4 + idx * 0.5)),
			scale: wave(1, 1.2, time() * 3 + idx),
			angle: wave(-9, 9, time() * 3 + idx),
		})
    }),
  ])
  
  wait(3, () => go("game", {
				levelId: levelId,
				coins: coins,
			}))
  
  onKeyPress(() => go("game", {
				levelId: levelId,
				coins: coins,
			}))
});

scene("game", ({ levelId, coins } = { levelId: 0, coins: 0 }) => {

  
  
  let bg = add([sprite("bg",
             pos(width() / 2, height() / 2),
    origin("center"),
    // Allow the background to be scaled
    scale(1),
    // Keep the background position fixed even when the camera moves
    fixed()  
             )])
  
  
  
	gravity(3200)

	// add level to scene
	const level = addLevel(LEVELS[levelId ?? 0], levelConf)
  

	// define player object
	const player = add([
		sprite("tos"),
		pos(0, 0),
		area(),
		scale(1),
		// makes it fall to gravity and jumpable
		body(),
		// the custom component we defined above
		big(),
		origin("bot"),
	])

	// action() runs every frame
	player.onUpdate(() => {
		// center camera to player
		camPos(player.pos)
		// check fall death
		if (player.pos.y >= FALL_DEATH) {
			go("lose")
		}
	})

	// if player onCollide with any obj with "danger" tag, lose
	player.onCollide("danger", () => {
		go("lose")
		play("hit")
	})

	player.onCollide("portal", () => {
		play("portal")
		if (levelId + 1 < LEVELS.length) {
			go("interlude", {
				levelId: levelId + 1,
				coins: coins,
			})
		} else {
			go("win", {
				levelId: levelId + 1,
				coins: coins,
			})
		}
	})

	player.onGround((l) => {
		if (l.is("enemy")) {
			player.jump(JUMP_FORCE * 1.5)
			destroy(l)
			addKaboom(player.pos)
			play("powerup")
		}
	})

	player.onCollide("enemy", (e, col) => {
		// if it's not from the top, die
		if (!col.isBottom()) {
			go("lose", {
				levelId: levelId + 1,
				coins: coins,
			})
			play("hit")
		}
	})

	let hasApple = false

	// grow an apple if player's head bumps into an obj with "prize" tag
	player.onHeadbutt((obj) => {
		if (obj.is("prize") && !hasApple) {
			const apple = level.spawn("#", obj.gridPos.sub(0, 1))
			apple.jump()
			hasApple = true
			play("blip")
		}
	})

	// player grows big onCollide with an "apple" obj
	player.onCollide("apple", (a) => {
		destroy(a)
		// as we defined in the big() component
		player.biggify(3)
		hasApple = false
		play("powerup")
	})

	let coinPitch = 0

	onUpdate(() => {
		if (coinPitch > 0) {
			coinPitch = Math.max(0, coinPitch - dt() * 100)
		}
	})

	player.onCollide("coin", (c) => {
		destroy(c)
		play("coin", {
			detune: coinPitch,
		})
		coinPitch += 100
		coins += 1
		coinsLabel.text = "jira:" + coins
	})

	const coinsLabel = add([
		text("jira:"+coins),
		pos(24, 24),
		fixed(),
	])

	// jump with space
	onKeyPress("space", () => {
		// these 2 functions are provided by body() component
		if (player.isGrounded()) {
			player.jump(JUMP_FORCE)
		}
	})

	onKeyDown("left", () => {
		player.move(-MOVE_SPEED, 0)
	})

	onKeyDown("right", () => {
		player.move(MOVE_SPEED, 0)
	})

	onKeyPress("down", () => {
		player.weight = 3
	})

	onKeyRelease("down", () => {
		player.weight = 1
	})

	onKeyPress("f", () => {
		fullscreen(!fullscreen())
	})
})

scene("lose", ({ levelId, coins } = { levelId: 0, coins: 0 }) => {

  let message = "Takk for hjelpen så langt. \nDu hjalp kundebetjening med å løse: " + coins + " jiraer\n Du er velkommen til å prøve igjen\n ved å trykke på en tast.";
  
  add([pos(160,120),
       fixed(),
    text(message,{
      size: 24,
      width: width()/1,
      font: "mccloud",
      transform: (idx, ch) => ({
			color: hsl2rgb((time() * 0.2 + idx * 0.1) % 1, 0.7, 0.8),
			pos: vec2(0, wave(-4, 4, time() * 4 + idx * 0.5)),
			scale: wave(1, 1.2, time() * 3 + idx),
			angle: wave(-9, 9, time() * 3 + idx),
		})
    }),
  ])

  add([
		sprite("gameover"),
		pos(160, 250),])
  
	onKeyPress(() => go("interlude"))
})

scene("win", ({ levelId, coins } = { levelId: 0, coins: 0 }) => {
  const url = "Hurra, du hjalp team kundebetjening\nå nå målet for 2.tertial.\n\nDu greide å løse "+coins+" jiraer";
	add([
		text(url,{font: "mccloud",size: 32}),
	])
  add([
		sprite("winner"),
		pos(160, 220),])
	onKeyPress(() => go("splash"))
})

go("splash")