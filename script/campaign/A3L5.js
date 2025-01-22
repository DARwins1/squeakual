include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

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

const MIS_RESEARCH_FACILITY = 1;

// var collectiveActive; // True when the Collective start calling transports and moving towards the artifact
var playerHasArtifact; // True when the player has collected the artifact (and can escape)
var enemyStoleArtifact; // True when the Collective have successfully escaped with the artifact

var colTruckJob; // Maintains the Collective's LZ
var colArtiGroup; // Tries to escape with the artifact
var colPatrolGroup; // Defends the Collective LZ
var colHoverGroup; // Harasses the player's LZ

camAreaEvent("heliRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("heliRemoveZone", CAM_INFESTED);
});

function heliAttack()
{
	const templates = [cTempl.infhelcan, cTempl.infhelhmg];
	const ext = {
		limit: 1,
		alternate: true,
	};
	camSetVtolData(CAM_INFESTED, ["heliAttackPos1", "heliAttackPos2"], "heliRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(1.25)), undefined, ext);
}

function sendInfestedReinforcements()
{	
	const CORE_SIZE = 4 + camRand(5);
	const FODDER_SIZE = 12 + camRand(3);

	// South west entrance
	const swDroids = camRandInfTemplates(
		[cTempl.stinger, cTempl.infbloke, cTempl.infkevbloke, cTempl.infminitruck, cTempl.infbuggy, cTempl.infrbuggy, cTempl.infcybhg, cTempl.infcybca, cTempl.infcolpodt], 
		CORE_SIZE, FODDER_SIZE
	);
	camSendReinforcement(CAM_INFESTED, getObject("infEntry1"), swDroids, CAM_REINFORCE_GROUND, {order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}});

	// West entrance
	// (Gets weaker when factory is destroyed)
	// if (collectiveActive)
	// {
		const WEST_FACTORY_DESTROYED = getObject("infFactory2") === null;
		const westDroids = camRandInfTemplates(
			[cTempl.basher, cTempl.basher, cTempl.infkevbloke, cTempl.inflance, cTempl.infbuggy, cTempl.infrbuggy, cTempl.stinger, cTempl.boomtick],
			(WEST_FACTORY_DESTROYED) ? CORE_SIZE / 2 : CORE_SIZE, (WEST_FACTORY_DESTROYED) ? FODDER_SIZE * 2 / 3 : FODDER_SIZE
		);
		camSendReinforcement(CAM_INFESTED, getObject("infEntry2"), westDroids, CAM_REINFORCE_GROUND);
	// }
	
	// North road entrances
	// (Only spawns units if the nearby Collective structures are cleared)
	const BLOCKADE_STRUCTURES = enumArea("blockadeStructs", CAM_THE_COLLECTIVE, false).filter((obj) => (obj.type === STRUCTURE)).length;
	if (BLOCKADE_STRUCTURES === 0)
	{
		const northDroids = camRandInfTemplates(
			[cTempl.stinger, cTempl.infbloke, cTempl.infkevbloke, cTempl.infminitruck, cTempl.infbuggy, cTempl.infrbuggy, cTempl.infcybhg, cTempl.infcybca, cTempl.infcolpodt], 
			CORE_SIZE, FODDER_SIZE
		);
		camSendReinforcement(CAM_INFESTED, getObject("infEntry3"), northDroids, CAM_REINFORCE_GROUND);
	}
}

// Enable (most of) the Infested factories and start sending helicopters
function activateInfested()
{
	camEnableFactory("infFactory1");
	camEnableFactory("infFactory2");
	camEnableFactory("infFactory3");
	camEnableFactory("infFactory4");
	camEnableFactory("infFactory5");
	heliAttack();
}

// Start moving the Collective towards the artifact and start queuing Collective transports
// Also enable the west Infested base
function activateCollective()
{
	// collectiveActive = true;
	
	

	// setTimer("manageArtifactGroup", camSecondsToMilliseconds(1));
}

function enemyBaseDetected_colLZBase()
{
	camCallOnce("detectCollective");
}

function detectCollective()
{
	camDetectEnemyBase("colLZBase");
	if (!playerHasArtifact)
	{
		camSetExtraObjectiveMessage(_("Do not allow the Collective to escape with the artifact"));
	}

	// TODO: Dialogue here...
}

function eventAttacked(victim, attacker)
{
	if (victim.player === CAM_THE_COLLECTIVE && attacker.player === CAM_HUMAN_PLAYER)
	{
		camCallOnce("detectCollective");
	}
}

function eventDestroyed(obj)
{
	if (obj.player === MIS_RESEARCH_FACILITY)
	{
		camCallOnce("removeResearchBeacon");
	}
}

function removeResearchBeacon()
{
	hackRemoveMessage("RESEARCH_FACILITY", PROX_MSG, CAM_HUMAN_PLAYER);
}

// Handles order logic for the Collective's artifact group
// Also picks up the artifact if the Collective group is close enough
function manageArtifactGroup()
{
	// The Collective artifact group has different orders depending on the state of the mission...
	// Before this function is called, the group will defend the northwest side of the map.
	// If the research facility is still standing (and the artifact hasn't dropped), attack towards it.
	// If the artifact is dropped on the ground, move towards it.
	// If the player has the artifact, attack the player.
	// Otherwise (when the artifact is being carried), move towards the Collective's LZ.

	if (playerHasArtifact)
	{
		// If the player has the artifact, just try to attack them
		camManageGroup(colArtiGroup, CAM_ORDER_ATTACK, {
			targetPlayer: CAM_HUMAN_PLAYER,
			repair: 25,
			removable: false
		});
		removeTimer("manageArtifactGroup");
		return; // No need to keep checking
	}

	const artifacts = enumFeature(ALL_PLAYERS, "Crate");

	if (getObject("infResearch") !== null)
	{
		// If the research facility exists, attack it
		camManageGroup(colArtiGroup, CAM_ORDER_ATTACK, {
			targetPlayer: MIS_RESEARCH_FACILITY,
			pos: camMakePos("infResearch"),
			repair: 25,
			removable: false
		});

		return;
	}
	else if (artifacts.length > 0) // Artifact dropped
	{
		const realCrate = artifacts[0];
		const artiLoc = camMakePos(realCrate);

		// Move towards the artifact crate
		camManageGroup(colArtiGroup, CAM_ORDER_DEFEND, {
			pos: camMakePos(realCrate),
			repair: 25,
			radius: 0,
			removable: false
		});

		// Also check if we're close enough to pick it up...
		const GRAB_RADIUS = 2;

		//Find the one closest to the artifact so that one can "hold" it
		const artiMembers = enumGroup(colArtiGroup);
		let closestDroid = undefined;
		let closestDist = Infinity;

		for (droid of enumGroup(colArtiGroup))
		{
			const DR_DIST = camDist(droid, artiLoc);
			if (DR_DIST < closestDist)
			{
				closestDroid = droid;
				closestDist = DR_DIST;
			}
		}

		// Now take it if close enough
		if (closestDist < GRAB_RADIUS)
		{
			// Clear older artifacts if found.
			camDeleteArtifact("infResearch", false); 
			camDeleteArtifact("colArtiHolder", false);

			// Place the artifact in the nearest droid
			addLabel(closestDroid, "colArtiHolder");
			camAddArtifact({"colArtiHolder": { tech: "R-Wpn-Rocket08-Ballista" }}); // Ballista

			camSafeRemoveObject(realCrate);
		}
		else
		{
			return;
		}
	}
	// If we've gotten here, the Collective are holding the artifact
	// Run for the LZ!
	camManageGroup(colArtiGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("landingZoneCollective"),
		repair: 25,
		radius: 0,
		removable: false
	});
}

function sendCollectiveTransporter()
{
	camCallOnce("detectCollective");
	// First, check if the LZ is still alive
	if (camBaseIsEliminated("colLZBase"))
	{
		// Try again next time...
		return;
	}

	// Make a list of droids to bring in in order of importance
	// Truck -> Patrol -> Artifact -> Hover
	let droidQueue = [];

	if (!camDef(camGetTruck(colTruckJob))) droidQueue.push(cTempl.comtruckt);

	droidQueue = droidQueue.concat(camGetRefillableGroupTemplates([colPatrolGroup, colArtiGroup, colHoverGroup]));

	// Next, add grab some droids for the transport
	const TRANSPORT_SIZE = ((difficulty <= MEDIUM) ? 8 : 10);
	const droids = [];
	// Push drois from the queue into the transporter
	for (let i = 0; i < Math.min(droidQueue.length, TRANSPORT_SIZE); i++)
	{
		droids.push(droidQueue[i]);
	}

	// Don't send an empty transport!
	if (droids.length > 0)
	{
		camSendReinforcement(CAM_THE_COLLECTIVE, camMakePos("landingZoneCollective"), droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: {x: 2, y: 2},
				exit: {x: 2, y: 2}
			}
		);
	}
}

// Assign Collective units to their respective groups, and steal the artifact if it is nearby
function eventTransporterLanded(transport)
{
	if (transport.player === CAM_THE_COLLECTIVE)
	{
		// Assign Collective reinforcements
		const transDroids = camGetTransporterDroids(transport.player);
		const transTrucks = transDroids.filter((droid) => (droid.droidType == DROID_CONSTRUCT));
		const transOther = transDroids.filter((droid) => (droid.droidType != DROID_CONSTRUCT));

		// Assign the truck
		// Check if the LZ truck is missing
		if (!camDef(camGetTruck(colTruckJob)) && camDef(transTrucks[0]))
		{
			// Assign this truck!
			camAssignTruck(transTrucks[0], colTruckJob);
		}

		// Assign other units to their refillable groups
		camAssignToRefillableGroups(transOther, [colPatrolGroup, colArtiGroup, colHoverGroup]);

		// Check if the artifact holder is nearby
		const artiHolder = getObject("colArtiHolder");
		if (artiHolder !== null && camWithinArea(camMakePos(artiHolder), "colLzStructs"))
		{
			// The Collective has escaped with the artifact!
			camDeleteArtifact("colArtiHolder");
			enemyStoleArtifact = true; // Mission failure imminent
			playSound(cam_sounds.enemyEscaping);
		}
	}
}

function eventPickup(feature, droid)
{
	if (feature.stattype === ARTIFACT && droid.player === CAM_HUMAN_PLAYER)
	{
		playerHasArtifact = true;
		camSetExtraObjectiveMessage();
	}
}

// Returns true if the player has or can still get the artifact
function artifactReachable()
{
	if (playerHasArtifact)
	{
		return true; // Player already has the artifact
	}

	let colTransportFound = false;
	enumDroid(CAM_THE_COLLECTIVE).forEach((dr) => {
		if (camIsTransporter(dr))
		{
			colTransportFound = true;
		}
	});

	// Fail if they stole it and the transporter is not on map anymore
	if (enemyStoleArtifact && !colTransportFound)
	{
		return false;
	}
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz
	const transportEntryPos = camMakePos("transportEntryPos");

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A3L6", {
		message: "RET_LZ",
		reinforcements: camMinutesToSeconds(1.5),
		retlz: true,
		area: "compromiseZone",
		callback: "artifactReachable",
		enableLastAttack: false
	});

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(61, 61, CAM_HUMAN_PLAYER);
	setTransporterExit(61, 61, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);

	setAlliance(MIS_RESEARCH_FACILITY, CAM_INFESTED, true);
	changePlayerColour(MIS_RESEARCH_FACILITY, 10); // Change the research facility to white

	camSetArtifacts({
		"infResearch": { tech: "R-Wpn-Rocket08-Ballista" }, // Ballista
	});

	camSetEnemyBases({
		"colLZBase": {
			cleanup: "colLzStructs",
			detectMsg: "COL_LZBASE",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infestedRidgeBase": {
			cleanup: "infBase1",
			detectMsg: "INF_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"infestedTrenchBase": {
			cleanup: "infBase2",
			detectMsg: "INF_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"infestedResearchBase": {
			cleanup: "infBase3",
			detectMsg: "INF_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
	});

	camSetFactories({
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
		"infFactory4": {
			assembly: "infAssembly4",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			// Light Infested vehicles
			templates: [cTempl.infciv, cTempl.infrbjeep, cTempl.infciv, cTempl.infbloke, cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.infbjeep]
		},
		"infFactory5": {
			assembly: "infAssembly5",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			// Light Infested vehicles
			templates: [cTempl.infciv, cTempl.infrbjeep, cTempl.infciv, cTempl.infbloke, cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.infbjeep]
		},
	});

	hackAddMessage("RESEARCH_FACILITY", PROX_MSG, CAM_HUMAN_PLAYER);

	// collectiveActive = false;
	playerHasArtifact = false;
	enemyStoleArtifact = false;

	// Manage Collective groups...
	colArtiGroup = camMakeRefillableGroup(camMakeGroup("colArtiGroup"), {
		templates: [
			cTempl.cohhcant, cTempl.cohhcant, // 2 Heavy Cannons
			cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 4 Assault Guns
			cTempl.cominft, cTempl.cominft, // 2 Infernos
			cTempl.comhatt, cTempl.comhatt, // 2 Tank Killers
			cTempl.comhrept, // 1 Heavy Repair Turret
		]}, CAM_ORDER_DEFEND, {
		pos: camMakePos("colArtiGroup"),
		repair: 50
	});
	colPatrolGroup = camMakeRefillableGroup(camMakeGroup("colPatrolGroup"), {
		templates: [
			cTempl.cohraat, // 1 Whirlwind
			cTempl.cohhcant, cTempl.cohhcant, // 2 Heavy Cannons
			cTempl.cybla, cTempl.cybla, cTempl.cybla, cTempl.cybla, // 4 Lancer Cyborgs
			cTempl.scytk, cTempl.scytk, // 2 Super Tank Killer Cyborgs
			cTempl.comhatt, cTempl.comhatt, // 2 Tank Killers
			cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, // 4 Thermite Flamer Cyborgs
		]}, CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos1"),
			camMakePos("patrolPos2"),
		],
		interval: camSecondsToMilliseconds(42),
		repair: 75
	});
	colHoverGroup = camMakeRefillableGroup(undefined, {
		templates: [
			cTempl.comhath, cTempl.comhath, // 2 Tank Killers
			cTempl.combbh, // 1 Bunker Buster
			cTempl.comhpvh, cTempl.comhpvh, cTempl.comhpvh, // 4 HVCs
			cTempl.combbh, // Another Bunker Buster
		]}, CAM_ORDER_PATROL, {
			pos: [
				camMakePos("hoverPatrolPos1"),
				camMakePos("hoverPatrolPos2"),
			],
			interval: camSecondsToMilliseconds(32),
			repair: 75
	});

	colTruckJob = camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colLZBase",
		rebuildBase: true,
		structset: camAreaToStructSet("colLzStructs"),
		truckDroid: getObject("colTruck")
	});

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);
	// Pre-damage the facility too...
	camSetPreDamageModifier(MIS_RESEARCH_FACILITY, [60, 90]);

	// queue("activateCollective", camChangeOnDiff(camSecondsToMilliseconds(15)));
	setTimer("sendCollectiveTransporter", camMinutesToMilliseconds(2.5));
	queue("activateInfested", camChangeOnDiff(camSecondsToMilliseconds(30)));
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(45)));
	setTimer("manageArtifactGroup", camSecondsToMilliseconds(1));

	// Lighten the fog to *more or less* 2x default brightness with a slight pink color
	camSetFog(48, 32, 96);
	// Add a purple-blue tint
	camSetSunIntensity(.5, .45, .55);
}