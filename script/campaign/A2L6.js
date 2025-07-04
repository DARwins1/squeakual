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
	"R-Wpn-MG-Damage04", "R-Wpn-Rocket-Damage05", "R-Wpn-Mortar-Damage04", 
	"R-Wpn-Flamer-Damage03", "R-Wpn-Cannon-Damage04", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals03", "R-Struc-Materials03", 
	"R-Defense-WallUpgrade03", "R-Sys-Engineering02", "R-Cyborg-Metals03",
	"R-Wpn-Cannon-Accuracy01", "R-Wpn-Rocket-Accuracy02", "R-Wpn-AAGun-ROF01",
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine03", "R-Wpn-AAGun-Accuracy01",
	"R-Struc-RprFac-Upgrade01", "R-Wpn-Mortar-Acc01",
];
const mis_infestedResearch = [
	"R-Wpn-MG-Damage03", "R-Wpn-Rocket-Damage03", "R-Wpn-Mortar-Damage03", 
	"R-Wpn-Flamer-Damage03", "R-Wpn-Cannon-Damage03", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals03", "R-Struc-Materials03", 
	"R-Defense-WallUpgrade03", "R-Cyborg-Metals03", "R-Wpn-AAGun-ROF01", 
	"R-Wpn-AAGun-Damage01", "R-Vehicle-Engine03",
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
	playSound(cam_sounds.enemyVtolsDetected);

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
	playSound(cam_sounds.enemyVtolsDetected);

	const templates = [cTempl.colatv, ((difficulty >= HARD) ? cTempl.comhbombv : cTempl.combombv)]; // Lancers and Cluster Bombs (or HEAP Bombs on Hard+)
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
	if (victim.player === CAM_INFESTED)
	{
		if (attacker.player === MIS_TEAM_CHARLIE || attacker.player === MIS_TEAM_GOLF)
		{
			// An ally has encountered the Infested
			camCallOnce("allyInfestedDialogue");
		}
		else if (attacker.player === CAM_HUMAN_PLAYER)
		{
			// The player has encountered the Infested
			camCallOnce("playerInfestedDialogue");
		}
	}
}

function activateLzScavs()
{
	// Undo the sensor debuff
	camCompleteRequiredResearch(["R-Script-Sensor-Debuff-Undo"], MIS_LZ_SCAVS);
	// NOTE: This part is timed even in timerless mode!
	setMissionTime(camChangeOnDiff(70));
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

	// Dialogue about reinforcements and clear LZs
	camQueueDialogue([
		{text: "LIEUTENANT: Good job, Bravo. Your LZ is secure.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Call in the reinforcements you need, but do not engage the Collective base.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We need to wait until the other teams are ready and in place.", delay: 3, sound: CAM_RCLICK},
		// Long delay...
		{text: "CHARLIE: Team Charlie here; our LZ is secure.", delay: 16, sound: CAM_RCLICK},
		{text: "CHARLIE: We're standing by for your signal, Lieutenant.", delay: 3, sound: CAM_RCLICK},
		// Long delay...
		{text: "GOLF: Team Golf here, we're ready to go.", delay: 12, sound: CAM_RCLICK},
		{text: "GOLF: Let's break that prison and get everyone home in one piece.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: General, all teams are ready to assault the Collective's prisoner camp.", delay: 5, sound: CAM_RCLICK},
		{text: "CLAYDE: Perfect. I'm deploying my diversion now.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: Lieutenant, you're in charge of the assault.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Destroy that camp, and get our people home safely.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: General Clayde, signing off.", delay: 3, sound: CAM_RCLICK},
	]);

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A2L7", {
		reinforcements: camMinutesToSeconds(1.75),
		area: "compromiseZone",
		callback: "playerDetected", // Will change once the stealth phase is officially "ended"
		retlz: true,
	});
	setReinforcementTime(30); // The first transport is much faster
	camSetExtraObjectiveMessage("Avoid detection by the Collective");

	queue("endStealthPhase", camSecondsToMilliseconds(60));
	queue("sendCollectiveScouts", camChangeOnDiff(camMinutesToMilliseconds(4)));
}

function resetReinforcementTime()
{
	setReinforcementTime(camMinutesToSeconds(1.75)); // Revert to standard reinforcement time after the first transport
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

	if (!playerHidden) return; // Don't play dialogue if the player has already been revealed
	// Dialogue warning of Collective scouts
	camQueueDialogue([
		{text: "LIEUTENANT: Team Bravo, I'm detecting increased comms traffic near your position.", delay: 0, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Seems like they're wondering why that outpost hasn't reported back.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Your cover won't last much longer, get ready to fight!", delay: 3, sound: CAM_RCLICK},
	]);
}

// End the stealth phase expand the map
function endStealthPhase()
{
	stealthPhase = false;

	camCallOnce("stealthBreakDialogue");

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A2L7", {
		reinforcements: camMinutesToSeconds(1.75),
		area: "compromiseZone",
		retlz: true,
		callback: "campClear", // No longer fail when detected
	});
	camSetExtraObjectiveMessage("Clear the Collective prison camp");

	// Expand the map boundaries
	setScrollLimits(0, 0, 160, 56);

	// HACK: Move the sun position slightly to avoid weird shadows when expanding the map
	camSetSunPos(-225.0, -601.0, 450.0);
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
	camMakeRefillableGroup(
		camMakeGroup("colCommandGroup1"), {
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
	camMakeRefillableGroup(
		camMakeGroup("colCommandGroup2"), {
			templates: commandTemplates2,
			factories: ["colFactory4", "colCybFactory5"],
			obj: "colCommander2"
		}, CAM_ORDER_FOLLOW, {
			leader: "colCommander2",
			repair: 60,
			suborder: CAM_ORDER_ATTACK
	});
	camMakeRefillableGroup(
		undefined, {
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
	charlieCommander = camMakeRefillableGroup(
		camMakeGroup("charlieCommander"), {
			templates: [cTempl.plmcomht]
		}, CAM_ORDER_ATTACK, {
			repair: 50
	});
	charlieCommandGroup = camMakeRefillableGroup(
		camMakeGroup("charlieCommandGroup"), {
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
	golfSensor = camMakeRefillableGroup(
		camMakeGroup("golfSensor"), {
			templates: [cTempl.plmsenst]
		}, CAM_ORDER_ATTACK, {
			pos: camMakePos("patrolPos8"), // Focus on the northern route
			repair: 50
	});
	golfSensorGroup = camMakeRefillableGroup(
		camMakeGroup("golfSensorGroup"), {
			templates: [cTempl.plmhmortt, cTempl.plmhmortt, cTempl.plmhmortt, cTempl.plmhmortt]
		}, CAM_ORDER_FOLLOW, {
			leader: "golfSensor",
			repair: 50,
			suborder: CAM_ORDER_DEFEND,
			data: {pos: camMakePos("landingZoneGolf")}
	});
	golfAttackGroup = camMakeRefillableGroup(
		camMakeGroup("golfAttackGroup"), {
			templates: [
				cTempl.plmmcant, cTempl.plmmcant, cTempl.plmmcant, cTempl.plmmcant,
				cTempl.plmmrat, cTempl.plmmrat, cTempl.plmmrat, cTempl.plmmrat
			]
		}, CAM_ORDER_ATTACK, {
			pos: camMakePos("patrolPos8"), // Focus on the northern route
			repair: 50
	});
	golfVtolGroup = camMakeRefillableGroup(
		camMakeGroup("golfVtolGroup"), {
			templates: [cTempl.pllbombv, cTempl.pllbombv, cTempl.pllbombv, cTempl.pllbombv, cTempl.pllbombv, cTempl.pllbombv]
		}, CAM_ORDER_ATTACK, {
			repair: 50
	});

	// Set up trucks
	// Collective trucks
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 35 : 70));
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colBasinOutpost",
			respawnDelay: TRUCK_TIME,
			template: cTempl.coltruckht,
			structset: camAreaToStructSet("colBase1").filter((struct) => (!camIsScavStruct(struct.stat)))
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSouthCanalRoadblock",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			template: cTempl.coltruckht,
			structset: camAreaToStructSet("colBase2")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colNorthCanalBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			template: cTempl.comtruckt,
			structset: camAreaToStructSet("colBase3")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSouthCanalBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			template: cTempl.comtruckt,
			structset: camAreaToStructSet("colBase4")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colEastCanalBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			template: cTempl.comtruckt,
			structset: camAreaToStructSet("colBase5")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colCraterBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			template: cTempl.coltruckht,
			structset: camAreaToStructSet("colBase6")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colMainBase",
			respawnDelay: TRUCK_TIME / 2,
			rebuildBase: tweakOptions.rec_timerlessMode,
			template: cTempl.comtruckt,
			structset: camAreaToStructSet("colBase7")
	});
	if (tweakOptions.rec_timerlessMode)
	{
		const CRANE_TIME = camChangeOnDiff(camSecondsToMilliseconds(70));
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "colBasinOutpost",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("colBase1").filter((struct) => (camIsScavStruct(struct.stat)))
		});
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "cScavCanalBase",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("cScavBase").filter((struct) => (camIsScavStruct(struct.stat)))
		});
		if (difficulty >= MEDIUM)
		{
			// Add another crane to the central scav base
			camManageTrucks(
				CAM_THE_COLLECTIVE, {
					label: "cScavCanalBase",
					rebuildBase: true,
					respawnDelay: CRANE_TIME,
					template: cTempl.crane,
					structset: camAreaToStructSet("cScavBase").filter((struct) => (camIsScavStruct(struct.stat)))
			});
		}
		if (difficulty >= HARD)
		{
			// Add even more trucks...
			camManageTrucks(
				CAM_THE_COLLECTIVE, {
					label: "colNorthCanalBase",
					respawnDelay: TRUCK_TIME * 2,
					rebuildBase: tweakOptions.rec_timerlessMode,
					template: cTempl.comtruckht,
					structset: camAreaToStructSet("colBase3")
			});
			camManageTrucks(
				CAM_THE_COLLECTIVE, {
					label: "colMainBase",
					respawnDelay: TRUCK_TIME,
					rebuildBase: tweakOptions.rec_timerlessMode,
					template: cTempl.comtruckht,
					structset: camAreaToStructSet("colBase7")
			});
		}
	}
	// Allied Trucks
	charlieTruckJob1 = camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieLZ",
			rebuildBase: true,
			truckDroid: getObject("charlieEngineer"),
			structset: camAreaToStructSet("charlieStructZone")
	});
	golfTruckJob1 = camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfLZ",
			rebuildBase: true,
			truckDroid: getObject("golfTruck1"),
			structset: camAreaToStructSet("golfStructZone")
	});
	golfTruckJob2 = camManageTrucks(
		MIS_TEAM_GOLF, {
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

	// Dialogue when the cool epic fighting starts
	camQueueDialogue([
		{text: "GOLF: Fire at will!", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: Let's move!", delay: 1, sound: CAM_RCLICK},
		{text: "GOLF: We can't stop until we breach that camp!", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: Push up before they can regroup!", delay: 5, sound: CAM_RCLICK},
	]);

	// Grant vision of allied objects to the player
	camSetObjectVision(MIS_TEAM_CHARLIE);
	camSetObjectVision(MIS_TEAM_GOLF);

	// Ensure the player can't attack the prisoner safehouses
	setAlliance(MIS_LZ_SCAVS, CAM_HUMAN_PLAYER, true);
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
		camCallOnce("landingDialogue");

		if (camBaseIsEliminated("scavLZBase"))
		{
			camCallOnce("resetReinforcementTime");
		}
		return; // don't care afterwards
	}

	const transDroids = camGetTransporterDroids(transport.player);
	let truckJobs = [];
	let otherGroups = [];
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

	// Dialogue about Clayde's diversion
	camQueueDialogue([
		{text: "CHARLIE: Lieutenant! It looks like the General's plan is working!", delay: 0, sound: CAM_RCLICK},
		{text: "CHARLIE: Whatever he's doing, Collective aren't bringing in any reinforcements!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Yes, I haven't detected any Collective transports.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: But be careful, the Collective are likely to regroup and counter attack soon.", delay: 3, sound: CAM_RCLICK},
	]);
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
	camCallOnce("diversionDialogue");
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
		droids.push(camRandFrom(list));
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

// Dialogue telling the player to clear the LZ
function landingDialogue()
{
	camQueueDialogue([
		{text: "LIEUTENANT: Commander Bravo, you'll need to neutralize the small outpost next to your LZ.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Remember that once you attack, you'll only have a small window of time before that outpost alerts the main base to our presence.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Make sure that you destroy it before it can sound the alarm.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We can't let the Collective know we're here yet.", delay: 3, sound: CAM_RCLICK},
	]);
}

// Dialogue telling the player that they can break stealth
function stealthBreakDialogue()
{
	if (!playerHidden) return; // Don't play if the player has already been revealed
	camQueueDialogue([
		{text: "LIEUTENANT: Commander Bravo, I'll leave the first strike to you.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Once you open fire, Commanders Charlie and Golf will support you.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Remember; even though Clayde's diversion should prevent enemy reinforcements, the Collective are sure to have a large force stationed here.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Make sure you're ready when you attack, because there's no going back now...", delay: 4, sound: CAM_RCLICK},
	]);
}

// Dialogue on Clayde's mysteriously effective diversion
// Called when the final factories activate, or when the first Infested group spawns
function diversionDialogue()
{
	camQueueDialogue([
		{text: "LIEUTENANT: Whatever the General's been doing, it's surely working...", delay: 0, sound: CAM_RCLICK},
		{text: "LIEUTENANT: I'm picking up activity all over the city.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: The Collective is scrambling their forces all over the map...", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...But where did Clayde get the manpower to attack all of these places at once?", delay: 5, sound: CAM_RCLICK},
		{text: "GOLF: Who cares?", delay: 3, sound: CAM_RCLICK},
		{text: "GOLF: Now we can put the hurt on these Collective dummies.", delay: 1, sound: CAM_RCLICK},
		{text: "GOLF: And I've just been ITCHING for some payback!", delay: 3, sound: CAM_RCLICK},
	]);
}

// Dialogue on an ally encountering the Infested
function allyInfestedDialogue()
{
	camQueueDialogue([
		{text: "GOLF: Lieutenant, sir... uhh", delay: 0, sound: CAM_RCLICK},
		{text: "GOLF: We seemed to have encountered some unknown forces.", delay: 2, sound: CAM_RCLICK},
		{text: "GOLF: They seem very hostile...", delay: 2, sound: CAM_RCLICK},
		{text: "GOLF: ...and VERY ugly, sir.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Commander Golf, can you give any more details?", delay: 3, sound: CAM_RCLICK},
		{text: "GOLF: ...Oops, They're dead. Heh, heh heh.", delay: 4, sound: CAM_RCLICK},
		{text: "GOLF: Hey, wait! Here comes more of em!", delay: 4, sound: CAM_RCLICK},
		{text: "GOLF: Light em up!", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Commander Golf?!", delay: 3, sound: CAM_RCLICK},
	]);
}

// Dialogue on the player encountering the Infested
function playerInfestedDialogue()
{
	camQueueDialogue([
		{text: "CHARLIE: Are those things...", delay: 4},
		{text: "CHARLIE: The same things we fought in the mountains...?", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: The things that team Alpha...", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: This can't be happening..!", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Oh, Clayde...", delay: 3},
		{text: "LIEUTENANT: ...What have you done..?", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: Lieutenant!", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: We still need to bust that Collective prison!", delay: 2, sound: CAM_RCLICK},
		{text: "GOLF: Yeah, these ugly creeps can't stop us!", delay: 3, sound: CAM_RCLICK},
		{text: "GOLF: We've gotta save our guys!", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...", delay: 4},
	]);
}

// Dialogue when the main camp is secure
function campClearDialogue()
{
	playSound(cam_sounds.objective.primObjectiveCompleted);
	
	camQueueDialogue([
		{text: "CHARLIE: Bravo!", delay: 4},
		{text: "CHARLIE: You've gotta get back to base, man.", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: The Collective is gonna assault you any minute now!", delay: 3, sound: CAM_RCLICK},
		{text: "GOLF: Don't worry about us, Bravo.", delay: 3, sound: CAM_RCLICK},
		{text: "GOLF: We'll get these guys back safe and sound.", delay: 3},
		{text: "GOLF: You just worry about saving your own hide!", delay: 3},
		{text: "GOLF: We can handle the rest from here.", delay: 3},
	]);
}

// Start sending Infested waves once the player progresses far enough
function sendInfestedReinforcements()
{
	// NE entrance
	if (camBaseIsEliminated("colCraterBase") || camBaseIsEliminated("colMainBase"))
	{
		camCallOnce("diversionDialogue");
		const droids = [cTempl.stinger, cTempl.infbloke, cTempl.infkevbloke, cTempl.infminitruck, cTempl.infbuggy, cTempl.infrbuggy];
		camSendReinforcement(CAM_INFESTED, getObject("infestedEntry3"), randomizeTemplates(droids), CAM_REINFORCE_GROUND);
	}

	// SE entrances
	if (camBaseIsEliminated("colEastCanalBase") || camBaseIsEliminated("colMainBase"))
	{
		camCallOnce("diversionDialogue");
		const droids1 = [cTempl.stinger, cTempl.inffiretruck, cTempl.infkevbloke, cTempl.inflance, cTempl.infbuggy, cTempl.infrbuggy];
		camSendReinforcement(CAM_INFESTED, getObject("infestedEntry1"), randomizeTemplates(droids1), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}} // Annoy the player specifically
		);

		const droids2 = [cTempl.stinger, cTempl.infkevlance, cTempl.infbuscan, cTempl.infbloke, cTempl.infbjeep, cTempl.infrbjeep];
		camSendReinforcement(CAM_INFESTED, getObject("infestedEntry2"), randomizeTemplates(droids2), CAM_REINFORCE_GROUND);
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
		camCallOnce("campClearDialogue");
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
	changePlayerColour(MIS_TEAM_CHARLIE, (PLAYER_COLOR !== 11) ? 11 : 5); // Charlie to bright blue or blue
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
	setAlliance(MIS_LZ_SCAVS, MIS_TEAM_CHARLIE, true);
	setAlliance(MIS_LZ_SCAVS, MIS_TEAM_GOLF, true);
	setAlliance(MIS_LZ_SCAVS, CAM_INFESTED, true);

	camSetArtifacts({
		"colResearch": { tech: "R-Wpn-Rocket-Accuracy03" }, // Rocket Laser Designator
		"colFactory3": { tech: "R-Wpn-Cannon4AMk1" }, // Hyper Velocity Cannon
		"colCybFactory4": { tech: "R-Cyb-Hvywpn-Grenade" }, // Super Heavy Grenadier
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
			player: CAM_THE_COLLECTIVE
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
			templates: [ cTempl.cybgr, cTempl.cybhg ] // Grenadiers and Heavy Machinegunners
		},
		"colCybFactory2": {
			assembly: "colCybAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 35
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(42)),
			templates: [ cTempl.cybla, cTempl.cybfl ] // Lancers and Flamers
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
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(34)),
			templates: [ cTempl.cybgr, cTempl.cybgr, cTempl.cybgr, cTempl.scygr ] // Grenadiers and Super Heavy Grenadiers
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
			templates: [ cTempl.buscan, cTempl.monhmg, cTempl.minitruck, cTempl.gbjeep, cTempl.monfire, cTempl.monmrl ] // Durable stuff (at least in terms of scavenger stuff)
		},
		"cScavFactory3": {
			assembly: "cScavAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(32)),
			templates: [ cTempl.minitruck, cTempl.flatmrl, cTempl.firetruck, cTempl.kevlance, cTempl.rbuggy, cTempl.gbjeep, cTempl.flatat ] // Stuff that hurts
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

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	// Shift the sun slightly the east
	camSetSunPos(-225.0, -600.0, 450.0);
	camSetSunIntensity(.45,.45,.5);
	camSetWeather(CAM_WEATHER_RAINSTORM);
}