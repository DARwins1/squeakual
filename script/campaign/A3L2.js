include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const MIS_TEAM_GOLF = 1;

var allowExtraWaves; // Increases the amount of Infested reinforcements as the level progresses

const mis_collectiveResearch = [
	"R-Wpn-MG-Damage04", "R-Wpn-Rocket-Damage05", "R-Wpn-Mortar-Damage04", 
	"R-Wpn-Flamer-Damage04", "R-Wpn-Cannon-Damage04", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals03", "R-Struc-Materials04", 
	"R-Defense-WallUpgrade04", "R-Sys-Engineering02", "R-Cyborg-Metals03",
	"R-Wpn-Cannon-Accuracy02", "R-Wpn-Rocket-Accuracy03", "R-Wpn-AAGun-ROF01",
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine04", "R-Wpn-AAGun-Accuracy01",
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

camAreaEvent("vtolRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("vtolRemoveZone", CAM_THE_COLLECTIVE);
});

function vtolAttack()
{
	playSound(cam_sounds.enemyVtolsDetected);
	
	// Phosphor Bombs, Assault Guns, and Lancers
	const templates = [cTempl.colphosv, cTempl.colagv, cTempl.colatv];
	const ext = {
		limit: [2, 3, 2],
		alternate: true,
		targetPlayer: CAM_HUMAN_PLAYER,
		pos: camMakePos("landingZone"),
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), "colCC", ext);
}

function eventPickup(feature, droid)
{
	if (feature.stattype === ARTIFACT && droid.player === CAM_HUMAN_PLAYER && getLabel(feature) === "convoyCrate")
	{
		// Donate Golf's convoy to the player once they collect the artifact
		const droids = enumDroid(MIS_TEAM_GOLF);
		for (const droid of droids)
		{
			donateObject(droid, CAM_HUMAN_PLAYER);
		}

		playSound(cam_sounds.rescue.groupRescued);
		camSetExtraObjectiveMessage();
	}
}

// Enable the main Collective factory and the south cyborg factory
function activateAllFactories()
{
	camEnableFactory("colFactory");
	camEnableFactory("colCybFactory1");

	allowExtraWaves = true;
}

function sendInfestedReinforcements()
{	
	const coreDroids = [
		[ // Scavs & crawlers
			cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.basher, cTempl.basher, // Bashers
			cTempl.boomtick, // Boom Ticks
			cTempl.infmoncan, cTempl.infmoncan, // Bus Tanks
			cTempl.infmonhmg,
			cTempl.infminitruck, // MRP Trucks
			cTempl.infsartruck, // Sarissa Trucks
			cTempl.infbuscan, cTempl.infbuscan, // School Buses
			cTempl.infbjeep, cTempl.infbjeep, cTempl.infbjeep, // Jeeps
			cTempl.infrbjeep, cTempl.infrbjeep, // Rocket Jeeps
			cTempl.infgbjeep, // Grenade Jeeps
			cTempl.infbuggy, cTempl.infbuggy, // Buggies
			cTempl.infrbuggy, cTempl.infrbuggy, // Rocket Buggies
			cTempl.inftrike, // Trikes
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke,
			cTempl.inflance, cTempl.inflance, // Lances
			cTempl.infkevlance,
		].concat((difficulty >= MEDIUM) ? cTempl.vilestinger : []), // Add a Vile Stinger
		[ // Light tanks & cyborgs + some scav stuff
			cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.infcybca, cTempl.infcybca, // Heavy Gunners
			cTempl.infcybhg, // Heavy Machinegunners
			cTempl.infcolpodt, // MRPs
			cTempl.infcolhmght, // HMGs
			cTempl.infcolcanht, // Light Cannons
			cTempl.infbuggy, cTempl.infbuggy, cTempl.infbuggy, cTempl.infbuggy, // Buggies
			cTempl.infrbuggy, cTempl.infrbuggy, cTempl.infrbuggy, // Rocket Buggies
			cTempl.inftrike, cTempl.inftrike, cTempl.inftrike, // Trikes
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, cTempl.inflance, cTempl.inflance, // Lances
			cTempl.infkevlance, cTempl.infkevlance,
		].concat((difficulty >= MEDIUM) ? cTempl.infcommcant : []), // Add a Medium Cannon tank
	];
	const CORE_SIZE = 4;
	const FODDER_SIZE = 14;
	let bChance = 0;
	if (difficulty >= EASY) bChance += 5;
	if (difficulty >= HARD) bChance += 5;
	if (difficulty === INSANE) bChance += 5;

	// North east entrance
	camSendReinforcement(CAM_INFESTED, getObject("infEntry2"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance), CAM_REINFORCE_GROUND);

	// South canal entrance
	camSendReinforcement(CAM_INFESTED, getObject("infEntry3"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance), CAM_REINFORCE_GROUND);

	// South trench entrance
	if (allowExtraWaves)
	{
		const southData = {order: CAM_ORDER_ATTACK, data: {targetPlayer: ((getObject("infFactory1") !== null) ? CAM_HUMAN_PLAYER : undefined)}};
		camSendReinforcement(CAM_INFESTED, getObject("infEntry4"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance), CAM_REINFORCE_GROUND, southData);

		// South west trench entrance
		// Only starts when the south Collective base is destroyed
		if (camBaseIsEliminated("colSouthBase"))
		{
			camSendReinforcement(CAM_INFESTED, getObject("infEntry5"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance), CAM_REINFORCE_GROUND);
		}
	}

	// North trench entrances
	if (allowExtraWaves)
	{
		// Choose one to spawn from...
		const northTrenchEntrances = ["infEntry7", "infEntry8"];
		const northData = {order: CAM_ORDER_ATTACK, data: {targetPlayer: ((getObject("infFactory2") !== null) ? CAM_HUMAN_PLAYER : undefined)}};
		camSendReinforcement(CAM_INFESTED, getObject(camRandFrom(northTrenchEntrances)), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance), CAM_REINFORCE_GROUND, northData);

		// North west road entrance
		// Only starts when the main Collective base is destroyed
		if (camBaseIsEliminated("colMainBase"))
		{
			camSendReinforcement(CAM_INFESTED, getObject("infEntry9"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance), CAM_REINFORCE_GROUND);
		}
	}
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "A3L3S", {
		ignoreInfestedUnits: true
	});
	camSetExtraObjectiveMessage(_("Locate team Golf's missing convoy"));

	setAlliance(MIS_TEAM_GOLF, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_TEAM_GOLF, CAM_THE_COLLECTIVE, true);
	setAlliance(MIS_TEAM_GOLF, CAM_INFESTED, true);

	changePlayerColour(MIS_TEAM_GOLF, (playerData[0].colour !== 7) ? 7 : 0); // Golf to cyan or green

	camSetArtifacts({
		"colFactory": { tech: "R-Wpn-Rocket02-MRLHvy" }, // Heavy Rocket Array
		"colPower": { tech: "R-Struc-Power-Upgrade01" }, // Gas Turbine Generator
		"convoyCrate": { tech: "R-Wpn-Mortar3" }, // Pepperpot
		"colResearch": { tech: "R-Wpn-Bomb-Damage01" }, // HE Bomb Shells
	});

	camCompleteRequiredResearch(camAct3StartResearch, MIS_TEAM_GOLF);
	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);

	camSetEnemyBases({
		"colSouthBase": {
			cleanup: "colBase1",
			detectMsg: "COL_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colOverlook": {
			cleanup: "colBase2",
			detectMsg: "COL_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colMainBase": {
			cleanup: "colBase3",
			detectMsg: "COL_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infEastBase": {
			cleanup: "infBase1",
			detectMsg: "INF_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infNorthBase": {
			cleanup: "infBase2",
			detectMsg: "INF_BASE2",
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
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(115)),
			// Medium and heavy tanks
			templates: [ cTempl.cohhrat, cTempl.commcant, cTempl.cominft, cTempl.comhmgt, cTempl.comatt, cTempl.comhmgt, cTempl.comhpvt, cTempl.cohhcant ]
		},
		"colCybFactory1": {
			assembly: "colCybAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			// Heavy cyborg support
			templates: [ cTempl.scymc, cTempl.cybla, cTempl.scygr, cTempl.scymc ]
		},
		"colCybFactory2": {
			assembly: "colCybAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 9,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			// Light crowd-killers
			templates: [ cTempl.cybhg, cTempl.cybth, cTempl.cybhg ]
		},
		"infFactory1": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(12)),
			// Light scav vehicles
			templates: [cTempl.infbloke, cTempl.inftrike, cTempl.infrbuggy, cTempl.inflance, cTempl.infgbjeep, cTempl.infbjeep, cTempl.infbuggy, cTempl.infbuscan]
		},
		"infFactory2": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			// Heavy scav vehicles
			templates: [cTempl.infmoncan, cTempl.infkevlance, cTempl.infmonsar, cTempl.infkevbloke, cTempl.infflatmrl, cTempl.infbuscan, cTempl.infkevbloke]
		},
	});

	// Set up Collective trucks...
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 45 : 90))
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSouthBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck1"),
			structset: camAreaToStructSet("colBase1")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colOverlook",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck2"),
			structset: camAreaToStructSet("colBase2")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colMainBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck3"),
			structset: camAreaToStructSet("colBase3")
	});

	if (tweakOptions.rec_timerlessMode)
	{
		// NOTE: No scav cranes on this mission!
		// Add a second truck to the Collective's main base
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "colMainBase",
				respawnDelay: TRUCK_TIME,
				rebuildBase: true,
				template: cTempl.comtruckt,
				structset: camAreaToStructSet("colBase3")
		});
	}
	else
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(70)));
	}

	// Rank and assign the Collective commander
	// Set the commander's rank (ranges from Professional to Elite)
	const COMMANDER_RANK = (difficulty <= EASY) ? 5 : (difficulty + 3);
	camSetDroidRank(getObject("colCommander"), COMMANDER_RANK);
	camManageGroup(camMakeGroup("colCommander"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos1"),
			camMakePos("patrolPos2"),
			camMakePos("patrolPos3")
		],
		interval: camSecondsToMilliseconds(46),
		repair: 70
	});
	camMakeRefillableGroup(
		camMakeGroup("colCommandGroup"), {
			templates: [
				cTempl.cohhcant, cTempl.cohhcant, // 2 Heavy Cannons
				cTempl.comhpvt, cTempl.comhpvt, // 2 HVCs
				cTempl.comatt, cTempl.comatt, cTempl.comatt, cTempl.comatt, // 4 Lancers
				cTempl.comhmgt, cTempl.comhmgt, cTempl.comhmgt, cTempl.comhmgt, // 4 HMGs
				cTempl.cominft, cTempl.cominft, // 2 Infernos
				cTempl.comhaat, cTempl.comhaat, // 2 Cyclones
			],
			factories: ["colFactory"],
			obj: "colCommander" // Stop refilling this group when the commander dies
		}, CAM_ORDER_FOLLOW, {
			leader: "colCommander",
			repair: 50,
			suborder: CAM_ORDER_ATTACK,
			targetPlayer: CAM_HUMAN_PLAYER
	});

	camMakeRefillableGroup(
		camMakeGroup("colRippleGroup"), {
			templates: [
				cTempl.cohript, cTempl.cohript, // 2 Ripple Rockets
			],
			factories: (difficulty >= HARD) ? ["colFactory"] : undefined, // Only refill on Hard+
			obj: "colSensorTower" // Stop refilling this group if the sensor is destroyed
		}, CAM_ORDER_FOLLOW, {
			leader: "colSensorTower",
			suborder: CAM_ORDER_DEFEND, // If the sensor is destroyed, sit around in their own little spot
			pos: camMakePos("colRippleGroup")
	});

	allowExtraWaves = false;

	camAutoReplaceObjectLabel(["colCC", "colSensorTower"]);
	// Most factories are enabled immediately on this mission...
	camEnableFactory("infFactory1");
	camEnableFactory("infFactory2");
	camEnableFactory("colCybFactory2");

	queue("activateAllFactories", camChangeOnDiff(camMinutesToMilliseconds(4)));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(6)));
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

	// Also pre-damage team Golf's convoy
	camSetPreDamageModifier(MIS_TEAM_GOLF, [60, 80]);

	// Give the fog a pink hue
	camSetFog(24, 16, 64);
	// Shift the sun towards the west
	camSetSunPos(450.0, -400.0, 225.0);
	// Add a purple-blue tint
	camSetSunIntensity(.45, .4, .5);
}