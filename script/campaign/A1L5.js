include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const MIS_CLAYDE = 5;

const mis_collectiveResearch = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02", "R-Wpn-Mortar-Damage01", 
	"R-Wpn-Flamer-Damage02", "R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals02", "R-Struc-Materials02", 
	"R-Defense-WallUpgrade02", "R-Sys-Engineering01",
];

var baitActive;
var ambushSprung;
var collectiveActive;
var commanderAggro;
var colAmbushGroup;
// Refillable Groups...
var colCommandGroup;
var colRepairGroup;
var colBasePatrolGroup;

camAreaEvent("heliRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("heliRemoveZone", CAM_THE_COLLECTIVE);
});

camAreaEvent("colAmbushTrigger", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && !isVTOL(droid))
	{
		collectiveAmbush();
	}
	else
	{
		resetLabel("colAmbushTrigger", CAM_HUMAN_PLAYER);
	}
});

function heliAttack1()
{
	const templates = [cTempl.helhmg, cTempl.helpod];
	const ext = {
		limit: [1, 1],
		alternate: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "heliAttackPos1", "heliRemoveZone", templates, camChangeOnDiff(camSecondsToMilliseconds(60)), "heliTower1", ext);
}

function heliAttack2()
{
	const templates = [cTempl.helcan];
	const ext = {
		limit: 1
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "heliAttackPos2", "heliRemoveZone", templates, camChangeOnDiff(camSecondsToMilliseconds(45)), "heliTower2", ext);
}

function activateBait()
{
	if (!baitActive)
	{
		camManageGroup(camMakeGroup("scavBaitGroup"), CAM_ORDER_ATTACK, {
			morale: 10,
			fallback: camMakePos("baitFallbackPos"),
			radius: 6,
		});

		baitActive = true;
	}
}

// Ambush the player after they cross the canal
function collectiveAmbush()
{
	if (!ambushSprung)
	{
		camManageGroup(colAmbushGroup, CAM_ORDER_ATTACK);
		ambushSprung = true;
	}
}

// Order the Collective commander to stop patrolling and start attacking the player directly
function aggroCommander()
{
	commanderAggro = true;
	if (getObject("colCommander"))
	{
		camManageGroup(camMakeGroup("colCommander"), CAM_ORDER_ATTACK, {
			repair: 40,
			repairPos: camMakePos("colRepairPos"),
		});
	}
}

// Activate all remaining C-Scav factories
function activateCScavFactories()
{
	camEnableFactory("scavFactory3");
	camEnableFactory("scavFactory4");
}

// Send a Collective commander and hover units
// Also activate the Collective factory
function sendCollectiveTransporter()
{
	camEnableFactory("colFactory");

	// Set reinforcement droids
	const droids = [
		cTempl.comcomt, // Commander
		cTempl.commcant, cTempl.commcant, // Medium Cannons
		cTempl.comath, cTempl.comath, // Lancer Hovers
	];
	// Add more Hovers depending on difficulty
	if (difficulty >= MEDIUM) droids.push(cTempl.comath); // Lancer
	if (difficulty >= HARD) droids.push(cTempl.commrah); // MRA
	if (difficulty === INSANE) droids.push(cTempl.commrah); // MRA

	camSendReinforcement(CAM_THE_COLLECTIVE, camMakePos("landingZoneCollective"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: camMakePos("transportEntryPosCollective"),
			exit: camMakePos("transportEntryPosCollective"),
			order: CAM_ORDER_PATROL,
			data: {
				// The non-hover tanks will be reassigned when the transport lands
				pos: [camMakePos("hoverPatrolPos1"), camMakePos("hoverPatrolPos2")],
				interval: camSecondsToMilliseconds(22),
				repair: 75,
				repairPos: camMakePos("colRepairPos")
			}
		}
	);
}

// Assign Collective units
function eventTransporterLanded(transport)
{
	if (transport.player === CAM_THE_COLLECTIVE)
	{
		const transDroids = camGetTransporterDroids(transport.player);

		// Loop through the droids and reassign any non-hover units
		const COMMAND_GROUP = camNewGroup();
		for (const droid of transDroids)
		{
			// Assign the command droid
			if (droid.droidType === DROID_COMMAND)
			{
				addLabel(droid, "colCommander");
				// Set the commander's rank (ranges from Green to Professional)
				const COMMANDER_RANK = (difficulty >= EASY) ? 1 : (difficulty);
				camSetDroidRank(droid, COMMANDER_RANK);
			}
			// Assign Medium Cannons
			else if (camDroidMatchesTemplate(droid, cTempl.commcant))
			{
				camGroupAdd(COMMAND_GROUP, droid);
			}
		}

		// Set up the command groups

		// NOTE: The two Medium Cannons aren't in this list, so they won't be rebuilt if destroyed.
		// They can't be replaced by the module-less Collective factory anyway
		const commandTemplates = [
			cTempl.colcanht, cTempl.colcanht, cTempl.colcanht, cTempl.colcanht, // Light Cannons
			cTempl.colmrat, cTempl.colmrat, // MRA
		];
		if (difficulty >= MEDIUM) commandTemplates.push(cTempl.colpodt, cTempl.colpodt) // MRP
		if (difficulty >= HARD) commandTemplates.push(cTempl.colaaht, cTempl.colaaht) // Hurricanes

		camMakeRefillableGroup(COMMAND_GROUP, {
			templates: commandTemplates,
			factories: ["colFactory"], // Only refill from this factory
			obj: "colCommander", // Stop filling this group when the commander dies
		}, CAM_ORDER_FOLLOW, 
		{
			leader: "colCommander",
			suborder: CAM_ORDER_ATTACK,
			repair: 40,
			repairPos: camMakePos("colRepairPos"),
		});

		// Manage the actual commander droid
		camManageGroup(camMakeGroup("colCommander"),
			(commanderAggro) ? CAM_ORDER_ATTACK : CAM_ORDER_PATROL, {
			pos: [camMakePos("patrolPos3"), camMakePos("patrolPos5"), camMakePos("patrolPos6")],
			interval: camSecondsToMilliseconds(28),
			repair: 40,
			repairPos: camMakePos("colRepairPos"),
		});
	}
}

// Try to bait the player across the canal
function eventAttacked(victim, attacker)
{
	if (!baitActive && victim.player === CAM_THE_COLLECTIVE && attacker.player === CAM_HUMAN_PLAYER)
	{
		camCallOnce("activateBait");
	}
}

// Trigger the ambush early if the player starts picking off ambush units
function eventGroupLoss(obj, group, newsize)
{
	// console("group " + group + " lost a member!")
	if (!ambushSprung && group === colAmbushGroup)
	{
		camCallOnce("collectiveAmbush");
	}
}

// Aggro the Collective early if the player attacks the Collective base
function eventDestroyed(obj)
{
	if (!commanderAggro && obj.player === CAM_THE_COLLECTIVE && camWithinArea(obj, "colBase"))
	{
		camCallOnce("aggroCommander");
		camEnableFactory("colFactory");
	}
}

function eventStartLevel()
{
	const transportEntryPos = camMakePos("transportEntryPos");
	const lz = getObject("landingZone");

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A1L6", {
		area: "compromiseZone",
		reinforcements: camMinutesToSeconds(1.5),
		annihilate: true
	});

	centreView(lz.x, lz.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);

	// Set alliances...
	setAlliance(MIS_CLAYDE, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_CLAYDE, CAM_THE_COLLECTIVE, true);

	camSetArtifacts({
		"colFactory": { tech: "R-Vehicle-Body02" }, // Leopard
		"colCommandCenter": { tech: "R-Defense-HardcreteWall" }, // Hardcrete
		"colResearchFacility": { tech: "R-Wpn-Rocket01-LtAT" }, // Lancer
		"colCommandRelay": { tech: "R-Struc-CommandRelay" }, // Command Relay Post
		"colAASite": { tech: "R-Wpn-AAGun03" }, // Hurricane AA
	});

	camSetEnemyBases({
		"scavSWBase": {
			cleanup: "scavBase1",
			detectMsg: "CSCAV_BASE1",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg",
		},
		"scavNEBase": {
			cleanup: "scavBase2",
			detectMsg: "CSCAV_BASE2",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg",
		},
		"colMainBase": {
			cleanup: "colBase",
			detectMsg: "COL_BASE",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
	});

	// cTempl.colpodt // MRP
	// cTempl.colaaht // Hurricane
	// cTempl.colmrat // MRA
	// cTempl.colhmght // HMG
	// cTempl.colcanht // Light Cannon
	// cTempl.colflamt // Flamer
	// cTempl.colmortht // Mortar
	// cTempl.commcant // Medium Cannon
	// cTempl.comatt // Lancer
	camSetFactories({
		"scavFactory1": {
			assembly: "scavAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(36)),
			templates: [cTempl.flatat, cTempl.rbjeep, cTempl.gbjeep, cTempl.lance, cTempl.minitruck]
		},
		"scavFactory2": {
			assembly: "scavAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(18)),
			templates: [cTempl.trike, cTempl.rbuggy, cTempl.bjeep, cTempl.bloke, cTempl.lance, cTempl.firetruck]
		},
		"scavFactory3": {
			assembly: "scavAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(28)),
			templates: [cTempl.moncan, cTempl.bloke, cTempl.bloke, cTempl.buggy, cTempl.sartruck]
		},
		"scavFactory4": {
			assembly: "scavAssembly4",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			templates: [cTempl.monfire, cTempl.buggy, cTempl.rbuggy, cTempl.trike, cTempl.flatmrl, cTempl.bloke, cTempl.lance]
		},
		"colFactory": {
			assembly: "colAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			templates: [ cTempl.colcanht, cTempl.colcanht, cTempl.colflamt, cTempl.colmrat, cTempl.colhmght ]
		},
	});

	// Set up refillable groups and trucks
	// NOTE: A refillable commander group will be created later
	// Repair group
	colRepairGroup = camMakeRefillableGroup(undefined, {
		templates: [cTempl.colrept, cTempl.colrept, cTempl.colrept],
		factories: ["colFactory"], // Only refill from this factory
	}, CAM_ORDER_DEFEND, {pos: camMakePos("colRepairPos")});
	// Collective trucks
	const colBaseStructs = camAreaToStructSet("colBase")
	colTruckJob1 = camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colMainBase",
		respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
		template: cTempl.coltruckht,
		structset: colBaseStructs
	});
	colTruckJob2 = camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colMainBase",
		respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
		template: cTempl.coltruckht,
		structset: colBaseStructs
	});

	baitActive = false;
	ambushSprung = false;
	collectiveActive = false;
	commanderAggro = false;
	colAmbushGroup = camMakeGroup("colAmbushGroup"); // Will be managed later

	// Set up patrols
	camManageGroup(camMakeGroup("colPatrolGroup1"), CAM_ORDER_PATROL, {
		pos: [camMakePos("patrolPos1"), camMakePos("patrolPos2")],
		interval: camSecondsToMilliseconds(24)
	});
	camManageGroup(camMakeGroup("colPatrolGroup2"), CAM_ORDER_PATROL, {
		pos: [camMakePos("patrolPos3"), camMakePos("patrolPos4")],
		interval: camSecondsToMilliseconds(38)
	});

	// Do these immediately
	camEnableFactory("scavFactory1");
	camEnableFactory("scavFactory2");

	queue("activateBait", camMinutesToMilliseconds(1.75));
	queue("heliAttack1", camChangeOnDiff(camMinutesToMilliseconds(2)));
	queue("sendCollectiveTransporter", camMinutesToMilliseconds(3));
	queue("activateCScavFactories", camChangeOnDiff(camMinutesToMilliseconds(6)));
	queue("heliAttack2", camChangeOnDiff(camMinutesToMilliseconds(6)));
	queue("aggroCommander", camChangeOnDiff(camMinutesToMilliseconds(12)));
}