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
		pos(width() / 2, height() / 2),
		scale(10),
		rotate(0),
		origin("center"),
	]);

  loadFont("mccloud", "fonts/023_16.png", 8, 8)
  //loadFont("unscii", "/fonts/unscii_8x8.png", 8, 8)
    // add a text at position (100, 100)
    add([
        text("Hjelp kundebetjening med å nå målene for 2.tertial. \nVed aa løse så mange jira tickets som mulig. \n\nTrykk på space for å starte spillet", {size: 32,font: "sink"}),
        pos(50, 300),
    ]);

  mark.action(() => {
		mark.scale = Math.sin(time()) * 1;
		mark.angle += dt();
	});

  
	onKeyPress(() => go("game"))
})

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
			go("game", {
				levelId: levelId + 1,
				coins: coins,
			})
		} else {
			go("win")
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
			go("lose")
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

if (levelId == 0) {
  add([pos(24,124),
       fixed(),
    text("Indikator 1: - Opplyste pensjonsvalg fase III",{
      size: 30,
      width: 520,
      font: "apl386o"
    }),
  ])
  add([pos(24,324),
       fixed(),
    text("Bruk piltastene for aa komme deg til teamet\n\n Space knappen for aa hoppe.",{
      size: 30,
      width: 520,
      font: "apl386o"
    }),
  ])
} else if (levelId == 1) {
  add([pos(24,124),
       fixed(),
    text("Indikator 2: - Ada kundelogg",{
      size: 30,
      width: 520,
      font: "apl386o"
    }),
  ])
} else if (levelId == 2) {
  add([pos(24,124),
       fixed(),
    text("Indikator 3: - Innsiktsfase - Sikker dialog",{
      size: 30,
      width: 520,
      font: "apl386o"
    }),
  ])
} else if (levelId == 3) {
  add([pos(24,124),
       fixed(),
    text("Indikator 4: - Styringsverktoey for aa prioritere smertepunkter",{
      size: 30,
      width: 520,
      font: "apl386o"
    }),
  ])
} else if (levelId == 4) {
  add([pos(24,124),
       fixed(),
    text("Indikator 5: - Etablere baseline for videre maalinger av smertepunkter",{
      size: 30,
      width: 520,
      font: "apl386o"
    }),
  ])
} 




})

scene("lose", () => {
	add([pos(160,120),
		text("Nei, klarte ikke maalene :("),
	])

  add([
		sprite("gameover"),
		pos(160, 220),])
  
	onKeyPress(() => go("game"))
})

scene("win", () => {
  const url = "Hurra, du fikk team kundebetjening gjennom indikatorene for 2.tertial sine";
	add([
		text(url),
	])
  add([
		sprite("winner"),
		pos(160, 220),])
	onKeyPress(() => go("game"))
})

go("splash")