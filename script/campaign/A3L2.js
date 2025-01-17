include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const MIS_TEAM_GOLF = 1;

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

function vtolAttack()
{
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
	if (feature.stattype === ARTIFACT && droid.player === CAM_HUMAN_PLAYER && camMakePos(feature).y > 20)
	{
		// Donate Golf's convoy to the player once they collect the artifact
		const droids = enumDroid(MIS_TEAM_GOLF);
		for (const droid of droids)
		{
			donateObject(droid, CAM_HUMAN_PLAYER);
		}

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
	const CORE_SIZE = 4 + camRand(5);
	const FODDER_SIZE = 14 + camRand(3);

	// North east entrances
	// Choose one to spawn from...
	let northeastEntrance;
	switch (camRand(2))
	{
	case 0:
		// Road entrance
		northeastEntrance = getObject("infEntry1");
		break;
	case 1:
		// Trench entrance
		northeastEntrance = getObject("infEntry2");
		break;
	}
	const neDroids = camRandInfTemplates(
		[cTempl.stinger, cTempl.infbloke, cTempl.infkevbloke, cTempl.infminitruck, cTempl.infbuggy, cTempl.infrbuggy, cTempl.infcybhg, cTempl.infcybca, cTempl.infcolpodt], 
		CORE_SIZE / 2, FODDER_SIZE * 2/3
	);
	camSendReinforcement(CAM_INFESTED, northeastEntrance, neDroids, CAM_REINFORCE_GROUND);

	// South canal entrance
	const canalDroids = camRandInfTemplates(
		[cTempl.basher, cTempl.inffiretruck, cTempl.infkevbloke, cTempl.inflance, cTempl.infbuggy, cTempl.infrbuggy],
		CORE_SIZE / 2, 2 * FODDER_SIZE / 3
	);
	camSendReinforcement(CAM_INFESTED, getObject("infEntry3"), canalDroids, CAM_REINFORCE_GROUND);

	// South trench entrance
	// (Gets weaker when factory is destroyed)
	if (allowExtraWaves)
	{
		const southDroids = camRandInfTemplates(
			[cTempl.stinger, cTempl.infkevlance, cTempl.infbuscan, cTempl.infbloke, cTempl.infbjeep, cTempl.infrbjeep, cTempl.infcybca, cTempl.infcolhmght],
			(getObject("infFactory1") !== null) ? CORE_SIZE : CORE_SIZE / 2, (getObject("infFactory1") !== null) ? FODDER_SIZE : 2 * FODDER_SIZE / 3
		);
		// Chance of adding a Medium Cannon
		if (camRand(3) == 0) southDroids.push(cTempl.infcommcant);
		const southData = {order: CAM_ORDER_ATTACK, data: {targetPlayer: ((getObject("infFactory1") !== null) ? CAM_HUMAN_PLAYER : undefined)}};
		camSendReinforcement(CAM_INFESTED, getObject("infEntry4"), southDroids, CAM_REINFORCE_GROUND, southData);

		// South west trench entrance
		// Only starts when the south Collective base is destroyed
		if (camBaseIsEliminated("colSouthBase"))
		{
			const southwestDroids = camRandInfTemplates(
				[cTempl.infkevlance, cTempl.infmoncan, cTempl.infbloke, cTempl.infbjeep, cTempl.infrbjeep],
				CORE_SIZE / 2, 2 * FODDER_SIZE / 3
			);
			camSendReinforcement(CAM_INFESTED, getObject("infEntry5"), southwestDroids, CAM_REINFORCE_GROUND);
		}
	}

	// North trench entrances
	if (allowExtraWaves)
	{
		// Choose one to spawn from...
		let northTrenchEntrance;
		switch (camRand(2))
		{
		case 0:
			// Road entrance
			northTrenchEntrance = getObject("infEntry7");
			break;
		case 1:
			// Trench entrance
			northTrenchEntrance = getObject("infEntry8");
			break;
		}
		// Waves get weaker when factory is destroyed
		const nTrenchDroids = camRandInfTemplates(
			[cTempl.stinger, cTempl.infbloke, cTempl.infkevbloke, cTempl.infminitruck, cTempl.infbuggy, cTempl.infrbuggy, cTempl.infcybhg, cTempl.infcybca, cTempl.infcolpodt], 
			(getObject("infFactory2") !== null) ? CORE_SIZE * 2 : CORE_SIZE, (getObject("infFactory2") !== null) ? FODDER_SIZE * 1.5 : FODDER_SIZE
		);
		const northData = {order: CAM_ORDER_ATTACK, data: {targetPlayer: ((getObject("infFactory2") !== null) ? CAM_HUMAN_PLAYER : undefined)}};
		camSendReinforcement(CAM_INFESTED, northTrenchEntrance, nTrenchDroids, CAM_REINFORCE_GROUND, northData);

		// North west road entrance
		// Only starts when the main Collective base is destroyed
		if (camBaseIsEliminated("colMainBase"))
		{
			const northwestDroids = camRandInfTemplates(
				[cTempl.infkevlance, cTempl.infmoncan, cTempl.infbloke, cTempl.infbjeep, cTempl.infrbjeep],
				CORE_SIZE / 2, 2 * FODDER_SIZE / 3
			);
			camSendReinforcement(CAM_INFESTED, getObject("infEntry9"), northwestDroids, CAM_REINFORCE_GROUND);
		}
	}
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz

	setReinforcementTime(LZ_COMPROMISED_TIME);

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "A3L3S", {
		ignoreInfestedUnits: true
	});
	camSetExtraObjectiveMessage(_("Locate team Golf's missing convoy"))

	setAlliance(MIS_TEAM_GOLF, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_TEAM_GOLF, CAM_THE_COLLECTIVE, true);
	setAlliance(MIS_TEAM_GOLF, CAM_INFESTED, true);

	changePlayerColour(MIS_TEAM_GOLF, (playerData[0].colour !== 7) ? 7 : 0); // Golf to cyan or green

	camSetArtifacts({
		"colFactory": { tech: "R-Wpn-Rocket02-MRLHvy" }, // Heavy Rocket Array
		"convoyCrate": { tech: "R-Wpn-Mortar3" }, // Pepperpot
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
			throttle: camChangeOnDiff(camSecondsToMilliseconds(135)),
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
			groupSize: 4,
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
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			// Light crowd-killers
			templates: [ cTempl.cybhg, cTempl.cybth, cTempl.cybhg ]
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
	});

	// Set up Collective trucks...
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 45 : 90))
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colSouthBase",
		rebuildTruck: true,
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		truckDroid: getObject("colTruck1"),
		structset: camAreaToStructSet("colBase1")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colOverlook",
		rebuildTruck: true,
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		truckDroid: getObject("colTruck2"),
		structset: camAreaToStructSet("colBase2")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colMainBase",
		rebuildTruck: true,
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		truckDroid: getObject("colTruck3"),
		structset: camAreaToStructSet("colBase3")
	});

	if (tweakOptions.rec_timerlessMode)
	{
		// NOTE: No scav cranes on this mission!
		// Add a second truck to the Collective's main base
		camManageTrucks(CAM_THE_COLLECTIVE, {
			label: "colMainBase",
			rebuildTruck: true,
			respawnDelay: TRUCK_TIME,
			rebuildBase: true,
			template: cTempl.comtruckt,
			structset: camAreaToStructSet("colBase3")
		});
	}
	else
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(60)));
	}

	allowExtraWaves = false;

	camAutoReplaceObjectLabel("colCC");
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