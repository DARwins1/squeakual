include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const MIS_NUM_TRANSPORTS = (difficulty < HARD) ? 4 : (difficulty < INSANE) ? 3 : 2; // Good enough for now...
const MIS_TEAM_ZULU = 1;
const transportEntryPos = { x: 180, y: 2 }; // Cinematic transport entry position
const colTransportEntryPos = { x: 138, y: 30 };

var firstTransport; // Whether the player's first transport has landed
var startedFromMenu;
var playerColour;
var allowExtraWaves; // Increases the amount of Infested reinforcements as the level progresses

const mis_collectiveResearch = [
	"R-Wpn-MG-Damage04", "R-Wpn-Rocket-Damage03", "R-Wpn-Mortar-Damage03", 
	"R-Wpn-Flamer-Damage03", "R-Wpn-Cannon-Damage03", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals03", "R-Struc-Materials03", 
	"R-Defense-WallUpgrade03", "R-Sys-Engineering02", "R-Cyborg-Metals03",
	"R-Wpn-Cannon-Accuracy01", "R-Wpn-Rocket-Accuracy02", "R-Wpn-AAGun-ROF01",
	"R-Wpn-AAGun-Damage01", "R-Vehicle-Engine03", "R-Wpn-AAGun-Accuracy01",
	"R-Struc-RprFac-Upgrade01",
];
const mis_infestedResearch = [
	"R-Wpn-MG-Damage04", "R-Wpn-Rocket-Damage03", "R-Wpn-Mortar-Damage03", 
	"R-Wpn-Flamer-Damage03", "R-Wpn-Cannon-Damage03", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals03", "R-Struc-Materials03", 
	"R-Defense-WallUpgrade03", "R-Sys-Engineering02", "R-Cyborg-Metals03",
	"R-Wpn-Cannon-Accuracy01", "R-Wpn-Rocket-Accuracy02", "R-Wpn-AAGun-ROF01",
	"R-Wpn-AAGun-Damage01", "R-Vehicle-Engine03", "R-Wpn-AAGun-Accuracy01",
	"R-Struc-RprFac-Upgrade01",
];

camAreaEvent("vtolRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("vtolRemoveZone", CAM_THE_COLLECTIVE);
});

function heliAttack()
{
	const ext = {
		limit: 1,
		targetPlayer: CAM_HUMAN_PLAYER,
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "heliAttackPos", "vtolRemoveZone", [cTempl.helpod], camChangeOnDiff(camMinutesToMilliseconds(2.25)), "heliTower", ext);
}

function vtolAttack()
{
	// MGs and Phosphor Bombs
	const templates = [cTempl.colphosv];
	if (difficulty < INSANE)
	{
		templates.push(cTempl.colhmgv);
	}
	else
	{
		// If we're on Insane, replace HMG VTOLs with Assault Guns
		templates.push(cTempl.colagv)
	}
	const ext = {
		limit: [2, 3],
		alternate: true,
		targetPlayer: CAM_HUMAN_PLAYER,
		pos: camMakePos("landingZone"),
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2.5)), "colCC", ext);
}

//Gives starting tech and research.
function grantPlayerTech()
{
	for (let x = 0, l = camBasicStructs.length; x < l; ++x)
	{
		enableStructure(camBasicStructs[x], CAM_HUMAN_PLAYER);
	}

	camCompleteRequiredResearch(camAct3StartResearch, CAM_HUMAN_PLAYER);
}

// Bump the rank of the first batch of transport droids (if starting from the menu).
function eventTransporterLanded(transport)
{
	if (transport.player === CAM_HUMAN_PLAYER)
	{
		if (firstTransport)
		{			
			// Transfer all Zulu units/structures to the player
			const objs = enumDroid(MIS_TEAM_ZULU).concat(enumStruct(MIS_TEAM_ZULU));
			for (const obj of objs)
			{
				donateObject(obj, CAM_HUMAN_PLAYER);
			}

			camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "A3L2", {
				ignoreInfestedUnits: true // The Infested never stop spawning; their units don't need to be wiped out to win
			});
		}

		if (startedFromMenu)
		{
			droids = enumCargo(transport);
			const droidExp = (firstTransport) ? [128] : [64, 32, 16, 8];

			for (let i = 0, len = droids.length; i < len; ++i)
			{
				const droid = droids[i];
				if (droid.droidType !== DROID_CONSTRUCT && droid.droidType !== DROID_REPAIR)
				{
					setDroidExperience(droid, droidExp[i % droidExp.length]);
				}
			}
		}

		firstTransport = false;
	}
}

// Enable the main Collective factory and all Infested factories
// Also sends a group of Infested towards the player's base
function activateFirstFactories()
{
	camEnableFactory("colFactory");
	camEnableFactory("infFactory1");
	camEnableFactory("infFactory2");
	camEnableFactory("infFactory3");

	// Send a group of Bashers towards the player's base
	camSendReinforcement(CAM_INFESTED, getObject("infEntry5"), camRandInfTemplates([cTempl.basher], 8, 6), CAM_REINFORCE_GROUND,
		{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
	);

	// Start spawning additional waves of infested
	allowExtraWaves = true;
}

// Enable the scavenger factories
function activateSecondFactories()
{
	camEnableFactory("cScavFactory1");
	camEnableFactory("cScavFactory2");
}

// Enable the Collective's cyborg factory and start bringing in transports
function startCollectiveTransports()
{
	camEnableFactory("colCybFactory");
	sendCollectiveTransporter();
	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(8)));
}

function sendCollectiveTransporter()
{
	// First, check if the LZ is still alive
	if (camBaseIsEliminated("colLZBase"))
	{
		// Try again next time...
		return;
	}

	// Next, add grab some droids for the transport
	const TRANSPORT_SIZE = ((difficulty <= EASY) ? 6 : ((difficulty === MEDIUM) ? 8 : 10));
	const droidPool = [
		cTempl.cominft, // Inferno
		cTempl.cybth, // Thermite Flamer
	];
	if (difficulty <= EASY)
	{
		droidPool.push(cTempl.comhmgt); // Heavy Machinegun
		droidPool.push(cTempl.cybhg); // Heavy Machinegunner
		droidPool.push(cTempl.cybgr); // Grenadier
	}
	else if (difficulty >= MEDIUM)
	{
		droidPool.push(cTempl.comagt); // Assault Gun
		droidPool.push(cTempl.cybag); // Assault Gunner
		if (difficulty < HARD)
		{
			droidPool.push(cTempl.cybgr); // Grenadier
		}
		else
		{
			droidPool.push(cTempl.scygr); // Super Grenadier
		}
	}

	const droids = [];
	for (let i = 0; i < TRANSPORT_SIZE; i++)
	{
		droids.push(droidPool[camRand(droidPool.length)]);
	}

	// Send the transport!
	camSendReinforcement(CAM_THE_COLLECTIVE, camMakePos("landingZoneCollective"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: colTransportEntryPos,
			exit: colTransportEntryPos,
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 20
			}
		}
	);
}

function sendInfestedReinforcements()
{	
	const CORE_SIZE = 4 + camRand(5);
	const FODDER_SIZE = 14 + camRand(3);

	// South road entrance
	// (Stops entirely when factory is destroyed)
	if (getObject("infFactory1") !== null)
	{
		const droids = [cTempl.stinger, cTempl.infbloke, cTempl.infkevbloke, cTempl.infminitruck, cTempl.infbuggy, cTempl.infrbuggy];
		const TARGET = (camBaseIsEliminated("colSouthRoadblock")) ? undefined : CAM_THE_COLLECTIVE;
		camSendReinforcement(CAM_INFESTED, getObject("infEntry1"), camRandInfTemplates(droids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND,
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: TARGET}}
		);
	}

	// South canal entrance
	// (Does NOT stop for the entire mission!)
	if (allowExtraWaves)
	{
		const droids = [cTempl.stinger, cTempl.inffiretruck, cTempl.infkevbloke, cTempl.inflance, cTempl.infbuggy, cTempl.infrbuggy];
		const TARGET = (camBaseIsEliminated("colSouthRoadblock")) ? undefined : CAM_THE_COLLECTIVE;
		camSendReinforcement(CAM_INFESTED, getObject("infEntry2"), camRandInfTemplates(droids, CORE_SIZE / 2, 2 * FODDER_SIZE / 3), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: TARGET}}
		);

	}

	// East base entrance
	if (getObject("infFactory2") !== null && allowExtraWaves)
	{
		const droids = [cTempl.stinger, cTempl.infkevlance, cTempl.infbuscan, cTempl.infbloke, cTempl.infbjeep, cTempl.infrbjeep];
		camSendReinforcement(CAM_INFESTED, getObject("infEntry3"), camRandInfTemplates(droids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);
	}

	// East trench entrance
	if (allowExtraWaves)
	{
		const droids = [cTempl.stinger, cTempl.infkevlance, cTempl.infmoncan, cTempl.infbloke, cTempl.infbjeep, cTempl.infrbjeep];
		const TARGET = (camBaseIsEliminated("colEastRoadblock")) ? undefined : CAM_THE_COLLECTIVE;
		camSendReinforcement(CAM_INFESTED, getObject("infEntry4"), camRandInfTemplates(droids, CORE_SIZE / 2, 2 * FODDER_SIZE / 3), CAM_REINFORCE_GROUND,
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: TARGET}}
		);
	}

	// East road entrance
	// (Gets weaker when factory is destroyed)
	// Make these waves smaller once the factory is destroyed
	const EAST_CORE_SIZE = (getObject("infFactory3") !== null) ? CORE_SIZE : CORE_SIZE / 2;
	const EAST_FODDER_SIZE = (getObject("infFactory3") !== null) ? FODDER_SIZE : 2 * FODDER_SIZE / 3;

	const droids = [cTempl.stinger, cTempl.infbloke, cTempl.infkevbloke, cTempl.infminitruck, cTempl.infbuggy, cTempl.infrbuggy];
	const TARGET = (camBaseIsEliminated("colEastRoadblock")) ? undefined : CAM_THE_COLLECTIVE;
	camSendReinforcement(CAM_INFESTED, getObject("infEntry5"), camRandInfTemplates(droids, EAST_CORE_SIZE, EAST_FODDER_SIZE), CAM_REINFORCE_GROUND,
		{order: CAM_ORDER_ATTACK, data: {targetPlayer: TARGET}}
	);
}

// Spawns a player unit at the LZ, and then removes it.
// If the unit had any EXP, repeat the cycle.
// Do this until the spawned unit has no EXP
function drainPlayerExp()
{
	const pos = camMakePos("landingZone");
	let droidExp = -1;
	while (droidExp != 0)
	{
		const droid = addDroid(CAM_HUMAN_PLAYER, pos.x, pos.y, "EXP Sink", "Body1REC", "wheeled01", "", "", "MG1Mk1");
		droidExp = droid.experience;
		camSafeRemoveObject(droid);
	}
}

// Allow the player to change to colors that are hard-coded to be unselectable
function eventChat(from, to, message)
{
	let colour = 0;
	switch (message)
	{
		case "green me":
			colour = 0; // Green
			break;
		case "orange me":
			colour = 1; // Orange
			break;
		case "grey me":
		case "gray me":
			colour = 2; // Gray
			break;
		case "black me":
			colour = 3; // Black
			break;
		case "red me":
			colour = 4; // Red
			break;
		case "blue me":
			colour = 5; // Blue
			break;
		case "pink me":
			colour = 6; // Pink
			break;
		case "aqua me":
		case "cyan me":
			colour = 7; // Cyan
			break;
		case "yellow me":
			colour = 8; // Yellow
			break;
		case "purple me":
			colour = 9; // Purple
			break;
		case "white me":
			colour = 10; // White
			break;
		case "bright blue me":
		case "bright me":
			colour = 11; // Bright Blue
			break;
		case "neon green me":
		case "neon me":
		case "bright green me":
			colour = 12; // Neon Green
			break;
		case "infrared me":
		case "infra red me":
		case "infra me":
		case "dark red me":
			colour = 13; // Infrared
			break;
		case "ultraviolet me":
		case "ultra violet me":
		case "ultra me":
		case "uv me":
		case "dark blue me":
			colour = 14; // Ultraviolet
			break;
		case "brown me":
		case "dark green me":
			colour = 15; // Brown
			break;
		default:
			return; // Some other message; do nothing
	}

	playerColour = colour;
	changePlayerColour(CAM_HUMAN_PLAYER, colour);
	adaptColors();
	playSound("beep6.ogg");
}

function adaptColors()
{
	// Make sure the other factions aren't choosing conflicting colors with the player
	changePlayerColour(CAM_THE_COLLECTIVE, (playerColour !== 2) ? 2 : 10); // Set to gray or white
	changePlayerColour(CAM_INFESTED, (playerColour !== 9) ? 9 : 4); // Infested to purple or red
	changePlayerColour(MIS_TEAM_ZULU, (playerColour !== 15) ? 15 : 0); // Zulu to brown or green
}

function eventStartLevel()
{
	// const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz

	setReinforcementTime(LZ_COMPROMISED_TIME);

	// centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setAlliance(CAM_HUMAN_PLAYER, MIS_TEAM_ZULU, true);

	playerColour = playerData[0].colour;
	adaptColors();

	camSetArtifacts({
		"colCC": { tech: "R-Wpn-Flame2" }, // Inferno
	});

	grantPlayerTech();
	camCompleteRequiredResearch(camAct3StartResearch, MIS_TEAM_ZULU);
	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);

	camSetEnemyBases({
		"colMainBase": {
			cleanup: "colBase",
			detectMsg: "COL_BASE",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colLZBase": {
			cleanup: "colLZ",
			detectMsg: "COL_LZ",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colSouthRoadblock": {
			cleanup: "colRoadblock1",
			detectMsg: "COL_ROADBLOCK1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colEastRoadblock": {
			cleanup: "colRoadblock2",
			detectMsg: "COL_ROADBLOCK2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infSouthBase": {
			cleanup: "infBase1",
			detectMsg: "INF_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infSouthEastBase": {
			cleanup: "infBase2",
			detectMsg: "INF_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infNorthEastBase": {
			cleanup: "infBase3",
			detectMsg: "INF_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	camSetFactories({
		"colFactory": {
			assembly: "colAssembly",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 35
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(135)),
			// Light and medium tanks
			templates: [ cTempl.colpodt, cTempl.commcant, cTempl.colflamt, cTempl.commrat, cTempl.colhmght ]
		},
		"colCybFactory": {
			assembly: "colCybAssembly",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			templates: [ cTempl.cybhg, cTempl.cybca, cTempl.cybca ]
		},
		"cScavFactory1": {
			assembly: "cScavAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_THE_COLLECTIVE
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			templates: [ cTempl.bjeep, cTempl.rbjeep, cTempl.kevbloke, cTempl.buscan]
		},
		"cScavFactory2": {
			assembly: "cScavAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(28)),
			templates: [ cTempl.gbjeep, cTempl.minitruck, cTempl.kevlance, cTempl.sartruck, cTempl.bjeep ]
		},
		"infFactory1": {
			assembly: "infAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(12)),
			// Infested civilians, with some occasional vehicles
			templates: [cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.infciv, cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.infbuscan]
		},
		"infFactory2": {
			assembly: "infAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(12)),
			// Infested civilians, with some occasional vehicles
			templates: [cTempl.infciv, cTempl.infrbjeep, cTempl.infciv, cTempl.inflance, cTempl.infciv, cTempl.infbjeep, cTempl.infciv]
		},
		"infFactory3": {
			assembly: "infAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			// Light Infested vehicles
			templates: [cTempl.infciv, cTempl.infrbjeep, cTempl.infciv, cTempl.infbloke, cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.infbjeep]
		},
	});

	// Set up Collective trucks...
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds(90))
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colSouthRoadblock",
		rebuildTruck: true,
		respawnDelay: ((tweakOptions.rec_timerlessMode) ? (TRUCK_TIME / 2) : TRUCK_TIME),
		rebuildBase: tweakOptions.rec_timerlessMode,
		truckDroid: getObject("colTruck1"), // TODO: Exclude scav structures here
		structset: camAreaToStructSet("colRoadblock1")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colEastRoadblock",
		rebuildTruck: true,
		respawnDelay: ((tweakOptions.rec_timerlessMode) ? (TRUCK_TIME / 2) : TRUCK_TIME),
		rebuildBase: tweakOptions.rec_timerlessMode,
		truckDroid: getObject("colTruck2"),
		structset: camAreaToStructSet("colRoadblock2")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colMainBase",
		rebuildTruck: true,
		respawnDelay: ((tweakOptions.rec_timerlessMode) ? (TRUCK_TIME / 2) : TRUCK_TIME),
		rebuildBase: tweakOptions.rec_timerlessMode,
		truckDroid: getObject("colTruck3"),
		structset: camAreaToStructSet("colBase")
	});
	if (tweakOptions.rec_timerlessMode || difficulty >= HARD)
	{
		camManageTrucks(CAM_THE_COLLECTIVE, {
			label: "colLZBase",
			rebuildTruck: true,
			respawnDelay: ((tweakOptions.rec_timerlessMode) ? (TRUCK_TIME / 2) : TRUCK_TIME),
			rebuildBase: true,
			template: cTempl.coltruckht,
			structset: camAreaToStructSet("colLZ")
		});
	}

	if (tweakOptions.rec_timerlessMode)
	{
		// // If we're in Timerless mode, set up scavenger Cranes instead of adding a timer
		// switch (difficulty)
		// {
		// 	case INSANE:
		// 		// Cranes for the easternmost orange and pink bases
		// 		camManageTrucks(MIS_ORANGE_SCAVS, {
		// 			label: "orangeNorthBase", // Label of base to rebuild/maintain
		// 			rebuildBase: true,
		// 			respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
		// 			template: cTempl.crane, // Scavenger Crane unit exclusive to Timerless mode
		// 			structset: camAreaToStructSet("orangeScavBase2")
		// 		});
		// 		camManageTrucks(MIS_PINK_SCAVS, {
		// 			label: "pinkEastBase",
		// 			rebuildBase: true,
		// 			respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
		// 			template: cTempl.crane,
		// 			structset: camAreaToStructSet("pinkScavBase3")
		// 		});
		// 	case HARD: // NOTE: Fall-through here! We still add Cranes from lower difficulties!
		// 		// Cranes for the westernmost scav bases
		// 		camManageTrucks(MIS_ORANGE_SCAVS, {
		// 			label: "orangeNWBase",
		// 			rebuildBase: true,
		// 			respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
		// 			template: cTempl.crane,
		// 			structset: camAreaToStructSet("orangeScavBase1")
		// 		});
		// 		camManageTrucks(MIS_PINK_SCAVS, {
		// 			label: "pinkWestBase",
		// 			rebuildBase: true,
		// 			respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
		// 			template: cTempl.crane,
		// 			structset: camAreaToStructSet("pinkScavBase1")
		// 		});
		// 		camManageTrucks(MIS_RED_SCAVS, {
		// 			label: "redSWBase",
		// 			rebuildBase: true,
		// 			respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
		// 			template: cTempl.crane,
		// 			structset: camAreaToStructSet("redScavBase1")
		// 		});
		// 	case MEDIUM:
		// 		// Crane for the central pink base
		// 		camManageTrucks(MIS_PINK_SCAVS, {
		// 			label: "pinkCentralBase",
		// 			rebuildBase: true,
		// 			respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
		// 			template: cTempl.crane,
		// 			structset: camAreaToStructSet("pinkScavBase2")
		// 		});
		// 	default:
		// 		// Crane for the final red base
		// 		camManageTrucks(MIS_RED_SCAVS, {
		// 			label: "redSEBase",
		// 			rebuildBase: true,
		// 			respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
		// 			template: cTempl.crane,
		// 			structset: camAreaToStructSet("redScavBase2")
		// 		});
		// }
	}
	else
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(60)));
	}

	startedFromMenu = false;

	// Only if starting Act 3 directly from the menu
	if (enumDroid(CAM_HUMAN_PLAYER, DROID_SUPERTRANSPORTER).length === 0)
	{
		startedFromMenu = true;

		// Send a transport with a commander and some high-rank droids
		const firstTransportDroids = [ // 1 Command Turret, 2 HMG Cyborgs, 4 Lancer Cyborgs, 3 HVCs
			cTempl.plmcomht,
			cTempl.cybhg, cTempl.cybhg,
			cTempl.cybla, cTempl.cybla, cTempl.cybla, cTempl.cybla,
			cTempl.plmhpvht, cTempl.plmhpvht, cTempl.plmhpvht,
		];

		camSendReinforcement(CAM_HUMAN_PLAYER, camMakePos("landingZone"), firstTransportDroids,
			CAM_REINFORCE_TRANSPORT, {
				entry: transportEntryPos,
				exit: transportEntryPos
			}
		);
		
		// Subsequent transport droids are randomly chosen from this pool
		const attackPool = [ // Misc. cyborgs and tanks
			cTempl.cybhg, cTempl.cybla, cTempl.cybfl, cTempl.scygr, cTempl.scyhc,
			cTempl.plmhpvht, cTempl.plmhmght, cTempl.plmatht, cTempl.plmbbht, cTempl.plmpodht,
		]

		const artPool = [ // Bombards and MRAs
			cTempl.plmhmortw, cTempl.plmmraht,
		]

		const vtolPool = [ // Misc. VTOLs
			cTempl.pllbombv, cTempl.pllhmgv, cTempl.plllanv,
		];

		// Store units "offworld", so that the player can bring them in via transport.
		// The chosen units are distributed (roughly) as: 1/2 "attack" units, 1/4 artillery, 1/4 VTOLs
		// Since the player started from the menu, the number of units to store 
		// (AKA, the ones "safely evacuated" from the previous level) is based on difficulty (MIS_NUM_TRANSPORTS).
		const NUM_DROIDS = (MIS_NUM_TRANSPORTS - 1) * 10; // "- 1" because of the starting transport
		let numAttackDroids = (NUM_DROIDS / 2) + NUM_DROIDS % 4;
		let numArtilleryDroids = Math.floor(NUM_DROIDS / 4);
		let numVtolDroids = Math.floor(NUM_DROIDS / 4);
		for (let i = 0; i < NUM_DROIDS; i++)
		{
			const choice = [];
			let template;
			if (numAttackDroids > 0) choice.push("attack");
			if (numArtilleryDroids > 0) choice.push("artillery");
			if (numVtolDroids > 0) choice.push("vtol");
			switch (choice[camRand(choice.length)])
			{
				case "attack":
				{
					// Choose a random attack template
					template = attackPool[camRand(attackPool.length)];
					break;
				}
				case "artillery":
				{
					// Choose a random artillery template
					template = artPool[camRand(artPool.length)];
					break;
				}
				case "vtol":
				{
					// Choose a random vtol template
					template = vtolPool[camRand(vtolPool.length)];
					break;
				}
			}

			// Create the droid
			addDroid(CAM_HUMAN_PLAYER, -1, -1, 
				camNameTemplate(template), template.body, template.prop, "", "", template.weap);
			// NOTE: We can't give the offworld droid XP here, since the scripting API can't find it.
			// Instead, we'll grant XP when the transport drops it off.
		}

		setPower(MIS_NUM_TRANSPORTS * 1000, CAM_HUMAN_PLAYER);		
	}
	else
	{
		// Grant 100 power for every droid the player saved from the last campaign
		let numDroids = enumDroid(CAM_HUMAN_PLAYER).length - 1; // Don't count the transporter itself
		// Also include the cargo of the first transport
		numDroids += enumDroid(CAM_HUMAN_PLAYER, DROID_SUPERTRANSPORTER)[0].cargoCount - 1; // Cargo count seems to always have at least 1?
		setPower(numDroids * 100, CAM_HUMAN_PLAYER);
	}
	setReinforcementTime(camMinutesToSeconds(1)); // 1 minute

	firstTransport = true;
	allowExtraWaves = false;

	camAutoReplaceObjectLabel(["colCC", "heliTower"]);
	camEnableFactory("cScavFactory1");
	camEnableFactory("cScavFactory2");

	queue("activateFirstFactories", camChangeOnDiff(camMinutesToMilliseconds(2)));
	queue("heliAttack", camChangeOnDiff(camMinutesToMilliseconds(5)));
	queue("activateSecondFactories", camChangeOnDiff(camMinutesToMilliseconds(6)));
	queue("startCollectiveTransports", camChangeOnDiff(camMinutesToMilliseconds(10)));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(14)));
	sendInfestedReinforcements();
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(45)));
	if (!startedFromMenu)
	{
		// Prevent the player from bringing recycled unit EXP from Act 2
		drainPlayerExp();
	}

	// Placeholder for the actual briefing sequence
	// camQueueDialogue([
	// 	{text: "---- BRIEFING PLACEHOLDER ----", delay: 0},
	// 	{text: "LIEUTENANT: Sir, Team Bravo has evacuated with all that they could. They're awaiting further orders.", delay: 2, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: Well done, Commander Bravo.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: If we're to salvage this operation, we'll need as many able-bodied men as possible.", delay: 2, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: Commander Charlie, report your situation.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CHARLIE: We're holed up alright sir.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CHARLIE: But we've spotted Collective forces to the north of our position.", delay: 2, sound: CAM_RCLICK},
	// 	{text: "CHARLIE: They've been busy setting up some defenses.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CHARLIE: There's also been lot of fighting between the local scavengers.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CHARLIE: It looks like some of the scavengers are working with the Collective.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: I don't have a hard time believing that.", delay: 4, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: Lieutenant, keep parsing through the Collective's transmissions.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: Find out why these scavengers are working along with the Collective.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "LIEUTENANT: On it, sir.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: Commander Bravo, take your forces and assume command of Charlie's base.", delay: 2, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: Team Charlie will reposition to a new location.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: Secure the area, and hold for further instructions once the base site is secure.", delay: 3, sound: CAM_RCLICK},
	// ]);

	// Get the camera to follow the transporter
	// Transporter is the only droid of the player's on the map at this point
	const transporter = enumDroid();
	cameraTrack(transporter[0]);

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	camManageGroup(camMakeGroup("infIntroGroup"), CAM_ORDER_ATTACK, {targetPlayer: CAM_THE_COLLECTIVE});

	// Lighten the fog to *more or less* 2x default brightness with a slight pink color
	camSetFog(48, 32, 96);
	// Add a purple-blue tint
	camSetSunIntensity(.5, .45, .55);
}