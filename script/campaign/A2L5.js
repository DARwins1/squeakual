include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_collectiveResearch = [
	"R-Wpn-MG-Damage04", "R-Wpn-Rocket-Damage04", "R-Wpn-Mortar-Damage04", 
	"R-Wpn-Flamer-Damage03", "R-Wpn-Cannon-Damage03", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals03", "R-Struc-Materials03", 
	"R-Defense-WallUpgrade03", "R-Sys-Engineering01", "R-Cyborg-Metals03",
	"R-Wpn-Cannon-Accuracy01", "R-Wpn-Rocket-Accuracy02", "R-Wpn-AAGun-ROF01",
	"R-Vehicle-Engine03", "R-Struc-RprFac-Upgrade01", "R-Wpn-AAGun-Damage01",
];

camAreaEvent("heliRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("heliRemoveZone", CAM_THE_COLLECTIVE);
});

function heliAttack1()
{
	const ext = {
		limit: 1,
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "heliAttackPos1", "heliRemoveZone", [cTempl.helpod, cTempl.helcan], camChangeOnDiff(camMinutesToMilliseconds(1.5)), "heliTower1", ext);
}

function heliAttack2()
{
	const ext = {
		limit: 1,
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "heliAttackPos2", "heliRemoveZone", [cTempl.helpod, cTempl.helhmg], camChangeOnDiff(camMinutesToMilliseconds(1.25)), "heliTower2", ext);
}

// Start moving patrol groups
function groupPatrol()
{
	camManageGroup(camMakeGroup("cScavPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos1"),
			camMakePos("patrolPos2"),
			camMakePos("patrolPos3"),
			camMakePos("patrolPos4")
		],
		interval: camSecondsToMilliseconds(26)
	});

	camManageGroup(camMakeGroup("colWestPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos3"),
			camMakePos("patrolPos4"),
			camMakePos("patrolPos5"),
			camMakePos("patrolPos6")
		],
		interval: camSecondsToMilliseconds(38)
	});
	camManageGroup(camMakeGroup("colEastPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos7"),
			camMakePos("patrolPos8"),
			camMakePos("patrolPos9")
		],
		interval: camSecondsToMilliseconds(24)
	});
	camManageGroup(camMakeGroup("colHoverDefenseGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("hoverPatrolPos1"),
			camMakePos("hoverPatrolPos2"),
			camMakePos("hoverPatrolPos3"),
			camMakePos("hoverPatrolPos4")
		],
		interval: camSecondsToMilliseconds(18),
		repair: 80
	});
	camManageGroup(camMakeGroup("colCommander"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos6"),
			camMakePos("patrolPos9"),
			camMakePos("patrolPos10")
			// More positions are added later
		],
		interval: camSecondsToMilliseconds(28),
		repair: 70
	});
}

function enableFirstFactories()
{
	camEnableFactory("cScavFactory3");
	camEnableFactory("cScavFactory4");
	camEnableFactory("colFactory1"); // Hover factory
	camEnableFactory("colCybFactory1");
}

function enableSecondFactories()
{
	camEnableFactory("colFactory2");
	camEnableFactory("colCybFactory2");

	// Also expand the Collective commander's patrol region
	if (getObject("colCommander") !== null)
	{
		camManageGroup(camMakeGroup("colCommander"), CAM_ORDER_PATROL, {
			pos: [
				camMakePos("patrolPos6"),
				camMakePos("patrolPos9"),
				camMakePos("patrolPos10"),
				camMakePos("patrolPos5"),
				camMakePos("patrolPos4"),
				camMakePos("patrolPos7")
			],
			interval: camSecondsToMilliseconds(32),
			repair: 70
		});
	}
}

function enableFinalFactories()
{
	camEnableFactory("colFactory3");
	camEnableFactory("colCybFactory3");
}

// If the Collective commander is still alive, order it to attack the player directly (no more patrolling)
function aggroCommander()
{
	if (getObject("colCommander") !== null)
	{
		// Collective commander still alive
		camManageGroup(camMakeGroup("colCommander"), CAM_ORDER_ATTACK, {
			targetPlayer: CAM_HUMAN_PLAYER,
			repair: 70
		});
	}
}

// Reassign the VTOL strike turret's label when it's rebuilt
function eventDroidBuilt(droid, structure)
{
	if (droid.player === CAM_THE_COLLECTIVE && camDroidMatchesTemplate(droid, cTempl.comstriket))
	{
		addLabel(droid, "colVtolSensor");
	}
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone");

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "A2L6S");

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	camSetArtifacts({
		"colCybFactory2": { tech: "R-Cyb-Hvywpn-Grenade" }, // Super Heavy Grenadier
		"colFactory1": { tech: "R-Wpn-Rocket03-HvAT" }, // Bunker Buster
		"colCycloneEmp": { tech: "R-Wpn-AAGun02" }, // Cyclone
		"colResearch": { tech: "R-Struc-Research-Module" }, // Research Module
	});

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);

	camSetEnemyBases({
		"cScavWesterCraterBase": {
			cleanup: "cScavBase1",
			detectMsg: "CSCAV_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"cScavWestCraterBase": {
			cleanup: "cScavBase2",
			detectMsg: "CSCAV_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"cScavOilOutpost": {
			cleanup: "cScavBase3",
			detectMsg: "CSCAV_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated,
		},
		"cScavNorthBase": {
			cleanup: "cScavBase4",
			detectMsg: "CSCAV_BASE4",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"cScavBigCraterBase": {
			cleanup: "cScavBase5",
			detectMsg: "CSCAV_BASE5",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated,
		},
		"cScavEastBase": {
			cleanup: "cScavBase6",
			detectMsg: "CSCAV_BASE6",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"colCanalBase": {
			cleanup: "colBase1",
			detectMsg: "COL_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colMoundBase": {
			cleanup: "colBase2",
			detectMsg: "COL_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colBlockadeBase": {
			cleanup: "colBase3",
			detectMsg: "COL_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colMainBase": {
			cleanup: "colBase4",
			detectMsg: "COL_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	camSetFactories({
		"cScavFactory1": {
			assembly: "cScavAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			templates: [ cTempl.monmrl, cTempl.gbjeep, cTempl.buscan, cTempl.trike, cTempl.kevbloke, cTempl.kevlance, cTempl.kevbloke ]
		},
		"cScavFactory2": {
			assembly: "cScavAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(26)),
			templates: [ cTempl.monfire, cTempl.bjeep, cTempl.minitruck, cTempl.rbjeep ]
		},
		"cScavFactory3": {
			assembly: "cScavAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(32)),
			templates: [ cTempl.monlan, cTempl.minitruck, cTempl.firetruck, cTempl.rbuggy, cTempl.kevbloke ]
		},
		"cScavFactory4": {
			assembly: "cScavAssembly4",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(28)),
			templates: [ cTempl.flatmrl, cTempl.moncan, cTempl.rbjeep, cTempl.buggy, cTempl.kevbloke, cTempl.kevlance, cTempl.monhmg ]
		},
		"colFactory1": {
			assembly: "colAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			data: {
				repair: 60,
				regroup: true
			},
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			templates: [ cTempl.comath, cTempl.commrah, cTempl.comhpvh ]
		},
		"colFactory2": {
			assembly: "colAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 40
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			templates: [ cTempl.colpodt, cTempl.colflamt, cTempl.colmrat, cTempl.colaaht ]
		},
		"colFactory3": {
			assembly: "colAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 40
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			templates: [ cTempl.commcant, cTempl.comhmgt, cTempl.comatt, cTempl.commcant ]
		},
		"colCybFactory1": {
			assembly: "colCybAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 30
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			templates: [ cTempl.cybca, cTempl.cybhg, cTempl.cybgr ]
		},
		"colCybFactory2": {
			assembly: "colCybAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 30
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			templates: [ cTempl.scygr, cTempl.scymc ]
		},
		"colCybFactory3": {
			assembly: "colCybAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 30
			},
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			templates: [ cTempl.cybla, cTempl.cybfl ]
		},
		"colVtolFactory": {
			assembly: "colVtolAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 2,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(55)),
			templates: [ cTempl.colatv, cTempl.colatv, cTempl.colbombv, cTempl.colbombv ]
		},
	});

	const COMMANDER_RANK = (difficulty <= MEDIUM) ? "Regular" : "Professional";
	camSetDroidRank(getObject("colCommander"), COMMANDER_RANK);

	// Set up refillable groups and trucks
	// Collective commander group
	// (2 Heavy Machineguns, 4 Super Heavy-Gunners, 1 VTOL Strike Turret, 1 Lancer, 1 Cyclone AA, 1 Heavy Repair Turret)
	// NOTE: The 2 Heavy Cannon Tigers that spawn with this commander are not rebuilt (and not included here)
	const commandTemplates = [
		cTempl.comhmgt, cTempl.comhmgt,
		cTempl.scymc, cTempl.scymc, cTempl.scymc, cTempl.scymc,
		cTempl.comstriket,
		cTempl.comatt,
		cTempl.comhaat,
		cTempl.comhrept,
	];
	if (difficulty >= HARD)
	{
		// Add an extra 2 Lancers on Hard+
		commandTemplates.push(cTempl.comatt);
		commandTemplates.push(cTempl.comatt);
	}
	camMakeRefillableGroup(
		camMakeGroup("colCommandGroup"), {
			templates: commandTemplates,
			factories: ["colFactory2", "colFactory3", "colCybFactory1", "colCybFactory2", "colCybFactory3"],
			obj: "colCommander" // Stop refilling this group when the commander dies
		}, CAM_ORDER_FOLLOW, {
			leader: "colCommander",
			repair: 60,
			suborder: CAM_ORDER_ATTACK
	});
	// Hover patrol group
	const hoverTemplates = 
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Lancers, 2 MRAs, 2 Bunker Busters
				cTempl.comath, cTempl.comath,
				cTempl.combbh,
				cTempl.commrah, cTempl.commrah,
				cTempl.combbh,
			],
			factories: ["colFactory1"],
		}, CAM_ORDER_PATROL, {
			pos: [
				camMakePos("hoverPatrolPos5"),
				camMakePos("hoverPatrolPos6"),
				camMakePos("hoverPatrolPos7"),
				camMakePos("hoverPatrolPos8"),
				camMakePos("hoverPatrolPos9")
			],
			interval: camSecondsToMilliseconds(28),
			repair: 80
	});
	// VTOL groups
	// Assigned to the VTOL Strike unit (which in turn is assigned to a commander)
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 3 Cluster bombs, 3 Lancers
				cTempl.colbombv, cTempl.colatv,
				cTempl.colbombv, cTempl.colatv,
				cTempl.colbombv, cTempl.colatv,
			],
			factories: ["colVtolFactory"],
			obj: "colVtolSensor",
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolSensor",
			suborder: CAM_ORDER_ATTACK // Just attack normally when sensor is destroyed
	});
	// Assigned to the VTOL Radar Tower (northwest)
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Heavy Machineguns, 2 Lancers
				cTempl.colhmgv, cTempl.colatv,
				cTempl.colhmgv, cTempl.colatv,
			],
			factories: ["colVtolFactory"],
			obj: "colVtolTower1",
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolTower1",
			suborder: CAM_ORDER_DEFEND, // Tower groups defend until tower is rebuilt
			data: {
				pos: camMakePos("colVtolAssembly")
			}
	});
	// Assigned to the VTOL Radar Tower (center)
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Heavy Machineguns, 2 Lancers
				cTempl.colhmgv, cTempl.colatv,
				cTempl.colhmgv, cTempl.colatv,
			],
			factories: ["colVtolFactory"],
			obj: "colVtolTower2",
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolTower2",
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("colVtolAssembly")
			}
	});
	// Assigned to the VTOL Radar Tower (east)
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Heavy Machineguns, 2 Lancers
				cTempl.colhmgv, cTempl.colatv,
				cTempl.colhmgv, cTempl.colatv,
			],
			factories: ["colVtolFactory"],
			obj: "colVtolTower3",
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolTower3",
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("colVtolAssembly")
			}
	});
	// Assigned to the VTOL CB Tower
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Cluster Bombs, 2 Lancers
				cTempl.colbombv, cTempl.colatv,
				cTempl.colbombv, cTempl.colatv,
			],
			factories: ["colVtolFactory"],
			obj: "colVtolCBTower",
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolCBTower",
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("colVtolAssembly")
			}
	});
	// Trucks
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 60 : 120));
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colCanalBase",
			rebuildTruck: (tweakOptions.rec_timerlessMode || difficulty >= MEDIUM),
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck1"),
			structset: camAreaToStructSet("colBase1")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colMoundBase",
			rebuildTruck: (tweakOptions.rec_timerlessMode || difficulty >= MEDIUM),
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck2"),
			structset: camAreaToStructSet("colBase2")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colBlockadeBase",
			rebuildTruck: (tweakOptions.rec_timerlessMode || difficulty >= MEDIUM),
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("colTruck3"),
			structset: camAreaToStructSet("colBase3")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colMainBase",
			rebuildTruck: (tweakOptions.rec_timerlessMode || difficulty >= EASY),
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck4"),
			structset: camAreaToStructSet("colBase4")
	});

	if (tweakOptions.rec_timerlessMode)
	{
		const CRANE_TIME = camChangeOnDiff(camSecondsToMilliseconds(70));
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "cScavWesterCraterBase",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("cScavBase1").filter((struct) => (camIsScavStruct(struct.stat)))
		});
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "cScavWestCraterBase",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("cScavBase2").filter((struct) => (camIsScavStruct(struct.stat)))
		});
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "cScavNorthBase",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("cScavBase4").filter((struct) => (camIsScavStruct(struct.stat)))
		});
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "cScavBigCraterBase",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("cScavBase5").filter((struct) => (camIsScavStruct(struct.stat)))
		});
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "cScavEastBase",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("cScavBase6")
		});
	}
	else
	{
		setMissionTime(camChangeOnDiff(camHoursToSeconds(2)));
	}

	camAutoReplaceObjectLabel(["heliTower1", "heliTower2", "colVtolTower1", "colVtolTower2", "colVtolTower3", "colVtolCBTower"]);

	// These factories are active immediately
	camEnableFactory("cScavFactory1");
	camEnableFactory("cScavFactor2");
	camEnableFactory("colVtolFactory");

	queue("groupPatrol", camSecondsToMilliseconds(5));
	queue("heliAttack1", camChangeOnDiff(camSecondsToMilliseconds(10)));
	queue("heliAttack2", camChangeOnDiff(camMinutesToMilliseconds(2)));
	queue("enableFirstFactories", camChangeOnDiff(camMinutesToMilliseconds(6)));
	queue("enableSecondFactories", camChangeOnDiff(camMinutesToMilliseconds(12)));
	queue("enableFinalFactories", camChangeOnDiff(camMinutesToMilliseconds(18)));
	queue("aggroCommander", camChangeOnDiff(camMinutesToMilliseconds(22)));

	// Placeholder for the actual briefing sequence
	camQueueDialogue([
		{text: "---- BRIEFING PLACEHOLDER ----", delay: 0},
		{text: "CHARLIE: General, team Delta has reported back from reconnaissance, sir.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: And?", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: That place is a deathtrap, sir. It's easily the most heavily defended position in this sector.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: Or at least... the most heavily defended that we've found so-", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Enough! Are there any periods when the camp has less defenders?", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: W-Well, yes. The Collective patrols come and go with their transports.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: But we've also detected numerous smaller bases in the area.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: If we were to launch a direct assault, these bases would surely send reinforcements.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: ...I'm sure we could expect even more reinforcements after that.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: The Collective don't seem to be fond of letting their prisoners go.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: ...We're going to need a diversion, to draw their forces away from the camp.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: General, please excuse the interruption, but we have a developing situation.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: What is it, Lieutenant?", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We've picked up enemy movement to the north of team Bravo's position.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We believe that the Collective may be gathering their forces for another assault.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Wonderful. This is going to complicate everything.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Commanders Charlie and Golf, prepare your forces. We'll need to attack the Collective site sooner than previously planned.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Commander Bravo, take your forces and secure the area north of your position.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Destroy any Collective bases that they may have before they can rally their forces.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: If we're lucky, that should disrupt their movements and give us enough of an opening to raid their prisoner camp.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Good luck, Commander Bravo.", delay: 3, sound: CAM_RCLICK},
	]);

	// Shift the sun towards the west
	camSetSunPos(450.0, -400.0, 225.0);
	camSetSunIntensity(.4, .4, .5);
}