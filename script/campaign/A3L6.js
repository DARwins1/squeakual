include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_collectiveResearch = [
	"R-Wpn-MG-Damage05", "R-Wpn-Rocket-Damage06", "R-Wpn-Mortar-Damage05", 
	"R-Wpn-Flamer-Damage05", "R-Wpn-Cannon-Damage05", "R-Wpn-MG-ROF03",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals04", "R-Struc-Materials04", 
	"R-Defense-WallUpgrade04", "R-Sys-Engineering02", "R-Cyborg-Metals04",
	"R-Wpn-Cannon-Accuracy02", "R-Wpn-Rocket-Accuracy03", "R-Wpn-AAGun-ROF01",
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine05", "R-Wpn-AAGun-Accuracy01",
	"R-Struc-RprFac-Upgrade02", "R-Wpn-Mortar-Acc01",
];
const mis_infestedResearch = [
	"R-Wpn-MG-Damage04", "R-Wpn-Rocket-Damage03", "R-Wpn-Mortar-Damage04", 
	"R-Wpn-Flamer-Damage03", "R-Wpn-Cannon-Damage03", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF03", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF03", "R-Vehicle-Metals03", "R-Struc-Materials05", 
	"R-Defense-WallUpgrade05", "R-Cyborg-Metals03", "R-Wpn-AAGun-ROF01", 
	"R-Wpn-AAGun-Damage01", "R-Vehicle-Engine03",
];

var colTankGroup1;
var colTankGroup2;
var colCommanderGroup;

var group1Attacking;
var group2Attacking;
var commanderAttacking;

camAreaEvent("vtolRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("vtolRemoveZone", CAM_THE_COLLECTIVE);
});

function heliAttack()
{
	const templates = [cTempl.infhelcan, cTempl.infhelhmg, cTempl.infhelpod];
	const ext = {
		limit: 1,
		alternate: true,
	};
	camSetVtolData(CAM_INFESTED, undefined, "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(0.75)), undefined, ext);
}

function vtolAttack()
{
	playSound(cam_sounds.enemyVtolsDetected);
	
	// Phosphor Bombs, Assault Guns, Cluster Bombs, and Lancers
	const templates = [cTempl.colphosv, cTempl.colagv, cTempl.colbombv, cTempl.colatv];
	const ext = {
		limit: [2, 4, 3, 2],
		alternate: true,
		targetPlayer: CAM_HUMAN_PLAYER,
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), "colCC", ext);
}

function eventDestroyed(obj)
{
	if (obj.type === DROID && obj.player === CAM_THE_COLLECTIVE)
	{
		if (!group1Attacking && obj.group === colTankGroup1)
		{
			// Order the group to attack early
			group1Attacking = true;
			camManageGroup(colTankGroup1, CAM_ORDER_ATTACK, {
				targetPlayer: CAM_HUMAN_PLAYER,
				pos: camMakePos("focusPos3"),
				repair: 35
			});
		}
		if (!group2Attacking && obj.group === colTankGroup2)
		{
			group2Attacking = true;
			camManageGroup(colTankGroup2, CAM_ORDER_ATTACK, {
				targetPlayer: CAM_HUMAN_PLAYER,
				pos: [
					camMakePos("focusPos1"),
					camMakePos("focusPos2"),
					camMakePos("focusPos3"),
				],
				repair: 35
			});
		}
	}
}

// Order the first tank group to attack and enable some factories
function groupAttack1()
{
	group1Attacking = true;
	camManageGroup(colTankGroup1, CAM_ORDER_ATTACK, {
		targetPlayer: CAM_HUMAN_PLAYER,
		pos: camMakePos("focusPos3"),
		repair: 35
	});

	camEnableFactory("colFactory2");
	camEnableFactory("colCybFactory3");
}

// Order the second tank group to attack and enable the remaining factories
function groupAttack2()
{
	group2Attacking = true;
	camManageGroup(colTankGroup2, CAM_ORDER_ATTACK, {
		targetPlayer: CAM_HUMAN_PLAYER,
		pos: [
			camMakePos("focusPos1"),
			camMakePos("focusPos2"),
			camMakePos("focusPos3"),
		],
		repair: 35
	});

	camEnableFactory("colFactory1");
	camEnableFactory("colCybFactory1");
}

// Order the Collective commander to attack the player (if it's still alive)
function commanderAttack()
{
	camManageGroup(colCommanderGroup, CAM_ORDER_ATTACK, {
		targetPlayer: CAM_HUMAN_PLAYER,
		pos: [
			camMakePos("focusPos1"),
			camMakePos("focusPos2"),
			camMakePos("focusPos3"),
		],
		repair: 50
	})
}

// Assign a label to the Collective's sensor droid
function eventDroidBuilt(droid, structure)
{
	if (droid.player === CAM_THE_COLLECTIVE && camDroidMatchesTemplate(droid, cTempl.comsensht))
	{
		addLabel(droid, "colSensor");
	}
}

function sendInfestedReinforcements()
{	
	const coreDroids = [
		[ // Scavs & crawlers
			cTempl.vilestinger, // Vile Stingers
			cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.basher, cTempl.basher, // Bashers
			cTempl.boomtick, // Boom Ticks
			cTempl.infmoncan, cTempl.infmoncan, // Bus Tanks
			cTempl.infmonhmg,
			cTempl.infmonmrl,
			cTempl.infflatmrl, // Flatbeds
			cTempl.infflatat,
			cTempl.infminitruck, // MRP Trucks
			cTempl.infsartruck, // Sarissa Trucks
			cTempl.infbuscan, cTempl.infbuscan, // School Buses
			cTempl.inffiretruck, // Fire Trucks
			cTempl.infbjeep, cTempl.infbjeep, cTempl.infbjeep, // Jeeps
			cTempl.infrbjeep, cTempl.infrbjeep, // Rocket Jeeps
			cTempl.infgbjeep, cTempl.infgbjeep, // Grenade Jeeps
			cTempl.infbuggy, // Buggies
			cTempl.infrbuggy, // Rocket Buggies
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, // Lances
			cTempl.infkevlance, cTempl.infkevlance,
		],
		[ // Light tanks & cyborgs + some scav stuff
			cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.infcybca, cTempl.infcybca, cTempl.infcybca, // Heavy Gunners
			cTempl.infcybhg, cTempl.infcybhg, // Heavy Machinegunners
			cTempl.infcolpodt, cTempl.infcolpodt, // MRPs
			cTempl.infcolhmght, cTempl.infcolhmght, // HMGs
			cTempl.infcolcanht, cTempl.infcolcanht, // Light Cannons
			cTempl.infcommcant, // Medium Cannons
			cTempl.infcomatt, // Lancers
			cTempl.infbuggy, cTempl.infbuggy, cTempl.infbuggy, // Buggies
			cTempl.infrbuggy, cTempl.infrbuggy, // Rocket Buggies
			cTempl.inftrike, cTempl.inftrike, // Trikes
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, cTempl.inflance, cTempl.inflance, // Lances
			cTempl.infkevlance, cTempl.infkevlance,
		],
		[ // Bashers, Stingers, and Infantry
			cTempl.vilestinger, // Vile Stingers
			cTempl.stinger, cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, // Bashers
			cTempl.boomtick, // Boom Ticks
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, // Lances
		],
	];
	const CORE_SIZE = 4;
	const FODDER_SIZE = 14;
	let bChance = 5;
	if (difficulty >= EASY) bChance += 5;
	if (difficulty >= HARD) bChance += 5;
	if (difficulty === INSANE) bChance += 5;

	// North trench entrances
	// Choose one to spawn from...
	const northEntrances = ["infEntry1", "infEntry2"];
	camSendReinforcement(CAM_INFESTED, getObject(camRandFrom(northEntrances)), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance), CAM_REINFORCE_GROUND);

	// North east entrances
	camSendReinforcement(CAM_INFESTED, getObject("infEntry4"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance), CAM_REINFORCE_GROUND);

	// South east entrances
	// Choose one to spawn from...
	const seEntrances = ["infEntry5", "infEntry6"];
	const SEFACT_DESTROYED = (getObject("infFactory1") === null);
	const seOrderData = {order: CAM_ORDER_ATTACK, data: {targetPlayer: (SEFACT_DESTROYED) ? undefined : CAM_HUMAN_PLAYER}}; // Focus on the player until the factory is destroyed
	camSendReinforcement(CAM_INFESTED, getObject(camRandFrom(seEntrances)), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance), CAM_REINFORCE_GROUND, seOrderData);

	// South canal entrances
	const canalEntrances = ["infEntry7", "infEntry9"];
	camSendReinforcement(CAM_INFESTED, getObject(camRandFrom(canalEntrances)), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance), CAM_REINFORCE_GROUND);

	// South canal high ground entrance
	// (Stops when factory is destroyed)
	if (getObject("infFactory2") !== null)
	{
		camSendReinforcement(CAM_INFESTED, getObject("infEntry8"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance), CAM_REINFORCE_GROUND);
	}

	// South west trench entrances
	// (Only if the main depot base is eradicated)
	if (camBaseIsEliminated("colDepotBase"))
	{
		// Choose one to spawn from...
		const swEntrances = ["infEntry10", "infEntry11"];
		camSendReinforcement(CAM_INFESTED, getObject(camRandFrom(swEntrances)), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance), CAM_REINFORCE_GROUND);
	}
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "A3L7S", {
		ignoreInfestedUnits: true
	});

	camSetArtifacts({
		"colResearch": { tech: "R-Wpn-Rocket-ROF03" }, // Rocket Autoloader Mk3
		"colFactory1": { tech: "R-Vehicle-Metals04" }, // Dense Composite Alloys
		"colFactory2": { tech: "R-Wpn-HowitzerMk1" }, // Howitzer
		"colFactory3": { tech: "R-Struc-Factory-Upgrade02" }, // Robotic Manufacturing
		"colCC": { tech: "R-Defense-WallUpgrade05" }, // Supercrete Mk2
		"colAAEmp": { tech: "R-Wpn-AAGun-Damage02" }, // AA HE Flak Mk2
	});

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);

	camSetEnemyBases({
		"colWestRoadblock": {
			cleanup: "colBase1",
			detectMsg: "COL_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colEastRoadblock": {
			cleanup: "colBase2",
			detectMsg: "COL_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colOilOutpost": {
			cleanup: "colBase3",
			detectMsg: "COL_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colSouthEastBase": {
			cleanup: "colBase4",
			detectMsg: "COL_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colOverlook": {
			cleanup: "colBase5",
			detectMsg: "COL_BASE5",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colDepotBase": {
			cleanup: "colBase6",
			detectMsg: "COL_BASE6",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infEastBase": {
			cleanup: "infBase1",
			detectMsg: "INF_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infSouthBase": {
			cleanup: "infBase2",
			detectMsg: "INF_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
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
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(135)),
			// Oops all heavies!
			templates: [ cTempl.cohhcant, cTempl.cohacant, cTempl.cohhrat, cTempl.cohacant, cTempl.cohbbt ]
		},
		"colFactory2": {
			assembly: "colAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 35
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(85)),
			// Medium and heavy tanks
			templates: [ cTempl.cohhcant, cTempl.commrat, cTempl.comacant, cTempl.comagt, cTempl.comatt, cTempl.cominft ]
		},
		"colFactory3": {
			assembly: "colAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 45
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(80)),
			// Half-tracked stuff
			templates: [ cTempl.comhatht, cTempl.commraht, cTempl.comaght, cTempl.comhpvht, cTempl.comhatht ]
		},
		"colCybFactory1": {
			assembly: "colCybAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(65)),
			// Super Cyborgs + Thermite Flamers
			templates: [ cTempl.scyac, cTempl.cybth, cTempl.scytk, cTempl.cybth ]
		},
		"colCybFactory2": {
			assembly: "colCybAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			// Grenadiers...
			templates: [ cTempl.cybgr, cTempl.scygr, cTempl.scygr ]
		},
		"colCybFactory3": {
			assembly: "colCybAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			// Rocket/MG Cyborgs
			templates: [ cTempl.cybla, cTempl.cybth, cTempl.cybla, cTempl.scytk ]
		},
		"infFactory1": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			// Scav vehicles
			templates: [cTempl.infbuscan, cTempl.infmonhmg, cTempl.infsartruck, cTempl.infkevbloke, cTempl.infbuggy, cTempl.infkevlance, cTempl.infmonlan]
		},
		"infFactory2": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(12)),
			// More scav vehicles
			templates: [cTempl.infflatmrl, cTempl.infrbuggy, cTempl.infminitruck, cTempl.infbuscan, cTempl.inffiretruck, cTempl.infkevbloke, cTempl.infgbjeep]
		},
	});

	// Set up Collective trucks...
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 45 : 90));
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colWestRoadblock",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck1"),
			structset: camAreaToStructSet("colBase1")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colEastRoadblock",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck2"),
			structset: camAreaToStructSet("colBase2")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSouthEastBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck3"),
			structset: camAreaToStructSet("colBase4")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colOverlook",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck4"),
			structset: camAreaToStructSet("colBase5")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colDepotBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck5"),
			structset: camAreaToStructSet("colBase6")
	});

	if (tweakOptions.rec_timerlessMode || difficulty === INSANE)
	{
		// Add another truck to the main depot
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "colDepotBase",
				respawnDelay: TRUCK_TIME,
				rebuildBase: tweakOptions.rec_timerlessMode,
				template: cTempl.comtruckt,
				structset: camAreaToStructSet("colBase6")
		});
	}
	if (tweakOptions.rec_timerlessMode && difficulty >= HARD)
	{
		// Add another truck to the southeast base
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "colSouthEastBase",
				respawnDelay: TRUCK_TIME,
				rebuildBase: tweakOptions.rec_timerlessMode,
				template: cTempl.comtruckt,
				structset: camAreaToStructSet("colBase4")
		});
	}
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(75)));
	}

	colTankGroup1 = camMakeGroup("tankGroup1");
	camManageGroup(colTankGroup1, CAM_ORDER_PATROL, {
		pos: [
			camMakePos("tankGroup1"),
			camMakePos("patrolPos3")
		],
		interval: camSecondsToMilliseconds(26),
		repair: 35
	});
	colTankGroup2 = camMakeGroup("tankGroup2");
	camManageGroup(colTankGroup2, CAM_ORDER_PATROL, {
		pos: [
			camMakePos("tankGroup2"),
			camMakePos("patrolPos2")
		],
		interval: camSecondsToMilliseconds(36),
		repair: 35
	});

	// Rank and assign the Collective commander
	// Set the commander's rank (ranges from Professional to Elite)
	const COMMANDER_RANK = (difficulty <= EASY) ? 4 : (difficulty + 2);
	camSetDroidRank(getObject("colCommander"), COMMANDER_RANK);
	colCommanderGroup = camMakeGroup("colCommander");
	camManageGroup(colCommanderGroup, CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos1"),
			camMakePos("patrolPos2"),
			camMakePos("patrolPos3")
		],
		interval: camSecondsToMilliseconds(46),
		repair: 50
	});
	camMakeRefillableGroup(
		camMakeGroup("colCommandGroup"), {
			templates: [
				cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, // 4 Super Auto-Cannons
				cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, // 4 Super Tank Killers
				cTempl.comagt, cTempl.comagt, // 2 Assault Guns
				cTempl.cominft, cTempl.cominft, // 2 Infernos
				cTempl.cohraat, // 1 Whirlwind
				cTempl.comhrept, // 1 Heavy Repair Turret
			],
			factories: ["colFactory1", "colCybFactory1"],
			obj: "colCommander" // Stop refilling this group when the commander dies
		}, CAM_ORDER_FOLLOW, {
			leader: "colCommander",
			repair: 50,
			suborder: CAM_ORDER_ATTACK,
			targetPlayer: CAM_HUMAN_PLAYER
	});

	// Also make refillable mortar/sensor groups
	camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.comsensht, // 1 Sensor
			],
			factories: ["colFactory2"]
		}, CAM_ORDER_ATTACK, {
			repair: 40,
			pos: [
				camMakePos("focusPos1"),
				camMakePos("focusPos2"),
				camMakePos("focusPos3"),
			],
			targetPlayer: CAM_HUMAN_PLAYER
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, // 4 Bombards
				cTempl.cohhowt, cTempl.cohhowt, // 2 Ripple Rockets
			],
			factories: ["colFactory2"],
			obj: "colSensor"
		}, CAM_ORDER_FOLLOW, {
			leader: "colSensor",
			repair: 60,
			suborder: CAM_ORDER_DEFEND,
			pos: camMakePos("colAssembly2")
	});

	camAutoReplaceObjectLabel("colCC");
	// Start these factories immediately...
	camEnableFactory("infFactory1");
	camEnableFactory("infFactory2");
	camEnableFactory("colCybFactory2");

	queue("groupAttack1", camChangeOnDiff(camMinutesToMilliseconds(4)));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(6)));
	queue("groupAttack2", camChangeOnDiff(camMinutesToMilliseconds(12)));
	queue("commanderAttack", camChangeOnDiff(camMinutesToMilliseconds(22)));
	heliAttack();
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(60)));

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

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	// Give the fog a pink hue
	camSetFog(24, 16, 64);
	// Shift the sun towards the west
	camSetSunPos(450.0, -400.0, 225.0);
	// Add a purple-blue tint
	camSetSunIntensity(.45, .4, .5);
}