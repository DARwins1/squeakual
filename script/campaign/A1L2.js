include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");

const MIS_NASDA = 1;
const MIS_CLAYDE = 5;
const MIS_YELLOW_SCAVS = 6;
const MIS_TEAM_CHARLIE = 7;
const MIS_TEAM_FOXTROT = 8;
const MIS_TEAM_GOLF = 9;
const transportEntryPos = { x: 62, y: 52 };
const transportEntryPosCharlie = { x: 20, y: 78 };
const transportEntryPosFoxtrot = { x: 2, y: 70 };
const transportEntryPosGolf = { x: 62, y: 20 };

const mis_scavResearch = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02", "R-Wpn-Mortar-Damage01", 
	"R-Wpn-Flamer-Damage02", "R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals02", "R-Struc-Materials02", 
	"R-Defense-WallUpgrade02",
];

var powerCaptured;
var uplinkCaptured;
var vtolCaptured;
var ambushTriggered;
var charlieLZSecure;
var foxtrotLZSecure;
var golfLZSecure;
// Refillable Groups...
var charlieSlowAttackGroup;
var charlieFastAttackGroup;
var charlieRepairGroup;
var foxtrotAttackGroup;
var foxtrotRepairGroup;
var golfAttackGroup;
var golfRepairGroup;
var charlieTruckJob1;
var charlieTruckJob2;
var foxtrotTruckJob1;
var foxtrotTruckJob2;
var golfTruckJob;

// The chances of a helicopter actually using this is incredibly low
// but we should still have this
camAreaEvent("heliRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("heliRemoveZone", MIS_YELLOW_SCAVS);
});

camAreaEvent("powerCaptureZone", function(droid)
{
	// Only the player's units can capture NASDA components
	if (droid.player == CAM_HUMAN_PLAYER && enumArea("powerCaptureZone", MIS_YELLOW_SCAVS, false).length == 0)
	{
		// No enemies left, and a player unit is here! Capture this component
		for (const object of enumArea("powerCaptureZone", MIS_NASDA, false))
		{
			donateObject(object, MIS_CLAYDE);
		}
		powerCaptured = true;
		// Also grant the Power Module
		enableResearch("R-Struc-PowerModuleMk1", CAM_HUMAN_PLAYER);
	}
	else
	{
		resetLabel("powerCaptureZone", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("uplinkCaptureZone", function(droid)
{
	if (droid.player == CAM_HUMAN_PLAYER && enumArea("uplinkCaptureZone", MIS_YELLOW_SCAVS, false).length == 0)
	{
		for (const object of enumArea("uplinkCaptureZone", MIS_NASDA, false))
		{
			donateObject(object, MIS_CLAYDE);
		}
		uplinkCaptured = true;
	}
	else
	{
		resetLabel("uplinkCaptureZone", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("vtolFactoryCaptureZone", function(droid)
{
	if (droid.player == CAM_HUMAN_PLAYER && enumArea("vtolFactoryCaptureZone", MIS_YELLOW_SCAVS, false).length == 0)
	{
		for (const object of enumArea("vtolFactoryCaptureZone", MIS_NASDA, false))
		{
			donateObject(object, MIS_CLAYDE);
		}
		vtolCaptured = true;
		// Also grant VTOL Propulsion
		enableResearch("R-Vehicle-Prop-VTOL", CAM_HUMAN_PLAYER);
	}
	else
	{
		resetLabel("vtolFactoryCaptureZone", CAM_HUMAN_PLAYER);
	}
});

function heliAttack1()
{
	// Attack anything
	const ext = {
		limit: [1, 1],
		alternate: true,
		repair: 30
	};
	camSetVtolData(MIS_YELLOW_SCAVS, "heliAttackPos", "heliRemoveZone", [cTempl.helcan, cTempl.helhmg], camChangeOnDiff(camMinutesToMilliseconds(2)), "heliTower1", ext);
}

function heliAttack2()
{
	// Focus towards the player's LZ
	const ext = {
		limit: 1,
		targetPlayer: CAM_HUMAN_PLAYER,
		pos: camMakePos("landingZone"),
		repair: 40
	};
	camSetVtolData(MIS_YELLOW_SCAVS, "heliAttackPos", "heliRemoveZone", [cTempl.helpod], camChangeOnDiff(camMinutesToMilliseconds(2.5)), "heliTower2", ext);
}

// Start moving scavenger patrol groups
function groupPatrol()
{
	camManageGroup(camMakeGroup("scavPatrolGroup1"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("scavPatrolPos5"),
			camMakePos("scavPatrolPos6")
		],
		interval: camSecondsToMilliseconds(18)
	});

	camManageGroup(camMakeGroup("scavPatrolGroup2"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("scavPatrolPos7"),
			camMakePos("scavPatrolPos8"),
			camMakePos("scavPatrolPos9")
		],
		interval: camSecondsToMilliseconds(35)
	});

	camManageGroup(camMakeGroup("scavPatrolGroup3"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("scavPatrolPos10"),
			camMakePos("scavPatrolPos11")
		],
		interval: camSecondsToMilliseconds(20)
	});
}

// Send a squad to the player's LZ
function ambushLZ()
{
	if (ambushTriggered)
	{
		return
	}

	camManageGroup(camMakeGroup("scavAmbushGroup"), CAM_ORDER_ATTACK, {
		pos: camMakePos("landingZone"),
		morale: 40,
		fallback: camMakePos("landingZoneCharlie")
	});
	ambushTriggered = true;
}

function enableFirstFactories()
{
	camEnableFactory("scavOuterFactory1");
	camEnableFactory("scavOuterFactory4");
}

function enableSecondFactories()
{
	camEnableFactory("scavOuterFactory2");
	camEnableFactory("scavOuterFactory3");
}

function enableThirdFactories()
{
	camEnableFactory("scavInnerFactory1");
	camEnableFactory("scavOuterFactory5");
}

function enableFinalFactories()
{
	camEnableFactory("scavInnerFactory2");
	camEnableFactory("scavInnerFactory3");
}

function sendCharlieTransporter()
{
	// Make a list of droids to bring in in order of importance
	// For team Charlie, this is:
	// Trucks -> Repair -> Slow Attack -> Fast Attack
	let droidQueue = [];

	if (!camDef(camGetTruck(charlieTruckJob1))) droidQueue.push(cTempl.truck);
	if (!camDef(camGetTruck(charlieTruckJob2))) droidQueue.push(cTempl.truck);

	droidQueue = droidQueue.concat(camGetRefillableGroupTemplates([charlieRepairGroup, charlieSlowAttackGroup, charlieFastAttackGroup]));

	const droids = [];
	// Get (up to) the first 10 units in the queue
	for (let i = 0; i < Math.min(droidQueue.length, 10); i++)
	{
		droids.push(droidQueue[i]);
	}

	// Don't send an empty transport!
	if (droids.length > 0)
	{
		camSendReinforcement(MIS_TEAM_CHARLIE, camMakePos("landingZoneCharlie"), droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: transportEntryPosCharlie,
				exit: transportEntryPosCharlie
			}
		);
	}
}

function sendFoxtrotTransporter()
{
	// Make a list of droids to bring in in order of importance
	// For team Foxtrot, this is:
	// Trucks -> Repair -> Attack
	let droidQueue = [];

	if (!camDef(camGetTruck(foxtrotTruckJob1))) droidQueue.push(cTempl.cyben);
	if (!camDef(camGetTruck(foxtrotTruckJob2))) droidQueue.push(cTempl.cyben);

	droidQueue = droidQueue.concat(camGetRefillableGroupTemplates([foxtrotRepairGroup, foxtrotAttackGroup]));

	const droids = [];
	// Get (up to) the first 10 units in the queue
	for (let i = 0; i < Math.min(droidQueue.length, 10); i++)
	{
		droids.push(droidQueue[i]);
	}

	// Don't send an empty transport!
	if (droids.length > 0)
	{
		camSendReinforcement(MIS_TEAM_FOXTROT, camMakePos("landingZoneFoxtrot"), droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: transportEntryPosFoxtrot,
				exit: transportEntryPosFoxtrot
			}
		);
	}
}

function sendGolfTransporter()
{
	// Make a list of droids to bring in in order of importance
	// For team Golf, this is:
	// Trucks -> Repair -> Attack
	let droidQueue = [];

	if (!camDef(camGetTruck(foxtrotTruckJob1))) droidQueue.push(cTempl.plltruckt);

	droidQueue = droidQueue.concat(camGetRefillableGroupTemplates([golfRepairGroup, golfAttackGroup]));

	const droids = [];
	// Get (up to) the first 10 units in the queue
	for (let i = 0; i < Math.min(droidQueue.length, 10); i++)
	{
		droids.push(droidQueue[i]);
	}

	// Don't send an empty transport!
	if (droids.length > 0)
	{
		camSendReinforcement(MIS_TEAM_GOLF, camMakePos("landingZoneGolf"), droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: transportEntryPosGolf,
				exit: transportEntryPosGolf
			}
		);
	}
}

// Assign allied reinforcements
function eventTransporterLanded(transport)
{
	if (transport.player == CAM_HUMAN_PLAYER)
	{
		return; // don't care
	}

	const transDroids = camGetTransporterDroids(transport.player);
	var truckJobs;
	var other = [];
	switch (transport.player)
	{
		case MIS_TEAM_CHARLIE:
		{
			truckJobs = [charlieTruckJob1, charlieTruckJob2];
			otherGroups = [charlieRepairGroup, charlieSlowAttackGroup, charlieFastAttackGroup];
			break;
		}
		case MIS_TEAM_FOXTROT:
		{
			truckJobs = [foxtrotTruckJob1, foxtrotTruckJob2];
			otherGroups = [foxtrotRepairGroup, foxtrotAttackGroup];
			break;
		}
		case MIS_TEAM_GOLF:
		{
			truckJobs = [golfTruckJob];
			otherGroups = [golfRepairGroup, golfAttackGroup];
			break;
		}
		default:
		{
			// Scav transport??? How did we get here?
			return;
		}
	}

	const transTrucks = transDroids.filter((droid) => (droid.droidType == DROID_CONSTRUCT));
	const transOther = transDroids.filter((droid) => (droid.droidType != DROID_CONSTRUCT));

	// Assign any trucks/engineers
	let truckIndex = 0;
	for (const job in truckJobs)
	{
		// Check if we have an open job and an available truck
		if (!camDef(camGetTruck(job)) && camDef(transTrucks[truckIndex]))
		{
			// Assign this truck!
			camAssignTruck(transTrucks[truckIndex], job);
			truckIndex++;
		}
	}

	// Assign other units to their refillable groups
	camAssignToRefillableGroups(transOther, otherGroups);
}

// Trigger the ambush early if the player attacks
function eventAttacked(victim, attacker) 
{
	if (!camDef(victim) || !camDef(attacker))
	{
		return;
	}

	if (victim.player == CAM_HUMAN_PLAYER || attacker.player == CAM_HUMAN_PLAYER)
	{
		camCallOnce("ambushLZ");
	}
}

// Allow allies to start bringing reinforcements
function camEnemyBaseEliminated_charlieLZBase()
{
	// NOTE: For the simplicity's sake, allied LZ's cannot be compromised or permanently destroyed on this mission.
	sendCharlieTransporter();
	setTimer("sendCharlieTransporter", camMinutesToMilliseconds(2.5));
	charlieLZSecure = true;
	updateExtraObjectiveMessage();
	hackRemoveMessage("CHARLIE_LZ", PROX_MSG, CAM_HUMAN_PLAYER);
}

function camEnemyBaseEliminated_foxtrotLZBase()
{
	sendFoxtrotTransporter();
	setTimer("sendFoxtrotTransporter", camMinutesToMilliseconds(2.5));
	foxtrotLZSecure = true;
	updateExtraObjectiveMessage();
	hackRemoveMessage("FOXTROT_LZ", PROX_MSG, CAM_HUMAN_PLAYER);
}

function camEnemyBaseEliminated_golfLZBase()
{
	sendGolfTransporter();
	setTimer("sendGolfTransporter", camMinutesToMilliseconds(2.5));
	golfLZSecure = true;
	updateExtraObjectiveMessage();
	hackRemoveMessage("GOLF_LZ", PROX_MSG, CAM_HUMAN_PLAYER);
}

function updateExtraObjectiveMessage()
{
	const message = ["Capture NASDA Central"];
	if (!charlieLZSecure) message.push("Secure team Charlie's LZ");
	if (!foxtrotLZSecure) message.push("Secure team Foxtrot's LZ");
	if (!golfLZSecure) message.push("Secure team Golf's LZ");
	camSetExtraObjectiveMessage(message);
}

// Pre-damage all NASDA stuff
function preDamageStuff()
{
	// Damage NASDA components
	let structs = enumStruct(MIS_NASDA);
	for (const struct of structs)
	{
		setHealth(struct, 50 + camRand(25));
	}

	// Damage NASDA defenses
	let defenses = enumStruct(MIS_YELLOW_SCAVS).filter((struct) => (
		struct.name == _("Rusty Medium Cannon Hardpoint") ||
		struct.name == _("Rusty Heavy Machinegun Tower") ||
		struct.name == _("Rusty Mini-Rocket Tower") ||
		struct.name == _("Old Hardcrete Wall") ||
		struct.name == _("Old Hardcrete Corner Wall") ||
		struct.name == _("Old Heavy Machinegun Bunker") ||
		struct.name == _("VTOL Rearming Pad")
	));
	for (const struct of defenses)
	{
		setHealth(struct, camChangeOnDiff(60, true) + camRand(20));
	}
}

// Returns true if all NASDA components are captured
function nasdaCaptured()
{
	if (powerCaptured && uplinkCaptured && vtolCaptured) return true;
	return undefined;
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A1L3", {
		area: "compromiseZone",
		reinforcements: camMinutesToSeconds(2.5),
		callback: "nasdaCaptured",
		annihilate: true
	});

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);

	// Make sure the scavengers/allies aren't choosing conflicting colors with the player
	const PLAYER_COLOR = playerData[0].colour;
	changePlayerColour(MIS_NASDA, 10); // NASDA is white in all cases
	changePlayerColour(MIS_CLAYDE, (PLAYER_COLOR !== 15) ? 15 : 0); // Clayde to brown or green
	changePlayerColour(MIS_YELLOW_SCAVS, (PLAYER_COLOR !== 8) ? 8 : 1); // Scavs to yellow or orange
	changePlayerColour(MIS_TEAM_CHARLIE, (PLAYER_COLOR !== 5) ? 5 : 11); // Charlie to blue or bright blue
	changePlayerColour(MIS_TEAM_FOXTROT, (PLAYER_COLOR !== 4) ? 4 : 13); // Foxtrot to red or infrared
	changePlayerColour(MIS_TEAM_GOLF, (PLAYER_COLOR !== 7) ? 7 : 0); // Golf to cyan or green

	camCompleteRequiredResearch(mis_scavResearch, MIS_YELLOW_SCAVS);
	camCompleteRequiredResearch(camA1L2AllyResearch, MIS_TEAM_CHARLIE);
	camCompleteRequiredResearch(camA1L2AllyResearch, MIS_TEAM_FOXTROT);
	camCompleteRequiredResearch(camA1L2AllyResearch, MIS_TEAM_GOLF);

	// Wow there's a lot of these...
	setAlliance(MIS_NASDA, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_NASDA, MIS_YELLOW_SCAVS, true);
	setAlliance(MIS_NASDA, MIS_TEAM_CHARLIE, true);
	setAlliance(MIS_NASDA, MIS_TEAM_FOXTROT, true);
	setAlliance(MIS_NASDA, MIS_TEAM_GOLF, true);
	setAlliance(MIS_CLAYDE, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_CLAYDE, MIS_YELLOW_SCAVS, true);
	setAlliance(MIS_CLAYDE, MIS_TEAM_CHARLIE, true);
	setAlliance(MIS_CLAYDE, MIS_TEAM_FOXTROT, true);
	setAlliance(MIS_CLAYDE, MIS_TEAM_GOLF, true);
	setAlliance(CAM_HUMAN_PLAYER, MIS_TEAM_CHARLIE, true);
	setAlliance(CAM_HUMAN_PLAYER, MIS_TEAM_FOXTROT, true);
	setAlliance(CAM_HUMAN_PLAYER, MIS_TEAM_GOLF, true);
	setAlliance(MIS_TEAM_CHARLIE, MIS_TEAM_FOXTROT, true);
	setAlliance(MIS_TEAM_CHARLIE, MIS_TEAM_GOLF, true);
	setAlliance(MIS_TEAM_FOXTROT, MIS_TEAM_GOLF, true);

	// TODO: Do we need artifacts?

	camSetEnemyBases({
		"charlieLZBase": {
			cleanup: "scavLZBase1",
			detectMsg: "SCAV_LZBASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
			// We need to designate a player here because allies will eventually build over this base
			player: MIS_YELLOW_SCAVS
		},
		"foxtrotLZBase": {
			cleanup: "scavLZBase2",
			detectMsg: "SCAV_LZBASE2",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated,
			player: MIS_YELLOW_SCAVS
		},
		"golfLZBase": {
			cleanup: "scavLZBase3",
			detectMsg: "SCAV_LZBASE3",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
			player: MIS_YELLOW_SCAVS
		},
		"scavHillBase": {
			cleanup: "scavOuterBase1",
			detectMsg: "SCAV_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"scavMiniOutpost": {
			cleanup: "scavOuterBase2",
			detectMsg: "SCAV_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated,
		},
		"scavCanalBase": {
			cleanup: "scavOuterBase3",
			detectMsg: "SCAV_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"scavNEBase": {
			cleanup: "scavOuterBase4",
			detectMsg: "SCAV_BASE4",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		// These are allied LZs:
		"charlieLZ": {
			cleanup: "scavLZBase1",
			friendly: true,
			player: MIS_TEAM_CHARLIE
		},
		"foxtrotLZ": {
			cleanup: "scavLZBase2",
			friendly: true,
			player: MIS_TEAM_FOXTROT
		},
		"golfLZ": {
			cleanup: "scavLZBase3",
			friendly: true,
			player: MIS_TEAM_GOLF
		},
	});

	camSetFactories({
		"scavOuterFactory1": {
			assembly: "scavOuterAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.buscan, cTempl.trike, cTempl.bloke, cTempl.rbuggy, cTempl.lance ]
		},
		"scavOuterFactory2": {
			assembly: "scavOuterAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				regroup: true
			},
			groupSize: 6,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(32)),
			templates: [ cTempl.moncan, cTempl.gbjeep, cTempl.rbjeep, cTempl.monhmg, cTempl.sartruck, cTempl.lance, cTempl.bjeep, cTempl.bjeep ]
		},
		"scavOuterFactory3": {
			assembly: "scavOuterAssembly3",
			order: CAM_ORDER_PATROL,
			data: {
				// Patrol and harass the player's LZ
				pos: [ "scavPatrolPos1", "scavPatrolPos2", "scavPatrolPos3", "scavPatrolPos4" ],
				interval: camSecondsToMilliseconds(20)
			},
			groupSize: 4,
			maxSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(24)),
			templates: [ cTempl.gbjeep, cTempl.buggy, cTempl.trike, cTempl.gbjeep, cTempl.minitruck, ]
		},
		"scavOuterFactory4": {
			assembly: "scavOuterAssembly4",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(24)),
			templates: [ cTempl.buscan, cTempl.trike, cTempl.bloke, cTempl.lance, cTempl.bloke, cTempl.buggy, cTempl.rbuggy, cTempl.gbjeep, cTempl.firetruck ]
		},
		"scavOuterFactory5": {
			assembly: "scavOuterAssembly5",
			order: CAM_ORDER_COMPROMISE,
			data: {
				// This factory targets the player specifically
				targetPlayer: CAM_HUMAN_PLAYER,
				pos: camMakePos("landingZone")
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(36)),
			templates: [ cTempl.rbuggy, cTempl.trike, cTempl.bloke, cTempl.lance, cTempl.monfire, cTempl.sartruck, cTempl.flatmrl ]
		},
		"scavInnerFactory1": {
			assembly: "scavInnerAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			templates: [ cTempl.monhmg, cTempl.bloke, cTempl.lance, cTempl.bloke, cTempl.lance, cTempl.bloke, cTempl.lance, cTempl.bjeep ]
		},
		"scavInnerFactory2": {
			assembly: "scavInnerAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			templates: [ cTempl.moncan, cTempl.minitruck, cTempl.flatmrl, cTempl.monfire, cTempl.lance, cTempl.monmrl, cTempl.sartruck ]
		},
		"scavInnerFactory3": {
			assembly: "scavInnerAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				// This factory targets the player specifically
				targetPlayer: CAM_HUMAN_PLAYER,
				regroup: true
			},
			groupSize: 4,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(24)),
			templates: [ cTempl.flatmrl, cTempl.monsar, cTempl.bjeep, cTempl.rbjeep, cTempl.firetruck, cTempl.monmrl, cTempl.gbjeep ]
		},
	});

	powerCaptured = false;
	uplinkCaptured = false;
	vtolCaptured = false;
	ambushTriggered = false;
	charlieLZSecure = false;
	foxtrotLZSecure = false;
	golfLZSecure = false;
	updateExtraObjectiveMessage();

	// Set up (new!) refillable groups for the player's allies
	// Also set up allied trucks

	// Charlie slow attack group (6 Mini-Rockets, 4 Twin Machineguns)
	charlieSlowAttackGroup = camMakeRefillableGroup(undefined, {templates: [
		cTempl.pllpodt, cTempl.pllpodt, cTempl.pllpodt, cTempl.pllpodt, cTempl.pllpodt, cTempl.pllpodt,
		cTempl.plltmgt, cTempl.plltmgt, cTempl.plltmgt, cTempl.plltmgt,
		]}, CAM_ORDER_ATTACK, {
		pos: camMakePos("vtolFactoryCaptureZone"),
		count: 10,
		morale: 80,
		fallback: camMakePos("scavOuterAssembly1"),
		repair: 75,
		repairPos: camMakePos("scavOuterAssembly1") // Wait here for repairs
	});
	// Charlie fast attack group (4 Machinegunner Cyborgs, 4 Light Cannons, 2 Mini-Rocket Arrays)
	charlieFastAttackGroup = camMakeRefillableGroup(undefined, {templates: [
		cTempl.cybmg, cTempl.cybmg, cTempl.cybmg, cTempl.cybmg,
		cTempl.pllcanw, cTempl.pllcanw, cTempl.pllcanw, cTempl.pllcanw,
		cTempl.pllmraw, cTempl.pllmraw,
		]}, CAM_ORDER_ATTACK, {
		count: 10,
		morale: 80,
		fallback: camMakePos("scavOuterAssembly1"),
		// regroup: true,
		repair: 75,
		repairPos: camMakePos("scavOuterAssembly1")
	});
	// Charlie repair group (6 Mechanic Cyborgs)
	charlieRepairGroup = camMakeRefillableGroup(undefined, {templates: [cTempl.cybrp, cTempl.cybrp, cTempl.cybrp, cTempl.cybrp]}, CAM_ORDER_DEFEND, {pos: camMakePos("scavOuterAssembly1")});
	// Charlie gets 2 trucks
	charlieTruckJob1 = camManageTrucks(MIS_TEAM_CHARLIE, {
		label: "charlieLZ", // Label of Charlie's LZ base (which starts unbuilt)
		rebuildBase: true,
		structset: camCharlieA1L2Structs // See structSets.js
		// NOTE: We don't need any more data here, since we'll manually assign/rebuild the truck with transport reinforcements
	});
	charlieTruckJob2 = camManageTrucks(MIS_TEAM_CHARLIE, {
		label: "charlieLZ",
		rebuildBase: true,
		structset: camCharlieA1L2Structs
	});

	// Foxtrot attack group (8 Flamer Cyborgs, 6 Mini-Rockets, 6 Sarissas)
	foxtrotAttackGroup = camMakeRefillableGroup(undefined, {templates: [
		cTempl.cybfl, cTempl.cybfl, cTempl.cybfl, cTempl.cybfl, cTempl.cybfl, cTempl.cybfl, cTempl.cybfl, cTempl.cybfl,
		cTempl.pllpodw, cTempl.pllpodw, cTempl.pllpodw, cTempl.pllpodw, cTempl.pllpodw, cTempl.pllpodw,
		cTempl.pllsart, cTempl.pllsart, cTempl.pllsart, cTempl.pllsart, cTempl.pllsart, cTempl.pllsart,
		]}, CAM_ORDER_ATTACK, {
		count: 20,
		morale: 90,
		fallback: camMakePos("scavLZBase2"),
		// regroup: true,
		repair: 75,
		repairPos: camMakePos("scavLZBase2") // Wait here for repairs
	});
	// Foxtrot repair group (4 Repair Turrets)
	foxtrotRepairGroup = camMakeRefillableGroup(undefined, {templates: [cTempl.pllrepw, cTempl.pllrepw, cTempl.pllrepw, cTempl.pllrepw]}, CAM_ORDER_DEFEND, {pos: camMakePos("scavLZBase2")});
	// Trucks
	foxtrotTruckJob1 = camManageTrucks(MIS_TEAM_FOXTROT, {
		label: "foxtrotLZ",
		rebuildBase: true,
		structset: camFoxtrotA1L2Structs
	});
	foxtrotTruckJob2 = camManageTrucks(MIS_TEAM_FOXTROT, {
		label: "foxtrotLZ",
		rebuildBase: true,
		structset: camFoxtrotA1L2Structs
	});

	// Golf attack group (8 Light Cannons, 4 Twin Machineguns, 6 Grenadier Cyborgs, 4 Mechanic Cyborgs)
	golfAttackGroup = camMakeRefillableGroup(undefined, {templates: [
		cTempl.pllcant, cTempl.pllcant, cTempl.pllcant, cTempl.pllcant, cTempl.pllcant, cTempl.pllcant, cTempl.pllcant, cTempl.pllcant,
		cTempl.plltmgt, cTempl.plltmgt, cTempl.plltmgt, cTempl.plltmgt,
		cTempl.cybgr, cTempl.cybgr, cTempl.cybgr, cTempl.cybgr, cTempl.cybgr, cTempl.cybgr,
		cTempl.cybrp, cTempl.cybrp, cTempl.cybrp, cTempl.cybrp,
		]}, CAM_ORDER_ATTACK, {
		count: 22,
		morale: 90,
		fallback: camMakePos("scavOuterAssembly4"),
		repair: 50,
		repairPos: camMakePos("scavOuterAssembly4") // Wait here for repairs
	});
	// Golf repair group (2 Repair Turrets)
	golfRepairGroup = camMakeRefillableGroup(undefined, {templates: [cTempl.pllrepw, cTempl.pllrepw]}, CAM_ORDER_DEFEND, {pos: camMakePos("scavOuterAssembly4")});
	// Truck
	golfTruckJob = camManageTrucks(MIS_TEAM_GOLF, {
		label: "golfLZ",
		rebuildBase: true,
		structset: camGolfA1L2Structs
	});

	queue("groupPatrol", camChangeOnDiff(camMinutesToMilliseconds(0.25)));
	queue("ambushLZ", camChangeOnDiff(camMinutesToMilliseconds(2.5)));
	queue("enableFirstFactories", camChangeOnDiff(camMinutesToMilliseconds(2.5)));
	queue("enableSecondFactories", camChangeOnDiff(camMinutesToMilliseconds(5)));
	queue("enableThirdFactories", camChangeOnDiff(camMinutesToMilliseconds(9)));
	queue("enableFinalFactories", camChangeOnDiff(camMinutesToMilliseconds(14)));
	queue("heliAttack1", camChangeOnDiff(camMinutesToMilliseconds(4)));
	queue("heliAttack2", camChangeOnDiff(camMinutesToMilliseconds(12)));

	preDamageStuff();

	hackAddMessage("CHARLIE_LZ", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("FOXTROT_LZ", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("GOLF_LZ", PROX_MSG, CAM_HUMAN_PLAYER);
}