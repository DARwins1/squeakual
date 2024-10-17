include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");
include("script/campaign/structSets.js");

const MIS_LZ_SCAVS = 1;
const MIS_TEAM_CHARLIE = 5;
const MIS_TEAM_GOLF = 6;
const transportEntryPosCharlie = { x: 2, y: 2 };
const transportEntryPosGolf = { x: 30, y: 2 };
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

var stealthPhase;
var playerHidden;

var charlieCommander;
var charlieCommandGroup;
var golfSensor;
var golfSensorGroup;
var golfAttackGroup;
var golfVtolGroup;
var charlieTruckJob1;
var golfTruckJob1;
var golfTruckJob2;

camAreaEvent("vtolRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("vtolRemoveZone", CAM_THE_COLLECTIVE);
});

// Called shortly after the player breaks stealth
function heliAttack()
{
	const ext = {
		limit: [1, 1, 1],
		targetPlayer: CAM_HUMAN_PLAYER,
		alternate: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos1", "vtolRemoveZone", [cTempl.helcan, cTempl.helhmg, cTempl.helpod], camChangeOnDiff(camSecondsToMilliseconds(30)), "heliTower", ext);
}

// Called shortly after the player breaks stealth
function vtolAttack1()
{
	const templates = [cTempl.colatv, cTempl.colhmgv]; // Lancers and HMGs
	const ext = {
		limit: [2, 3],
		alternate: true,
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos1", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(1.5)), "colCC1", ext);
}

// Called after a long delay or when the player advances far enough
function vtolAttack2()
{
	const templates = [cTempl.colatv, ((difficulty >= HARD) ? comhbombv : cTempl.combombv)]; // Lancers and Cluster Bombs (or HEAP Bombs on Hard+)
	const ext = {
		limit: [((difficulty >= HARD) ? 3 : 2), 2],
		targetPlayer: CAM_HUMAN_PLAYER,
		alternate: true,
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), "colCC2", ext);
}

// Break "stealth" when the player attacks certain enemies
// If the player engages the LZ scavs, start a 1 minute timer and remove their sensor debuff.
// If the player engages Collective after the stealth section, remove the sensor debuff from everyone and start the mission proper.
// If the player engages Collective during the stealth section, fail the player.
function eventAttacked(victim, attacker)
{
	if (victim.player !== CAM_HUMAN_PLAYER && attacker.player !== CAM_HUMAN_PLAYER)
	{
		// If the player is neither the attacker nor victim, we don't care about it.
		return;
	}

	if (victim.player === MIS_LZ_SCAVS || attacker.player === MIS_LZ_SCAVS)
	{
		camCallOnce("activateLzScavs");
	}
	if (victim.player === CAM_THE_COLLECTIVE || attacker.player === CAM_THE_COLLECTIVE)
	{
		playerHidden = false;
		if (stealthPhase)
		{
			// The player has been detected by the Collective! (early!!!!)
			camCompleteRequiredResearch(["R-Script-Sensor-Debuff-Undo"], CAM_THE_COLLECTIVE);
		}
		else
		{
			// Begin the assault!
			camCallOnce("activateCollective");
		}
	}
}

function activateLzScavs()
{
	// Undo the sensor debuff
	camCompleteRequiredResearch(["R-Script-Sensor-Debuff-Undo"], MIS_LZ_SCAVS);
	// NOTE: This part is timed even in timerless mode!
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(1)));
	camEnableFactory("lzScavFactory");
}

// Place a new LZ, enable reinforcements, and queue the end of the stealth phase
function camEnemyBaseEliminated_scavLZBase()
{
	// const lz = getObject("landingZone2");
	// setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	hackRemoveMessage("CLEAR_LZ", PROX_MSG, CAM_HUMAN_PLAYER);
	

	if (!tweakOptions.rec_timerlessMode)
	{
		// Set to the "real" mission time
		setMissionTime(camChangeOnDiff(camHoursToSeconds(1.5)));
	}
	else
	{
		// Remove the timer
		setMissionTime(-1);
	}

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A2L7", {
		reinforcements: camMinutesToSeconds(1.75),
		area: "compromiseZone",
		callback: "playerDetected", // Will change once the stealth phase is officially "ended"
		retlz: true,
	});
	camSetExtraObjectiveMessage("Avoid detection by the Collective");

	queue("endStealthPhase", camSecondsToMilliseconds(20));
	queue("sendCollectiveScouts", camChangeOnDiff(camMinutesToMilliseconds(4)));
}

// Sends a scout group searching for the player
// This group will break the player's stealth and start the mission proper
// Basically just to prevent the player from sitting around too long before attacking
// This function is also called when the player is revealed
function sendCollectiveScouts()
{
	camManageGroup(camMakeGroup("colScoutGroup"), CAM_ORDER_COMPROMISE, {
		pos: camMakePos("landingZone1"),
		morale: 20,
		fallback: camMakePos("cScavAssembly1"),
	});
}

// End the stealth phase expand the map
function endStealthPhase()
{
	stealthPhase = false;

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A2L7", {
		reinforcements: camMinutesToSeconds(1.75),
		area: "compromiseZone",
		retlz: true,
		callback: "campClear", // No longer fail when detected
	});
	camSetExtraObjectiveMessage("Clear the Collective prison camp");

	// Expand the map boundaries
	setScrollLimits(0, 0, 160, 56);
}

// Activate the Collective and all allies
// Also queue up a bunch of events for later
function activateCollective()
{
	// Send scouts if they haven't been sent already
	sendCollectiveScouts();

	// Remove the sensor debuff from everyone
	camCompleteRequiredResearch(["R-Script-Sensor-Debuff-Undo"], CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(["R-Script-Sensor-Debuff-Undo"], MIS_TEAM_CHARLIE);
	camCompleteRequiredResearch(["R-Script-Sensor-Debuff-Undo"], MIS_TEAM_GOLF);

	// Set up groups
	// Collective patrols
	camManageGroup(camMakeGroup("cScavPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos2"),
			camMakePos("patrolPos3"),
		],
		interval: camSecondsToMilliseconds(28)
	});
	camManageGroup(camMakeGroup("colCommander1"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos1"),
			camMakePos("patrolPos2"),
			camMakePos("patrolPos3"),
			camMakePos("patrolPos4"),
		],
		interval: camSecondsToMilliseconds(32),
		repair: 75
	});
	camManageGroup(camMakeGroup("colCommander2"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos5"),
			camMakePos("patrolPos6"),
			camMakePos("patrolPos7"),
			camMakePos("patrolPos8"),
			camMakePos("patrolPos9"),
		],
		interval: camSecondsToMilliseconds(32),
		repair: 75
	});
	// Collective refillable groups
	const commandTemplates1 = [ // 4 Grenadiers, 2 Lancers, 2 Medium Cannons, 2 Hurricanes
		cTempl.cybgr, cTempl.cybgr, cTempl.cybgr, cTempl.cybgr,
		cTempl.comatt, cTempl.comatt,
		cTempl.commcant, cTempl.commcant,
		cTempl.colaaht, cTempl.colaaht,
	];
	if (difficulty >= HARD)
	{
		// Add 2 Super Heavy-Gunners
		commandTemplates1.push(cTempl.scymc);
		commandTemplates1.push(cTempl.scymc);
	}
	camMakeRefillableGroup(camMakeGroup("colCommandGroup1"), {
		templates: commandTemplates1,
		factories: ["colFactory4", "colCybFactory5"],
		obj: "colCommander1" // Stop refilling this group when the commander dies
		}, CAM_ORDER_FOLLOW, {
		leader: "colCommander1",
		repair: 60,
		suborder: CAM_ORDER_ATTACK
	});
	const commandTemplates2 = [ // 2 HVCs, 2 HMGs, 2 Lancer Cyborgs, 2 Super Heavy-Gunners, 2 Heavy Cannons, 1 Cyclone, 1 Heavy Repair Turret
		cTempl.comhpvt, cTempl.comhpvt,
		cTempl.comhmgt, cTempl.comhmgt,
		cTempl.cybla, cTempl.cybla,
		cTempl.scymc, cTempl.scymc,
		cTempl.cohhcant, cTempl.cohhcant,
		cTempl.comhaat,
		cTempl.comhrept,
	];
	if (difficulty >= HARD)
	{
		// Add 2 Lancer Cyborgs
		commandTemplates1.push(cTempl.cybla);
		commandTemplates1.push(cTempl.cybla);
	}
	camMakeRefillableGroup(camMakeGroup("colCommandGroup2"), {
		templates: commandTemplates2,
		factories: ["colFactory4", "colCybFactory5"],
		obj: "colCommander2"
		}, CAM_ORDER_FOLLOW, {
		leader: "colCommander2",
		repair: 60,
		suborder: CAM_ORDER_ATTACK
	});
	camMakeRefillableGroup(undefined, {
		templates: [ // 2 Lancers, 2 MRAs, 2 HVCs
			cTempl.comath, cTempl.commrah, cTempl.comhpvh,
			cTempl.comath, cTempl.commrah, cTempl.comhpvh,
		],
		factories: ["colFactory3"],
		obj: "colCC1"
		}, CAM_ORDER_PATROL, {
		pos: [
			camMakePos("hoverPatrolPos1"),
			camMakePos("hoverPatrolPos2"),
			camMakePos("hoverPatrolPos3"),
		],
		interval: camSecondsToMilliseconds(18),
		repair: 80
	});
	// Allied refillable groups
	charlieCommander = camMakeRefillableGroup(camMakeGroup("charlieCommander"), {
		templates: [cTempl.plmcomht]
		}, CAM_ORDER_ATTACK, {
		repair: 50
	});
	charlieCommandGroup = camMakeRefillableGroup(camMakeGroup("charlieCommandGroup"), {
		templates: [ // 2 Lancers, 2 Bunker Busters, 4 Heavy Machinegunners, 2 Super Heavy-Gunners
			cTempl.plmatht, cTempl.plmatht,
			cTempl.plmbbht, cTempl.plmbbht,
			cTempl.cybhg, cTempl.cybhg, cTempl.cybhg, cTempl.cybhg,
			cTempl.scymc, cTempl.scymc,
		],
		}, CAM_ORDER_FOLLOW, {
		leader: "charlieCommander",
		repair: 50,
		suborder: CAM_ORDER_DEFEND,
		data: {pos: camMakePos("landingZoneCharlie")}
	});
	golfSensor = camMakeRefillableGroup(camMakeGroup("golfSensor"), {
		templates: [cTempl.plmsenst]
		}, CAM_ORDER_ATTACK, {
		pos: camMakePos("patrolPos8"), // Focus on the northern route
		repair: 50
	});
	golfSensorGroup = camMakeRefillableGroup(camMakeGroup("golfSensorGroup"), {
		templates: [cTempl.plmhmortt, cTempl.plmhmortt, cTempl.plmhmortt, cTempl.plmhmortt]
		}, CAM_ORDER_FOLLOW, {
		leader: "golfSensor",
		repair: 50,
		suborder: CAM_ORDER_DEFEND,
		data: {pos: camMakePos("landingZoneGolf")}
	});
	golfAttackGroup = camMakeRefillableGroup(camMakeGroup("golfAttackGroup"), {
		templates: [cTempl.plmmrat, cTempl.plmmrat, cTempl.plmmrat, cTempl.plmmrat, cTempl.plmmrat, cTempl.plmmrat]
		}, CAM_ORDER_ATTACK, {
		pos: camMakePos("patrolPos8"), // Focus on the northern route
		repair: 50
	});
	golfVtolGroup = camMakeRefillableGroup(camMakeGroup("golfVtolGroup"), {
		templates: [cTempl.pllbombv, cTempl.pllbombv, cTempl.pllbombv, cTempl.pllbombv, cTempl.pllbombv, cTempl.pllbombv]
		}, CAM_ORDER_ATTACK, {
		repair: 50
	});

	// Set up trucks
	// Collective trucks
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 35 : 70));
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colBasinOutpost",
		respawnDelay: TRUCK_TIME,
		template: cTempl.coltruckht,
		structset: camAreaToStructSet("colBase1").filter((struct) => (
			// Filter out scavenger structures
			struct.stat !== "A0BabaFactory" && struct.stat !== "A0BabaMRAPit" && struct.stat !== "A0BabaFlameTower"
			&& struct.stat !== "A0BabaGunTowerEND" && struct.stat !== "A0BabaHorizontalWall" && struct.stat !== "A0BabaCornerWall"
		)) 
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colSouthCanalRoadblock",
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		template: cTempl.coltruckht,
		structset: camAreaToStructSet("colBase2")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colNorthCanalBase",
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		template: cTempl.comtruckt,
		structset: camAreaToStructSet("colBase3")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colSouthCanalBase",
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		template: cTempl.comtruckt,
		structset: camAreaToStructSet("colBase4")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colEastCanalBase",
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		template: cTempl.comtruckt,
		structset: camAreaToStructSet("colBase5")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colCraterBase",
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		template: cTempl.coltruckht,
		structset: camAreaToStructSet("colBase6")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colMainBase",
		respawnDelay: TRUCK_TIME / 2,
		rebuildBase: tweakOptions.rec_timerlessMode,
		template: cTempl.comtruckt,
		structset: camAreaToStructSet("colBase7")
	});
	if (tweakOptions.rec_timerlessMode)
	{
		// TODO: Cranes
	}
	// Allied Trucks
	charlieTruckJob1 = camManageTrucks(MIS_TEAM_CHARLIE, {
		label: "charlieLZ",
		rebuildBase: true,
		truckDroid: getObject("charlieEngineer"),
		structset: camAreaToStructSet("charlieStructZone")
	});
	golfTruckJob1 = camManageTrucks(MIS_TEAM_GOLF, {
		label: "golfLZ",
		rebuildBase: true,
		truckDroid: getObject("golfTruck1"),
		structset: camAreaToStructSet("golfStructZone")
	});
	golfTruckJob2 = camManageTrucks(MIS_TEAM_GOLF, {
		label: "golfLZ",
		rebuildBase: true,
		truckDroid: getObject("golfTruck2"),
		structset: camAreaToStructSet("golfStructZone")
	});

	// Start timers and queues
	setTimer("sendCharlieTransporter", camMinutesToMilliseconds(1.75));
	setTimer("sendGolfTransporter", camMinutesToMilliseconds(1.75));
	queue("heliAttack", camChangeOnDiff(camMinutesToMilliseconds(1.25)));
	queue("vtolAttack1", camChangeOnDiff(camMinutesToMilliseconds(2.5)));
	queue("enableMoreFactories", camChangeOnDiff(camMinutesToMilliseconds(8)));
	queue("vtolAttack2", camChangeOnDiff(camMinutesToMilliseconds(12)));
	queue("enableFinalFactories", camChangeOnDiff(camMinutesToMilliseconds(16)));

	// Activate some factories immediately
	camEnableFactory("cScavFactory1");
	camEnableFactory("colFactory1");
	camEnableFactory("colFactory2");
	camEnableFactory("colCybFactory1");
	camEnableFactory("colCybFactory2");
	// NOTE: These factories only resupply refillable groups for now
	camEnableFactory("colFactory4");
	camEnableFactory("colCybFactory5");

	setTimer("sendInfestedReinforcements", camMinutesToMilliseconds(1.1));
}

function sendCharlieTransporter()
{
	// Make a list of droids to bring in in order of importance
	// For team Charlie, this is:
	// Trucks -> Commander -> Command Group
	let droidQueue = [];

	if (!camDef(camGetTruck(charlieTruckJob1))) droidQueue.push(cTempl.cyben);

	droidQueue = droidQueue.concat(camGetRefillableGroupTemplates([charlieCommander, charlieCommandGroup]));

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

function sendGolfTransporter()
{
	// Make a list of droids to bring in in order of importance
	// For team Golf, this is:
	// Trucks -> Sensor -> Sensor Group -> Attack Group -> VTOL Group
	let droidQueue = [];

	if (!camDef(camGetTruck(golfTruckJob1))) droidQueue.push(cTempl.plmtruckt);
	if (!camDef(camGetTruck(golfTruckJob2))) droidQueue.push(cTempl.plmtruckt);

	droidQueue = droidQueue.concat(camGetRefillableGroupTemplates([golfSensor, golfSensorGroup, golfAttackGroup, golfVtolGroup]));

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
				entry: transportEntryPosCharlie,
				exit: transportEntryPosCharlie
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
			truckJobs = [charlieTruckJob1];
			otherGroups = [charlieCommander, charlieCommandGroup];
			break;
		}
		case MIS_TEAM_GOLF:
		{
			truckJobs = [golfTruckJob1, golfTruckJob2];
			otherGroups = [golfSensor, golfSensorGroup, golfAttackGroup, golfVtolGroup];
			break;
		}
		default:
		{
			// How did we get here?
			return;
		}
	}

	const transTrucks = transDroids.filter((droid) => (droid.droidType == DROID_CONSTRUCT));
	const transOther = transDroids.filter((droid) => (droid.droidType != DROID_CONSTRUCT));

	// Assign any trucks/engineers
	let truckIndex = 0;
	for (const job of truckJobs)
	{
		// Check if we have an open job and an available truck
		if (!camDef(camGetTruck(job)) && camDef(transTrucks[truckIndex]))
		{
			// Assign this truck!
			camAssignTruck(transTrucks[truckIndex], job);
			truckIndex++;
		}
	}

	// Next, check if any new commander/sensor unit has landed
	// If so, apply the appropriate label
	for (const droid of transOther)
	{
		// Check if we have an open job and an available truck
		if (droid.droidType === DROID_COMMAND)
		{
			// New Charlie command tank
			addLabel(droid, "charlieCommander");
			// Also rank the commander to the appropriate level
			const CHARLIE_RANK = "Trained";
			camSetDroidRank(droid, CHARLIE_RANK);

		}
		else if (droid.droidType === DROID_SENSOR)
		{
			// New Golf sensor tank
			addLabel(droid, "golfSensor");
		}
	}

	// Assign other units to their refillable groups
	camAssignToRefillableGroups(transOther, otherGroups);
}

// Enable the remaining idle factories
function enableMoreFactories()
{
	camEnableFactory("cScavFactory2");
	camEnableFactory("cScavFactory3");
	camEnableFactory("colFactory3");
	camEnableFactory("colCybFactory3");
	camEnableFactory("colCybFactory4");
}

// Allow the final factories to start making their "own" units
function enableFinalFactories()
{
	camSetFactories({
		"colFactory4": {
			assembly: "colAssembly4",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 40
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(65)),
			templates: [ cTempl.cohhcant, cTempl.comhatt, cTempl.comhpvt, cTempl.comhmgt ] // Scary tanks
		},
		"colCybFactory5": {
			assembly: "colCybAssembly5",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 35
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(48)),
			templates: [ cTempl.scymc, cTempl.cybhg, cTempl.cybhg ] // Supers and Heavy Machinegunners
		},
	});

	camEnableFactory("colFactory4");
	camEnableFactory("colCybFactory5");
}

// Damage infested reinforcements
// TODO: Move this into a general libcampaign function
function preDamageInfestedGroup(group)
{
	const units = enumGroup(group);
	for (let i = 0; i < units.length; ++i)
	{
		if (units[i].body !== "CrawlerBody") // Don't damage crawlers
		{
			// 50% to 80% base HP
			setHealth(units[i], 50 + camRand(31));
		}
	}
}

// Randomize the provided list of units and tack on a bunch of extra rocket fodder
// TODO: Move this into a general libcampaign function
function randomizeTemplates(list)
{
	const droids = [];
	const CORE_SIZE = 4 + camRand(5); // Maximum of 8 core units.
	const FODDER_SIZE = 14 + camRand(3); // 14 - 16 extra Infested Civilians to the swarm.

	for (let i = 0; i < CORE_SIZE; ++i)
	{
		droids.push(list[camRand(list.length)]);
	}

	// Add a bunch of Infested Civilians.
	for (let i = 0; i < FODDER_SIZE; ++i)
	{
		droids.push(cTempl.infciv);
	}

	// Chance to add a Boom Tick on Hard (10%) or Insane (20%)
	if ((difficulty === HARD && camRand(101) < 10) || (difficulty === INSANE && camRand(101) < 20))
	{
		droids.push(cTempl.boomtick);
	}

	return droids;
}

// Start sending Infested waves once the player progresses far enough
function sendInfestedReinforcements()
{
	// NE entrance
	if (camBaseIsEliminated("colCraterBase") || camBaseIsEliminated("colMainBase"))
	{
		const droids = [cTempl.stinger, cTempl.infbloke, cTempl.infbloke, cTempl.infminitruck, cTempl.infbuggy, cTempl.infrbuggy];
		preDamageInfestedGroup(camSendReinforcement(CAM_INFESTED, getObject("infestedEntry3"), randomizeTemplates(droids), CAM_REINFORCE_GROUND));
	}

	// SE entrances
	if (camBaseIsEliminated("colEastCanalBase") || camBaseIsEliminated("colMainBase"))
	{
		const droids1 = [cTempl.stinger, cTempl.inffiretruck, cTempl.infbloke, cTempl.inflance, cTempl.infbuggy, cTempl.infrbuggy];
		preDamageInfestedGroup(camSendReinforcement(CAM_INFESTED, getObject("infestedEntry1"), randomizeTemplates(droids1), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}} // Annoy the player specifically
		));

		const droids2 = [cTempl.stinger, cTempl.inflance, cTempl.infbuscan, cTempl.infbloke, cTempl.infbjeep, cTempl.infrbjeep];
		preDamageInfestedGroup(camSendReinforcement(CAM_INFESTED, getObject("infestedEntry2"), randomizeTemplates(droids2), CAM_REINFORCE_GROUND));
	}
}

function playerDetected()
{
	if (!playerHidden)
	{
		return false; // Player detected
	}
	return undefined; // Player undetected
}

function campClear()
{
	if (camBaseIsEliminated("colMainBase"))
	{
		return true; // Camp is cleared
		// TODO: Remove beacon blip
	}
	return undefined; // Camp is not cleared
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone1");
	const lz = getObject("landingZone1");
	const transportEntryPos = {x: 2, y: 48};

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A2L7", {
		area: "landingZone1",
		reinforcements: -1, // will override later
		callback: "playerDetected",
	});
	camSetExtraObjectiveMessage(["Clear a landing zone", "Avoid detection by the Collective"]);

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);

	// Make sure the scavengers/allies aren't choosing conflicting colors with the player
	const PLAYER_COLOR = playerData[0].colour;
	changePlayerColour(CAM_INFESTED, (PLAYER_COLOR !== 9) ? 9 : 4); // Infested to purple or red
	changePlayerColour(MIS_LZ_SCAVS, (PLAYER_COLOR !== 2) ? 2 : 10); // Scavs to gray or white
	changePlayerColour(MIS_TEAM_CHARLIE, (PLAYER_COLOR !== 5) ? 5 : 11); // Charlie to blue or bright blue
	changePlayerColour(MIS_TEAM_GOLF, (PLAYER_COLOR !== 7) ? 7 : 0); // Golf to cyan or green

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_collectiveResearch, MIS_LZ_SCAVS);
	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);
	camCompleteRequiredResearch(camA2L6AllyResearch, MIS_TEAM_CHARLIE);
	camCompleteRequiredResearch(camA2L6AllyResearch, MIS_TEAM_GOLF);

	// Apply a -75% sensor range debuff on all allies and enemies for the "stealth" section
	camCompleteRequiredResearch(["R-Script-Sensor-Debuff"], CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(["R-Script-Sensor-Debuff"], MIS_LZ_SCAVS);
	camCompleteRequiredResearch(["R-Script-Sensor-Debuff"], MIS_TEAM_CHARLIE);
	camCompleteRequiredResearch(["R-Script-Sensor-Debuff"], MIS_TEAM_GOLF);

	setAlliance(MIS_TEAM_CHARLIE, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_TEAM_GOLF, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_TEAM_CHARLIE, MIS_TEAM_GOLF, true);
	setAlliance(MIS_LZ_SCAVS, CAM_THE_COLLECTIVE, true);

	camSetArtifacts({
		"colResearch": { tech: "R-Wpn-Rocket-ROF02" }, // Rocket Autoloader Mk2
		"colFactory3": { tech: "R-Wpn-Cannon4AMk1" }, // Hyper Velocity Cannon
		"colCC2": { tech: "R-Sys-Engineering02" }, // Improved Engineering
	});

	camSetEnemyBases({
		"scavLZBase": {
			cleanup: "lzScavBase",
			detectMsg: "CSCAV_BASE_LZ",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"colBasinOutpost": {
			cleanup: "colBase1",
			detectMsg: "COL_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"colSouthCanalRoadblock": {
			cleanup: "colBase2",
			detectMsg: "COL_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"colNorthCanalBase": {
			cleanup: "colBase3",
			detectMsg: "COL_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colSouthCanalBase": {
			cleanup: "colBase4",
			detectMsg: "COL_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colEastCanalBase": {
			cleanup: "colBase5",
			detectMsg: "COL_BASE5",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colCraterBase": {
			cleanup: "colBase6",
			detectMsg: "COL_BASE6",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colMainBase": {
			cleanup: "colBase7",
			detectMsg: "COL_BASE7",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"cScavCanalBase": {
			cleanup: "cScavBase",
			detectMsg: "CSCAV_BASE",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		// Allied LZs:
		"charlieLZ": {
			cleanup: "charlieStructZone",
			friendly: true,
			player: MIS_TEAM_CHARLIE
		},
		"golfLZ": {
			cleanup: "golfStructZone",
			friendly: true,
			player: MIS_TEAM_GOLF
		},
	});

	camSetFactories({
		"colFactory1": {
			assembly: "colAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 65
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(48)),
			templates: [ cTempl.commcant, cTempl.comhmgt, cTempl.colmrat, cTempl.colaaht ] // Various light/medium units
		},
		"colFactory2": {
			assembly: "colAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 65
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(48)),
			templates: [ cTempl.commcant, cTempl.colhmght, cTempl.colmrat, cTempl.colflamt ] // Various light/medium units
		},
		"colFactory3": {
			assembly: "colAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 65
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(55)),
			templates: [ cTempl.combbh, cTempl.commrah, cTempl.comhpvh ] // Hovers
		},
		"colFactory4": {
			assembly: "colAssembly4",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			templates: [  ] // Empty for now
		},
		"colCybFactory1": {
			assembly: "colCybAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 35
			},
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(32)),
			templates: [ cTempl.cybgr ] // All Grenadiers
		},
		"colCybFactory2": {
			assembly: "colCybAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 35
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(42)),
			templates: [ cTempl.cybla, cTempl.cybgr ] // Lancers and Grenadiers
		},
		"colCybFactory3": {
			assembly: "colCybAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 35
			},
			groupSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(36)),
			templates: [ cTempl.cybca, cTempl.cybhg ] // Heavy Gunners and Heavy Machinegunners
		},
		"colCybFactory4": {
			assembly: "colCybAssembly4",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 35
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(34)),
			templates: [ cTempl.cybgr, cTempl.cybhg ] // Grenadiers and Heavy Machinegunners
		},
		"colCybFactory5": {
			assembly: "colCybAssembly5",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			templates: [  ] // Empty for now
		},
		"cScavFactory1": {
			assembly: "cScavAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 2,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			templates: [ cTempl.bloke, cTempl.buggy, cTempl.rbjeep, cTempl.lance, cTempl.buscan ] // Random stuff
		},
		"cScavFactory2": {
			assembly: "cScavAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(42)),
			templates: [ cTempl.buscan, cTempl.monhmg, cTempl.minitruck, cTempl.gbjeep, cTempl.monfire, cTempl.monmrl ] // Durable stuff
		},
		"cScavFactory3": {
			assembly: "cScavAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(32)),
			templates: [ cTempl.minitruck, cTempl.flatmrl, cTempl.firetruck, cTempl.lance, cTempl.rbuggy, cTempl.gbjeep, cTempl.flatat ] // Stuff that hurts
		},
		"lzScavFactory": {
			assembly: "lzAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 1,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(8)),
			templates: [ cTempl.bloke, cTempl.lance, cTempl.bloke, cTempl.trike ]
		},
	});

	camAutoReplaceObjectLabel(["heliTower", "colCC1"])

	stealthPhase = true;
	playerHidden = true;

	// Add beacons for the player's objectives
	hackAddMessage("CLEAR_LZ", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("PRISON_SITE", PROX_MSG, CAM_HUMAN_PLAYER);

	// Shrink the map boundaries
	setScrollLimits(0, 32, 32, 56);

	// Rank up the commanders on the map
	const CHARLIE_RANK = "Trained";
	const COL_RANK1 = (difficulty < HARD) ? "Trained" : "Regular";
	const COL_RANK2 = (difficulty < HARD) ? "Regular" : "Professional";
	camSetDroidRank(getObject("charlieCommander"), CHARLIE_RANK);
	camSetDroidRank(getObject("colCommander1"), COL_RANK1);
	camSetDroidRank(getObject("colCommander2"), COL_RANK2);
}