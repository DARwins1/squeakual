include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const MIS_NUM_TRANSPORTS = (difficulty < HARD) ? 4 : (difficulty < INSANE) ? 3 : 2; // Good enough for now...
const MIS_TEAM_CHARLIE = 1;
const MIS_CYAN_SCAVS = 5;
const transportEntryPos = { x: 96, y: 122 };
const colTransportEntryPos = { x: 124, y: 90 };

var transporterIndex; //Number of transport loads sent into the level
var startedFromMenu;
var playerColour;
var colLZBlip;

const mis_scavResearch = [
	"R-Wpn-MG-Damage03", "R-Wpn-Rocket-Damage02", "R-Wpn-Mortar-Damage02", 
	"R-Wpn-Flamer-Damage02", "R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01",
	"R-Wpn-Rocket-ROF01", "R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF01",
	"R-Wpn-Cannon-ROF01", "R-Vehicle-Metals02", "R-Struc-Materials02", 
	"R-Defense-WallUpgrade02", "R-Sys-Engineering01",
];
const mis_collectiveResearch = [
	"R-Wpn-MG-Damage03", "R-Wpn-Rocket-Damage02", "R-Wpn-Mortar-Damage02", 
	"R-Wpn-Flamer-Damage02", "R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF01",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals02", "R-Struc-Materials02", 
	"R-Defense-WallUpgrade02", "R-Sys-Engineering01", "R-Vehicle-Engine01",
	"R-Cyborg-Metals02",
];

camAreaEvent("vtolRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("vtolRemoveZone", CAM_THE_COLLECTIVE);
});

// Extra transport units are only awarded to those who start from the menu.
// Otherwise a player can just bring in units from the Prologue.
function sendPlayerTransporter()
{
	if (!camDef(transporterIndex))
	{
		transporterIndex = 0;
	}

	if (transporterIndex >= MIS_NUM_TRANSPORTS)
	{
		removeTimer("sendPlayerTransporter");
		return;
	}

	// First transport is always the same
	const firstTransportDroids = [ // 1 Command Turret, 2 HMG Cyborgs, 4 Lancer Cyborgs, 3 Light Cannons
		cTempl.pllcomht,
		cTempl.cybhg, cTempl.cybhg,
		cTempl.cybla, cTempl.cybla, cTempl.cybla, cTempl.cybla,
		cTempl.pllcanht, cTempl.pllcanht, cTempl.pllcanht,
	];
	
	// Subsequent transport droids are randomly chosen from this pool
	const droidPool = [
		cTempl.cybhg, cTempl.cybla, cTempl.cybfl, cTempl.cybgr, cTempl.cybca,
		cTempl.pllcanht, cTempl.pllhmght, cTempl.plllant, cTempl.pllmrat, cTempl.pllmortw, cTempl.pllpodt,
		cTempl.pllcanv, cTempl.pllpodv, cTempl.pllhmgv, cTempl.plllanv,
	];

	const droids = (transporterIndex === 0) ? firstTransportDroids : [];
	if (transporterIndex > 0)
	{
		for (let i = 0; i < 10; i++)
		{
			droids.push(droidPool[camRand(droidPool.length)]);
		}
	}

	camSendReinforcement(CAM_HUMAN_PLAYER, camMakePos("landingZone"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: transportEntryPos,
			exit: transportEntryPos
		}
	);
}

function heliAttack1()
{
	const ext = {
		limit: 1
	};
	camSetVtolData(MIS_CYAN_SCAVS, "heliAttackPos1", "vtolRemoveZone", [cTempl.helpod], camChangeOnDiff(camMinutesToMilliseconds(1.5)), "scavHeliTower", ext);
}

function heliAttack2()
{
	// Focus towards the player's LZ
	const ext = {
		limit: 1,
		targetPlayer: CAM_HUMAN_PLAYER,
		pos: camMakePos("landingZone")
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "heliAttackPos2", "vtolRemoveZone", [cTempl.helcan, cTempl.helhmg], camChangeOnDiff(camSecondsToMilliseconds(45)), "cScavHeliTower", ext);
}

function vtolAttack()
{
	// Focus towards the player's LZ
	const templates = [cTempl.colatv, cTempl.colhmgv]; // Lancers and HMGs
	const ext = {
		limit: ((difficulty <= EASY) ? [1, 2] : [2, 3]),
		alternate: true,
		targetPlayer: CAM_HUMAN_PLAYER,
		pos: camMakePos("landingZone"),
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), "colCC", ext);
}

// Start patrol groups
function groupPatrol()
{
	camManageGroup(camMakeGroup("scavPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos4"),
			camMakePos("scavAssembly1"),
			camMakePos("scavAssembly2")
		],
		interval: camSecondsToMilliseconds(15)
	});

	camManageGroup(camMakeGroup("cScavPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos5"),
			camMakePos("patrolPos6")
		],
		interval: camSecondsToMilliseconds(14)
	});

	camManageGroup(camMakeGroup("colPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos1"),
			camMakePos("patrolPos2"),
			camMakePos("patrolPos3")
		],
		interval: camSecondsToMilliseconds(20)
	});
}

//Gives starting tech and research.
function grantPlayerTech()
{
	for (let x = 0, l = camBasicStructs.length; x < l; ++x)
	{
		enableStructure(camBasicStructs[x], CAM_HUMAN_PLAYER);
	}

	camCompleteRequiredResearch(camAct2StartResearch, CAM_HUMAN_PLAYER);
}

// Get some higher rank droids.
function setUnitRank(transport)
{
	const droidExp = [64, 32, 16, 8, 4];
	let droids;

	if (transporterIndex >= droidExp.length)
	{
		return;
	}

	if (transport)
	{
		droids = enumCargo(transport);
	}

	for (let i = 0, len = droids.length; i < len; ++i)
	{
		const droid = droids[i];
		if (droid.droidType !== DROID_CONSTRUCT && droid.droidType !== DROID_REPAIR)
		{
			setDroidExperience(droid, droidExp[(transporterIndex - 1)]);
		}
	}
}

// Bump the rank of the first batch of transport droids (if starting from the menu).
function eventTransporterLanded(transport)
{
	if (transport.player === CAM_HUMAN_PLAYER)
	{
		if (!camDef(transporterIndex))
		{
			transporterIndex = 0;
		}

		if (transporterIndex == 0)
		{			
			// Transfer all Charlie units/structures to the player
			const objs = enumDroid(MIS_TEAM_CHARLIE).concat(enumStruct(MIS_TEAM_CHARLIE));
			for (const obj of objs)
			{
				donateObject(obj, CAM_HUMAN_PLAYER);
			}

			camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "A2L2S");
		}

		transporterIndex += 1;

		if (startedFromMenu)
		{
			setUnitRank(transport);
		}
	}
}

// Attack the player with Collective Cyborgs
function cyborgAttack()
{
	// Orange group that attacks the LZ
	camManageGroup(camMakeGroup("colCyborgAttackGroup"), CAM_ORDER_ATTACK, {
		pos: camMakePos("landingZone"),
		repair: 40
	});
}

function activateSecondFactories()
{
	camEnableFactory("colFactory1");
	camEnableFactory("scavFactory2");
}

function activateFinalFactories()
{
	camEnableFactory("colFactory2");
	camEnableFactory("cScavFactory3");
}

function startCollectiveTransports()
{
	sendCollectiveTransporter();
	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(5)));
}

function sendCollectiveTransporter() 
{
	// First, check if the LZ is still alive
	if (!collectiveLZBuilt())
	{
		// Try again next time...
		return;
	}

	// If the LZ is alive, but the blip is missing, place it
	if (!colLZBlip)
	{
		hackAddMessage("COL_LZ", PROX_MSG, CAM_HUMAN_PLAYER);
		colLZBlip = true;
	}

	// Next, add grab some cyborgs for the transport
	const TRANSPORT_SIZE = ((difficulty <= MEDIUM) ? 6 : ((difficulty === HARD) ? 8 : 10));
	const cyborgPool = [
		cTempl.cybca
	];
	if (difficulty <= EASY) cyborgPool.push(cTempl.cybmg);
	if (difficulty >= MEDIUM) cyborgPool.push(cTempl.cybhg);
	if (difficulty >= MEDIUM) cyborgPool.push(cTempl.cybgr);
	if (difficulty >= HARD) cyborgPool.push(cTempl.cybla);

	const droids = [];
	for (let i = 0; i < TRANSPORT_SIZE; i++)
	{
		droids.push(cyborgPool[camRand(cyborgPool.length)]);
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

// Returns true if there is at least 1 non-wall-type structure around the LZ
// We have to use this system instead of just making a base because this LZ is inside a larger base
function collectiveLZBuilt()
{
	return enumArea("colLZStructs", CAM_THE_COLLECTIVE, false).filter((obj) => (obj.type === STRUCTURE && obj.stattype !== WALL)).length > 0;
}

// Play dialogue about Collective Cyborgs when they're first encountered by the player
function eventAttacked(victim, attacker) 
{
	if (!camDef(victim) || !camDef(attacker))
	{
		return;
	}

	if (victim.player == CAM_THE_COLLECTIVE && attacker.player == CAM_HUMAN_PLAYER
		&& victim.type == DROID && victim.droidType == DROID_CYBORG)
	{
		camCallOnce("cyborgDialogue");
	}
}

function eventDestroyed(obj) 
{
	if (obj.type === STRUCTURE && obj.player === CAM_THE_COLLECTIVE && !collectiveLZBuilt() && colLZBlip)
	{
		// "Eradicate" the Collective LZ
		hackRemoveMessage("COL_LZ", PROX_MSG, CAM_HUMAN_PLAYER);
		colLZBlip = false;
		playSound(cam_sounds.baseElimination.enemyBaseEradicated);
	}
}

function cyborgDialogue()
{
	// Dialogue Collective Cyborgs...
	camQueueDialogue([
		{text: "CLAYDE: omg cyborgs !!1!", delay: camSecondsToMilliseconds(3), sound: CAM_RADIO_CLICK}
	]);
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
	// Make sure the scavengers aren't choosing conflicting colors with the player
	changePlayerColour(CAM_THE_COLLECTIVE, (playerColour !== 2) ? 2 : 10); // Set to gray or white
	changePlayerColour(MIS_TEAM_CHARLIE, (playerColour !== 5) ? 5 : 11); // Charlie to blue or bright blue
	changePlayerColour(MIS_CYAN_SCAVS, (playerColour !== 7) ? 7 : 0); // Set to cyan or green
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz

	setReinforcementTime(LZ_COMPROMISED_TIME);

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setAlliance(CAM_HUMAN_PLAYER, MIS_TEAM_CHARLIE, true);

	playerColour = playerData[0].colour;
	adaptColors();

	camSetArtifacts({
		"colCC": { tech: "R-Defense-WallUpgrade03" }, // Improved Hardcrete Mk3
		"colFactory2": { tech: "R-Struc-Factory-Module" }, // Factory Module
		"colResearch": { tech: "R-Wpn-Cannon2Mk1" }, // Medium Cannon
		"colAAEmp": { tech: "R-Wpn-AAGun-Damage01" }, // AA HE Flak
	});

	grantPlayerTech();
	camCompleteRequiredResearch(camAct2StartResearch, MIS_TEAM_CHARLIE);
	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_scavResearch, MIS_CYAN_SCAVS);

	camSetEnemyBases({
		"colNWBase": {
			cleanup: "colBase1",
			detectMsg: "COL_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colCraterBase": {
			cleanup: "colBase2",
			detectMsg: "COL_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colNEBase": {
			cleanup: "colBase3",
			detectMsg: "COL_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"cScavWestIsland": {
			cleanup: "cScavBase1",
			detectMsg: "CSCAV_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"cScavIslandOutpost": {
			cleanup: "cScavBase2",
			detectMsg: "CSCAV_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated,
		},
		"cScavEastBase": {
			cleanup: "cScavBase3",
			detectMsg: "CSCAV_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"cScavNEBase": {
			cleanup: "cScavBase4",
			detectMsg: "CSCAV_BASE4",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"scavSWBase": {
			cleanup: "scavBase",
			detectMsg: "CYAN_SCAV_BASE",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
	});

	camSetFactories({
		"colFactory1": {
			assembly: "colAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 35
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			templates: [ cTempl.colpodt, cTempl.colhmght, cTempl.colmrat, cTempl.colflamt, cTempl.colcanht ]
		},
		"colFactory2": {
			assembly: "colAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(110)),
			// Collective medium tanks (mostly)
			templates: [ cTempl.commcant, cTempl.colaaht, cTempl.comatt, cTempl.commcant ]
		},
		"scavFactory1": {
			assembly: "scavAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_THE_COLLECTIVE
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			templates: [ cTempl.bjeep, cTempl.rbjeep, cTempl.bloke, cTempl.buscan]
		},
		"scavFactory2": {
			assembly: "scavAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(28)),
			templates: [ cTempl.gbjeep, cTempl.minitruck, cTempl.lance, cTempl.sartruck, cTempl.bjeep ]
		},
		"cScavFactory1": {
			assembly: "cScavAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			templates: [ cTempl.bloke, cTempl.lance, cTempl.trike, cTempl.rbuggy ]
		},
		"cScavFactory2": {
			assembly: "cScavAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(28)),
			templates: [ cTempl.moncan, cTempl.bloke, cTempl.lance, cTempl.bloke, cTempl.bloke, cTempl.bloke ]
		},
		"cScavFactory3": {
			assembly: "cScavAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(48)),
			templates: [ cTempl.monhmg, cTempl.rbjeep, cTempl.gbjeep, cTempl.flatmrl, cTempl.buscan, cTempl.minitruck ]
		},
	});

	// Set up Collective trucks...
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds(70))
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colNWBase",
		rebuildTruck: (tweakOptions.rec_timerlessMode || difficulty >= MEDIUM), // Don't rebuild this truck unless we're on timerless mode (or on Normal+)
		respawnDelay: ((tweakOptions.rec_timerlessMode) ? (TRUCK_TIME / 2) : TRUCK_TIME),
		rebuildBase: tweakOptions.rec_timerlessMode,
		template: cTempl.coltruckht,
		structset: camAreaToStructSet("colBase1")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colNEBase",
		rebuildTruck: (tweakOptions.rec_timerlessMode || difficulty >= MEDIUM), // Don't rebuild this truck unless we're on timerless mode (or on Normal+)
		respawnDelay: ((tweakOptions.rec_timerlessMode) ? (TRUCK_TIME / 2) : TRUCK_TIME),
		rebuildBase: tweakOptions.rec_timerlessMode,
		template: cTempl.coltruckht,
		structset: camAreaToStructSet("colBase3")
	});
	if (tweakOptions.rec_timerlessMode || difficulty >= HARD)
	{
		camManageTrucks(CAM_THE_COLLECTIVE, {
			label: "colCraterBase",
			rebuildTruck: (tweakOptions.rec_timerlessMode || difficulty === INSANE), // Don't rebuild this truck unless we're on timerless mode (or on Insane)
			respawnDelay: ((tweakOptions.rec_timerlessMode) ? (TRUCK_TIME / 2) : TRUCK_TIME),
			rebuildBase: tweakOptions.rec_timerlessMode,
			template: cTempl.coltruckht,
			structset: camAreaToStructSet("colBase2")
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
		setMissionTime(camChangeOnDiff(camHoursToSeconds(1.25)));
	}

	startedFromMenu = false;

	// Only if starting Act 2 directly from the menu
	if (enumDroid(CAM_HUMAN_PLAYER, DROID_SUPERTRANSPORTER).length === 0)
	{
		startedFromMenu = true;
		sendPlayerTransporter();
		setTimer("sendPlayerTransporter", camMinutesToMilliseconds(2));
		setPower(MIS_NUM_TRANSPORTS * 1000, CAM_HUMAN_PLAYER);
	}
	else
	{
		setReinforcementTime(camMinutesToSeconds(2)); // 1 minute
	}

	colLZBlip = false;

	camAutoReplaceObjectLabel("scavHeliTower");
	camAutoReplaceObjectLabel("cScavHeliTower");
	camEnableFactory("scavFactory1");
	camEnableFactory("cScavFactory1");
	camEnableFactory("cScavFactory2");

	queue("groupPatrol", camChangeOnDiff(camMinutesToMilliseconds(0.5)));
	queue("activateSecondFactories", camChangeOnDiff(camMinutesToMilliseconds(2)));
	queue("cyborgAttack", camChangeOnDiff(camMinutesToMilliseconds(3)));
	queue("heliAttack1", camChangeOnDiff(camMinutesToMilliseconds(4)));
	queue("heliAttack2", camChangeOnDiff(camMinutesToMilliseconds(6)));
	queue("activateFinalFactories", camChangeOnDiff(camMinutesToMilliseconds(6)));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(8)));
	queue("startCollectiveTransports", camChangeOnDiff(camMinutesToMilliseconds(12)));
}