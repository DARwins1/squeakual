include("script/campaign/transitionTech.js");
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

function vtolAttack()
{
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
	const CORE_SIZE = 4 + camRand(5);
	const FODDER_SIZE = 14 + camRand(3);

	const nTrenchCoreDroids = [
		cTempl.stinger, cTempl.infbloke, cTempl.infkevbloke,
		cTempl.infminitruck, cTempl.infbuggy, cTempl.infrbuggy,
		cTempl.infcybhg, cTempl.infcybca, cTempl.infcolpodt
	];
	const neCoreDroids = [
		cTempl.stinger, cTempl.infbloke, cTempl.infkevbloke,
		cTempl.infminitruck, cTempl.infbuggy, cTempl.infrbuggy,
		cTempl.infcybhg, cTempl.infcybca, cTempl.infcolpodt
	];
	const seCoreDroids = [
		cTempl.basher, cTempl.inffiretruck, cTempl.infkevbloke,
		cTempl.inflance, cTempl.infbuggy, cTempl.infrbuggy
	];
	const canalCoreDroids = [
		cTempl.basher, cTempl.inffiretruck, cTempl.infkevbloke,
		cTempl.inflance, cTempl.infbuggy, cTempl.infrbuggy
	];
	const southCoreDroids = [
		cTempl.basher, cTempl.inffiretruck, cTempl.infkevbloke,
		cTempl.inflance, cTempl.infbuggy, cTempl.infrbuggy
	];
	const swCoreDroids = [
		cTempl.basher, cTempl.inffiretruck, cTempl.infkevbloke,
		cTempl.inflance, cTempl.infbuggy, cTempl.infrbuggy
	];

	// North trench entrances
	// Choose one to spawn from...
	const northEntrances = ["infEntry1", "infEntry2"];
	const northTrenchEntrance = getObject(northEntrances[camRand(northEntrances.length)]);
	const nTrenchDroids = camRandInfTemplates(nTrenchCoreDroids, CORE_SIZE / 2, FODDER_SIZE * 2/3);
	camSendReinforcement(CAM_INFESTED, northTrenchEntrance, nTrenchDroids, CAM_REINFORCE_GROUND);

	// North east entrances
	// Choose one to spawn from...
	const neEntrances = ["infEntry3", "infEntry4"];
	const northeastEntrance = getObject(neEntrances[camRand(neEntrances.length)]);
	const neDroids = camRandInfTemplates(neCoreDroids, CORE_SIZE / 2, FODDER_SIZE * 2/3);
	camSendReinforcement(CAM_INFESTED, northeastEntrance, neDroids, CAM_REINFORCE_GROUND);

	// South east entrances (Gets weaker when factory is destroyed)
	// Choose one to spawn from...
	const seEntrances = ["infEntry5", "infEntry6"];
	const southwestEntrance = getObject(seEntrances[camRand(seEntrances.length)]);
	const SEFACT_DESTROYED = (getObject("infFactory1") === null);
	const seDroids = camRandInfTemplates(seCoreDroids, ((SEFACT_DESTROYED) ? CORE_SIZE / 2 : CORE_SIZE), ((SEFACT_DESTROYED) ? 2/3 * FODDER_SIZE : FODDER_SIZE));
	const seOrderData = {order: CAM_ORDER_ATTACK, data: {targetPlayer: (SEFACT_DESTROYED) ? undefined : CAM_HUMAN_PLAYER}}; // Focus on the player until the factory is destroyed
	camSendReinforcement(CAM_INFESTED, southwestEntrance, seDroids, CAM_REINFORCE_GROUND, seOrderData);

	// South canal entrances
	const canalEntrances = ["infEntry7", "infEntry9"];
	const canalEntrance = getObject(canalEntrances[camRand(canalEntrances.length)]);
	const canalDroids = camRandInfTemplates(canalCoreDroids, CORE_SIZE, FODDER_SIZE);
	camSendReinforcement(CAM_INFESTED, canalEntrance, canalDroids, CAM_REINFORCE_GROUND);

	// South canal high ground entrance
	// (Stops when factory is destroyed)
	if (getObject("infFactory2") !== null)
	{
		const southDroids = camRandInfTemplates(southCoreDroids, CORE_SIZE, FODDER_SIZE);
		camSendReinforcement(CAM_INFESTED, getObject("infEntry8"), southDroids, CAM_REINFORCE_GROUND);
	}

	// South west trench entrances
	// (Only if the main depot base is eradicated)
	if (camBaseIsEliminated("colDepotBase"))
	{
		// Choose one to spawn from...
		const swEntrances = ["infEntry10", "infEntry11"];
		const southwestEntrance = getObject(swEntrances[camRand(swEntrances.length)]);
		const swDroids = camRandInfTemplates(swCoreDroids, CORE_SIZE, FODDER_SIZE);
		camSendReinforcement(CAM_INFESTED, southwestEntrance, swDroids, CAM_REINFORCE_GROUND);
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
		"colResearch": { tech: "R-Vehicle-Metals04" }, // Dense Composite Alloys
		"colFactory3": { tech: "R-Wpn-Rocket07-Tank-Killer" }, // Tank Killer
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
		"cScavTrenchBase": {
			cleanup: "cScavBase",
			detectMsg: "CSCAV_BASE",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
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
			templates: [ cTempl.comhatht, cTempl.commraht, cTempl.comaght, cTempl.comacanht, cTempl.comhatht ]
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
			assembly: "infAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(12)),
			// Infested civilians, with some occasional vehicles
			templates: [cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.infciv, cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.infbuscan]
		},
		"infFactory2": {
			assembly: "infAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(12)),
			// Infested civilians, with some occasional vehicles
			templates: [cTempl.infciv, cTempl.infrbjeep, cTempl.infciv, cTempl.inflance, cTempl.infciv, cTempl.infbjeep, cTempl.infciv]
		},
	});

	// Set up Collective trucks...
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 45 : 90));
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colWestRoadblock",
		rebuildTruck: true,
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		truckDroid: getObject("colTruck1"),
		structset: camAreaToStructSet("colBase1")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colEastRoadblock",
		rebuildTruck: true,
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		truckDroid: getObject("colTruck2"),
		structset: camAreaToStructSet("colBase2")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colSouthEastBase",
		rebuildTruck: true,
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		truckDroid: getObject("colTruck3"),
		structset: camAreaToStructSet("colBase4")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colOverlook",
		rebuildTruck: true,
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		truckDroid: getObject("colTruck4"),
		structset: camAreaToStructSet("colBase5")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colDepotBase",
		rebuildTruck: true,
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		truckDroid: getObject("colTruck5"),
		structset: camAreaToStructSet("colBase6")
	});

	if (tweakOptions.rec_timerlessMode)
	{
		// TODO: Cranes and more trucks...
	}
	else
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
	camMakeRefillableGroup(camMakeGroup("colCommandGroup"), {
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
	camMakeRefillableGroup(undefined, {
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
	})
	camMakeRefillableGroup(undefined, {
		templates: [
			cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, // 4 Bombards
		],
		factories: ["colFactory2"],
		obj: "colSensor"
	}, CAM_ORDER_FOLLOW, {
		leader: "colSensor",
		repair: 60,
		suborder: CAM_ORDER_DEFEND,
		pos: camMakePos("colAssembly2")
	})

	camAutoReplaceObjectLabel("colCC");
	// Start these factories immediately...
	camEnableFactory("infFactory1");
	camEnableFactory("infFactory2");
	camEnableFactory("cScavFactory");
	camEnableFactory("colCybFactory2");

	queue("groupAttack1", camChangeOnDiff(camMinutesToMilliseconds(4)));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(6)));
	queue("groupAttack2", camChangeOnDiff(camMinutesToMilliseconds(12)));
	queue("commanderAttack", camChangeOnDiff(camMinutesToMilliseconds(22)));
	// sendInfestedReinforcements();
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