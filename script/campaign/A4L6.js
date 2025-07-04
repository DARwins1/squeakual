include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");

const MIS_TEAM_CHARLIE = 1;
const MIS_TEAM_DELTA = 5;
const MIS_CIVS = 6; // Civilians waiting to be rescued
const MIS_CIV_ESCORTS = 7; // Civilians after being collected

const MIS_TRANSPORT_MAX_TIME = camMinutesToSeconds(5); // 5 minutes max
const MIS_TRANSPORT_START_TIME = camMinutesToSeconds(2); // 2 minutes for the first transport
const MIS_TRANSPORT_TIME_INCREMENT = 15; // Increase transport time by 15 seconds per transport
const DORDER_GUARD = 25; // Order number for guarding an droid/structure
const MIS_LOST_THRESHOLD = (difficulty >= MEDIUM) ? 2 : 3;
const MIS_ALLY_COMMANDER_RANK = "Hero";
const MIS_COL_COMMANDER_RANK = Math.min(5, difficulty + 4); // Veteran to Hero
const MIS_ALLY_TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds(65), true);
const MIS_ALLY_ENGINEER_TIME = camChangeOnDiff(camSecondsToMilliseconds(35), true);
const MIS_ALLY_COMMANDER_DELAY = camChangeOnDiff(camMinutesToMilliseconds(2.5), true);
const MIS_GROUND_ASSAULT_DELAY = camSecondsToMilliseconds(20);
const MIS_AIR_ASSAULT_DELAY = camSecondsToMilliseconds(15);

const mis_collectiveResearch = [
	"R-Wpn-MG-Damage06", "R-Wpn-Rocket-Damage06", "R-Wpn-Mortar-Damage06", 
	"R-Wpn-Flamer-Damage06", "R-Wpn-Cannon-Damage06", "R-Wpn-MG-ROF03",
	"R-Wpn-Rocket-ROF03", "R-Wpn-Mortar-ROF03", "R-Wpn-Flamer-ROF03",
	"R-Wpn-Cannon-ROF03", "R-Vehicle-Metals06", "R-Struc-Materials06", 
	"R-Defense-WallUpgrade06", "R-Sys-Engineering02", "R-Cyborg-Metals06",
	"R-Wpn-Cannon-Accuracy02", "R-Wpn-Rocket-Accuracy03", "R-Wpn-AAGun-ROF03",
	"R-Wpn-AAGun-Damage03", "R-Vehicle-Engine06", "R-Wpn-AAGun-Accuracy01",
	"R-Struc-RprFac-Upgrade02", "R-Struc-VTOLPad-Upgrade01", "R-Sys-Sensor-Upgrade01",
	"R-Vehicle-Armor-Heat03", "R-Cyborg-Armor-Heat03", "R-Wpn-Howitzer-Damage03",
	"R-Wpn-Howitzer-ROF02", "R-Wpn-Howitzer-Accuracy01", "R-Wpn-Mortar-Acc01",
	// Upgrades for the Avenger SAM:
	"R-Wpn-Missile-Accuracy01", "R-Wpn-Missile-Damage01", "R-Wpn-Missile-ROF01",
];

// This mission is divided into 3 "stages"
// stage 1: escort civilian groups using Transport Trucks back to the safe haven
// stage 2: expand the map; escort Delta's transport group back to their base
// stage 3: survive against the Collective onslaught for 20 minutes
var stage;
var transportIndex;
var transportTime;
var depositBeaconActive;
var deltaUnitIDs;
var deltaRescued; // Becomes true if at least 1 unit makes it back to base
var firstDeltaTransport;
var reinforcementIndex;
var charlieCommanderDeathTime;
var deltaCommanderDeathTime;
var collectiveRetreat;
var colCommanderIndex;

// Store structure sets for later
var charlieMainBaseStructs;
var deltaMainBaseStructs;
var deltaHoldoutStructs;
var colBase1Structs;
var colBase2Structs;
var colBase3Structs;
var colBase4Structs;
var colBase5Structs;

// Track which assault blips are active
var groundBlips;
var airBlips;

// Various groups
var charlieCommander;
var charlieCommandGroup;
var deltaCommander;
var deltaCommandGroup;
var deltaCrashGroup;

// Truck jobs (wow there's a lot of these)
var colBaseTruckJob1;
var colBaseTruckJob2;
var colBaseTruckJob3;
var colBaseTruckJob4;
var colBaseTruckJob5;
var colBaseTruckJob6;
var colBaseTruckJob7;
var colBaseTruckJob8;
var colBaseTruckJob9;
var colBaseTruckJob10;
var colBaseTruckJob11;
var colBaseTruckJob12;
var colBaseTruckJob13;
var colBaseTruckJob14;
var colLZTruckJob1;
var colLZTruckJob2;
var colLZTruckJob3;
var colLZTruckJob4;
var colLZTruckJob5;
var colLZTruckJob6;
var colLZTruckJob7;
var colLZTruckJob8;
var colLZTruckJob9;
var colLZTruckJob10;
var charlieTruckJob1;
var charlieTruckJob2;
var charlieTruckJob3;
var deltaTruckJob1;
var deltaTruckJob2;
var deltaTruckJob3;
var deltaTruckJob4;

// Civilian holdout groups
var civGroup1;
var civGroup2;
var civGroup3;
var civGroup4;
var civGroup5;

// Whether each civilian group has been loaded onto a truck
var civ1Loaded;
var civ2Loaded;
var civ3Loaded;
var civ4Loaded;
var civ5Loaded;

// Whether each truck has arrived the deposit zone
var truck1Safe;
var truck2Safe;
var truck3Safe;
var truck4Safe;
var truck5Safe;

camAreaEvent("vtolRemoveZone1", function(droid)
{
	if (stage === 1)
	{
		camSafeRemoveObject(droid, false);
		resetLabel("vtolRemoveZone1", CAM_THE_COLLECTIVE);
	}
});

camAreaEvent("vtolRemoveZone2", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("vtolRemoveZone2", CAM_THE_COLLECTIVE);
});

function stageOneVtolAttack()
{
	if (stage !== 1)
	{
		return;
	}

	playSound(cam_sounds.enemyVtolsDetected);

	// Cluster Bombs, Lancers, Phosphor Bombs, and Assault Guns
	const templates = [cTempl.colbombv, cTempl.colatv, cTempl.colphosv, cTempl.colagv];
	const ext = {
		limit: [2, 3, 2, 3],
		alternate: true,
		targetPlayer: CAM_HUMAN_PLAYER,
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos1", "vtolRemoveZone1", templates, camChangeOnDiff(camMinutesToMilliseconds(1)), undefined, ext);
}

function stageTwoVtolAttack()
{	
	// HEAP Bombs, Tank Killers, Thermite Bombs, and Assault Cannons
	const templates = [cTempl.comhbombv, cTempl.comhatv, cTempl.comthermv, cTempl.comacanv];
	const ext = {
		limit: [2, 3, 2, 3],
		alternate: true,
		targetPlayer: CAM_HUMAN_PLAYER,
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), "colCC", ext);
}

// NOTE: This function is called multiple times to increase the number of VTOL attacks over time
function stageThreeVtolAttack()
{
	// Assault Guns, Tank Killers, and Assault Cannons
	const templates = [cTempl.colagv, cTempl.comhatv, cTempl.comacanv];
	const ext = {
		limit: [5, 3, 4],
		alternate: true,
		targetPlayer: CAM_HUMAN_PLAYER,
		dynamic: true
	};
	const positions = ["vtolAttackPos2", "vtolAttackPos3", "vtolAttackPos4", "vtolAttackPos5"];
	camSetVtolData(CAM_THE_COLLECTIVE, positions, "vtolRemoveZone2", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), "colCC", ext);
}

function sendCharlieTransporter()
{
	// Stop sending transports after stage 2
	if (stage > 2)
	{
		removeTimer("sendCharlieTransporter");
		return;
	}

	// Bring in a few trucks
	// NOTE: If these trucks aren't needed when we land, we'll just quietly remove them
	// We also use these transports to "deliver" civilians to the haven
	camSendReinforcement(MIS_TEAM_CHARLIE, camMakePos("landingZoneCharlie"), [cTempl.plhtruckht, cTempl.plhtruckht, cTempl.plhtruckht],
		CAM_REINFORCE_TRANSPORT, {
			entry: camMakePos("transporterEntryCharlie"),
			exit: camMakePos("transporterEntryCharlie")
		}
	);
}

function sendDeltaTransporter()
{
	// Stop sending transports after stage 2
	if (stage > 2)
	{
		removeTimer("sendDeltaTransporter");
		return;
	}

	// Bring in a few trucks
	const droids = [cTempl.plhtruckt, cTempl.plhtruckt, cTempl.plhtruckt, cTempl.plhtruckt];
	if (firstDeltaTransport)
	{
		// If this is Delta's first transport, also include some attack units
		droids.push(cTempl.plhcomt, cTempl.plhasgnt, cTempl.plhasgnt, cTempl.plhhrepht, cTempl.plhacant, cTempl.plhacant);
	}
	camSendReinforcement(MIS_TEAM_DELTA, camMakePos("landingZoneDelta"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: camMakePos("transporterEntryDelta"),
			exit: camMakePos("transporterEntryDelta")
		}
	);
}

// Send a Collective transport to one of the built LZs (if any exist)
function sendCollectiveTransporter()
{
	let landingZones = [];

	// Always land at the west LZ if it's built
	if (!camBaseIsEliminated("colWestLZ")) landingZones = ["landingZoneCollective6"];

	if (landingZones.length === 0)
	{
		// Choose any of the built central LZs if the west LZ is unbuilt
		if (!camBaseIsEliminated("colSouthLZ")) landingZones.push("landingZoneCollective5");
		if (!camBaseIsEliminated("colNorthLZ")) landingZones.push("landingZoneCollective4");
		if (!camBaseIsEliminated("colCentralLZ")) landingZones.push("landingZoneCollective3");
	}

	if (landingZones.length === 0)
	{
		// Choose any of the built east LZs if all the LZs to the west are unbuilt
		if (!camBaseIsEliminated("colNorthEastLZ")) landingZones.push("landingZoneCollective2");
		if (!camBaseIsEliminated("colSouthEastLZ")) landingZones.push("landingZoneCollective1");
	}

	if (landingZones.length === 0)
	{
		return; // No LZs built; check again later
	}

	// Get a pool of possible templates
	let droidPool;
	if (stage === 1)
	{
		droidPool = [
			cTempl.cybla, // Lancer Cyborg
			cTempl.cybfl, // Flamer Cyborg
			cTempl.cybhg, // Heavy Machinegunner Cyborg
			cTempl.cybgr, // Grenadier Cyborg
			cTempl.scymc, // Super Heavy Gunner Cyborg
			cTempl.colaaht, // Hurricane
			cTempl.comatht, // Lancer
			cTempl.comhmght, // HMG
			cTempl.comrepht, // Repair Turret
		];
	}
	else if (stage === 2)
	{
		droidPool = [
			cTempl.cybla, // Lancer Cyborg
			cTempl.cybth, // Thermite Flamer Cyborg
			cTempl.cybag, // Assault Gunner Cyborg
			cTempl.scygr, // Super Grenadier Cyborg
			cTempl.scyac, // Super Auto Gunner Cyborg
			cTempl.comhaaht, // Cyclone
			cTempl.comhatht, // Tank Killer
			cTempl.comhpvht, // HVC
			cTempl.comaght, // Assault Gun
			cTempl.comhrepht, // Heavy Repair Turret
		];
	}
	else // stage 3
	{
		droidPool = [
			cTempl.cybth, // Thermite Flamer Cyborg
			cTempl.cybag, // Assault Gunner Cyborg
			cTempl.scytk, // Super TK Cyborg
			cTempl.scygr, // Super Grenadier Cyborg
			cTempl.scyac, // Super Auto Gunner Cyborg
			cTempl.comhaaht, // Cyclone
			cTempl.comhatht, // Tank Killer
			cTempl.comhpvht, // HVC
			cTempl.comaght, // Assault Gun
			cTempl.comhrepht, // Heavy Repair Turret
		];
	}

	// Generate a list of droids to send
	const droids = [];
	let numDroids = 6;
	if (difficulty === INSANE)
	{
		numDroids = 10;
	}
	else if (difficulty >= MEDIUM)
	{
		numDroids = 8;
	}

	for (let i = 0; i < numDroids; i++)
	{
		droids.push(camRandFrom(droidPool));
	}

	const entryPos = (stage === 1) ? camMakePos("vtolAttackPos1") : camMakePos("vtolAttackPos4");

	camSendReinforcement(CAM_THE_COLLECTIVE, camRandFrom(landingZones), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: entryPos,
			exit: entryPos,
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			}
		}
	);
}

function eventTransporterLanded(transport)
{
	if (transport.player === CAM_HUMAN_PLAYER)
	{
		if (transportIndex === 0)
		{			
			// Transfer all Charlie units/structures in the donate area to the player
			const objs = enumArea("charlieDonateArea", MIS_TEAM_CHARLIE, false);
			for (const obj of objs)
			{
				donateObject(obj, CAM_HUMAN_PLAYER);
			}

			queue("setVictory", camSecondsToMilliseconds(1));
		}
		transportIndex++;
		transportTime = MIS_TRANSPORT_TIME_INCREMENT * (transportIndex - 1) + MIS_TRANSPORT_START_TIME;

		setReinforcementTime(Math.min(transportTime, MIS_TRANSPORT_MAX_TIME));
	}
	else if (transport.player === MIS_TEAM_CHARLIE)
	{
		// Assign trucks...
		// NOTE: Charlie's transports ONLY have trucks!
		const transTrucks = camGetTransporterDroids(transport.player);
		const truckJobs = [charlieTruckJob1, charlieTruckJob2, charlieTruckJob3];

		// Assign any trucks
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
		for (let i = truckIndex; i < transTrucks.length; i++)
		{
			// Remove any leftover trucks
			camSafeRemoveObject(transTrucks[i]);
		}

		// Drop off civilians
		civilianDropOff("landingZoneCharlie");
	}
	else if (transport.player === MIS_TEAM_DELTA)
	{
		// Assign trucks...
		const transDroids = camGetTransporterDroids(transport.player);
		
		const truckJobs = [deltaTruckJob1, deltaTruckJob2, deltaTruckJob3, deltaTruckJob4];

		const transTrucks = transDroids.filter((droid) => (droid.droidType == DROID_CONSTRUCT));
		const transOther = transDroids.filter((droid) => (droid.droidType != DROID_CONSTRUCT));

		// Assign any trucks
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
		for (let i = truckIndex; i < transTrucks.length; i++)
		{
			// Remove any leftover trucks
			camSafeRemoveObject(transTrucks[i]);
		}

		if (firstDeltaTransport) 
		{
			// If this is Delta's first transport, also assign their commander/command group
			for (const droid of transOther)
			{
				// Find the command droid and label/rank it
				if (droid.droidType === DROID_COMMAND)
				{
					addLabel(droid, "deltaCommander");
					camSetDroidRank(getObject("deltaCommander"), MIS_ALLY_COMMANDER_RANK);
				}
			}

			// Assign other units to their refillable groups
			camAssignToRefillableGroups(transOther, [deltaCommander, deltaCommandGroup]);

			firstDeltaTransport = false;
		}

		// Drop off civilians
		civilianDropOff("landingZoneDelta");
	}
	// Don't care about Collective transports here...
}

// Drop off a bunch of civilians from the given LZ
function civilianDropOff(spawnArea)
{
	const NUM_CIVS = camRand(5) + 6; // 6 to 10 civilians
	const civDroids = [];
	for (let i = 0; i < NUM_CIVS; i++)
	{
		// Spawn civilians
		civDroids.push(camAddDroid(MIS_CIVS, spawnArea, cTempl.civ, _("Civilian")));
	}
	// ...and then move them towards the deposit zone
	camManageGroup(camMakeGroup(civDroids), CAM_ORDER_DEFEND, {pos: camMakePos("depositZone")});
}

// Send various Collective ground forces from entrances around the map
function sendCollectiveReinforcements()
{
	let groundEntrances = [];
	let groundCompositions = [];
	let hoverEntrances = [];
	let hoverTemplates = [];
	let aaSupport;

	if (stage === 1)
	{
		groundEntrances = [
			"groundEntry3", "groundEntry6", "groundEntry7",
			"groundEntry8",
		];
		if (difficulty >= HARD)
		{
			groundEntrances.push("groundEntry5");
			if (difficulty === INSANE)
			{
				groundEntrances.push("groundEntry4");
			}
		}

		groundCompositions = [
			[
				cTempl.cybhg, cTempl.cybhg, cTempl.cybhg, cTempl.cybhg, // 4 HMG Cyborgs
				cTempl.colpodt, cTempl.colpodt, cTempl.colpodt, cTempl.colpodt, // 4 MRPs
				cTempl.cominft, // 1 Inferno
			],
			[
				cTempl.cybca, cTempl.cybca, cTempl.cybca, // 3 Heavy Gunners
				cTempl.scymc, cTempl.scymc, // 2 Super Heavy Gunners
				cTempl.commcant, cTempl.commcant, // 2 Medium Cannons
				cTempl.cohhcant, // 1 Heavy Cannon
			],
			[
				cTempl.comhmgt, cTempl.comhmgt, cTempl.comhmgt, // 3 HMGs
				cTempl.comagt, // 1 Assault Gun
				cTempl.cybgr, cTempl.cybgr, cTempl.cybgr, // 3 Grenadiers
				cTempl.scygr, cTempl.scygr, // 2 Super Grenadier
			],
			[
				cTempl.cybfl, cTempl.cybfl, cTempl.cybfl, // 3 Flamer Cyborgs
				cTempl.cybla, cTempl.cybla, // 2 Lancer Cyborgs
				cTempl.comatt, cTempl.comatt, // 2 Lancer
				cTempl.commrat, cTempl.commrat, cTempl.commrat, // 3 MRAs
			],
		];

		aaSupport = ((difficulty >= HARD) ? cTempl.comhaat : cTempl.colaaht);
	}
	else if (stage === 2)
	{
		groundEntrances = [
			"groundEntry3", "groundEntry6", "groundEntry7",
			"groundEntry8", "groundEntry9", "groundEntry11", 
			"groundEntry13", "groundEntry15",
		];
		hoverEntrances = [
			"hoverEntry3", "hoverEntry4", "hoverEntry6",
		];
		if (difficulty >= HARD)
		{
			groundEntrances.push("groundEntry5", "groundEntry12");
			hoverEntrances.push("hoverEntry5");
			if (difficulty === INSANE)
			{
				groundEntrances.push("groundEntry2", "groundEntry4", "groundEntry10", "groundEntry14");
				hoverEntrances.push("hoverEntry1", "hoverEntry2");
			}
		}

		groundCompositions = [
			[
				cTempl.cybag, cTempl.cybag, cTempl.cybag, cTempl.cybag, // 4 Assault Gunners
				cTempl.comatt, cTempl.comatt, cTempl.comatt, cTempl.comatt, // 4 Lancers
				cTempl.cominft, cTempl.cominft, // 2 Infernos
			],
			[
				cTempl.scymc, cTempl.scymc, cTempl.scymc, // 3 Super Heavy Gunners
				cTempl.scyac, cTempl.scyac, // 2 Super Auto Gunners
				cTempl.commcant, cTempl.commcant, cTempl.commcant, // 3 Medium Cannons
				cTempl.comacant, cTempl.comacant, // 2 Assault Cannons
				cTempl.cohhcant, // 1 Heavy Cannon
			],
			[
				cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 4 Assault Guns
				cTempl.scygr, cTempl.scygr, cTempl.scygr, cTempl.scygr, // 4 Super Grenadiers
				cTempl.cohbbt, // 1 Bunker Buster
			],
			[
				cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, // 4 Thermite Flamer Cyborgs
				cTempl.cybla, cTempl.cybla, cTempl.cybla, // 3 Lancer Cyborgs
				cTempl.scytk, // 1 Super TK Cyborg
				cTempl.comhatt, cTempl.comhatt, // 2 Tank Killers
				cTempl.cohhrat, cTempl.cohhrat, // 2 HRAs
			],
		];

		hoverTemplates = [
			cTempl.comhpvh, cTempl.comhpvh,
			cTempl.comath, cTempl.comath,
			cTempl.commrah, cTempl.commrah,
			cTempl.combbh,
		];

		aaSupport = ((difficulty === INSANE) ? cTempl.cohraat : cTempl.comhaat);
	}
	else // stage 3
	{
		// More entrances are enabled as the timer ticks down
		// groundEntrances = [
		// 	"groundEntry3", "groundEntry6", "groundEntry7",
		// 	"groundEntry8", "groundEntry9", "groundEntry11", 
		// 	"groundEntry13", "groundEntry15", "groundEntry16",
		// ];
		hoverEntrances = [
			"hoverEntry3", "hoverEntry4", "hoverEntry6",
		];
		if (difficulty >= HARD || getMissionTime() < camMinutesToSeconds(16))
		{
			groundEntrances.push("groundEntry2", "groundEntry5", "groundEntry12");
			hoverEntrances.push("hoverEntry5");
			if (difficulty === INSANE || getMissionTime() < camMinutesToSeconds(8))
			{
				groundEntrances.push("groundEntry1", "groundEntry4", "groundEntry10", "groundEntry14");
				hoverEntrances.push("hoverEntry1", "hoverEntry2");
			}
		}

		// groundCompositions = [
		// 	[
		// 		cTempl.cybag, cTempl.cybag, cTempl.cybag, cTempl.cybag, // 4 Assault Gunners
		// 		cTempl.comatt, cTempl.comatt, cTempl.comatt, cTempl.comatt, // 4 Lancers
		// 		cTempl.cominft, cTempl.cominft, // 2 Infernos
		// 	],
		// 	[
		// 		cTempl.scymc, cTempl.scymc, cTempl.scymc, // 3 Super Heavy Gunners
		// 		cTempl.scyac, cTempl.scyac, // 2 Super Auto Gunners
		// 		cTempl.commcant, cTempl.commcant, cTempl.commcant, // 3 Medium Cannons
		// 		cTempl.comacant, cTempl.comacant, // 2 Assault Cannons
		// 		cTempl.cohhcant, // 1 Heavy Cannon
		// 	],
		// 	[
		// 		cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 4 Assault Guns
		// 		cTempl.scygr, cTempl.scygr, cTempl.scygr, cTempl.scygr, // 4 Super Grenadiers
		// 		cTempl.cohbbt, // 1 Bunker Buster
		// 	],
		// 	[
		// 		cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, // 4 Thermite Flamer Cyborgs
		// 		cTempl.cybla, cTempl.cybla, cTempl.cybla, // 3 Lancer Cyborgs
		// 		cTempl.scytk, // 1 Super TK Cyborg
		// 		cTempl.comhatt, cTempl.comhatt, // 2 Tank Killers
		// 		cTempl.cohhrat, cTempl.cohhrat, // 2 HRAs
		// 	],
		// ];

		hoverTemplates = [
			cTempl.comhpvh, cTempl.comhpvh,
			cTempl.comhath, cTempl.comhath,
			cTempl.cohhrah, cTempl.cohhrah,
			cTempl.cohbbh,
		];

		aaSupport = ((difficulty >= HARD || getMissionTime() < camMinutesToSeconds(10)) ? cTempl.cohraat : cTempl.comhaat);
	}

	// Spawn units from every active ground entrance
	if (groundCompositions.length > 0)
	{
		for (const entrance of groundEntrances)
		{
			// Use the "spread" operator (...) here to make a shallow copy of the template list
			// Since we don't want to modify the source templates when we add AA support
			const droids = [...camRandFrom(groundCompositions)];

			// Add AA support
			if ((difficulty <= EASY && camRand(2) === 0) || difficulty >= MEDIUM)
			{
				droids.push(aaSupport);
				if (difficulty === INSANE && camRand(2) === 0)
				{
					// 1/2 chance of adding an extra AA unit on Insane
					droids.push(aaSupport);
				}
			}

			camSendReinforcement(CAM_THE_COLLECTIVE, getObject(entrance), droids, CAM_REINFORCE_GROUND, {
				order: CAM_ORDER_ATTACK,
				data: {
					targetPlayer: CAM_HUMAN_PLAYER
				}
			});
		}
	}
	

	// Spawn a few groups from the active hover entrances
	if (hoverEntrances.length > 0)
	{
		let numHoverGroups = 1;
		if (stage === 3) numHoverGroups++;
		if (difficulty >= MEDIUM) numHoverGroups++;
		if (difficulty === INSANE) numHoverGroups++;
		for (let i = 0; i < numHoverGroups; i++)
		{
			const GROUP_SIZE = difficulty + 4;
			const droids = [];
			for (const template of hoverTemplates)
			{
				droids.push(template);
			}

			const HOVER_THRESHOLD = 12;
			let groupData;
			if (enumDroid(CAM_THE_COLLECTIVE).filter((droid) => (droid.propulsion === "hover01")).length < HOVER_THRESHOLD)
			{
				// If there aren't already a bunch of hover tanks, tell the new group to patrol
				groupData = {order: CAM_ORDER_PATROL, data: {
					pos: [
						camMakePos("hoverPatrolPos1"),
						camMakePos("hoverPatrolPos2"),
						camMakePos("hoverPatrolPos3"),
						camMakePos("hoverPatrolPos4"),
						camMakePos("hoverPatrolPos5"),
						camMakePos("hoverPatrolPos6"),
					],
					interval: camSecondsToMilliseconds(28),
					radius: 20,
					repair: 60
				}};
			}
			else
			{
				// Otherwise, tell the group to attack
				groupData = {order: CAM_ORDER_ATTACK, data: {
					targetPlayer: CAM_HUMAN_PLAYER,
					repair: 40
				}};
			}

			camSendReinforcement(CAM_THE_COLLECTIVE, getObject(camRandFrom(hoverEntrances)), droids, CAM_REINFORCE_GROUND, groupData);
		}
	}

	// Finally, send trucks to build/maintain Collective LZs
	if (reinforcementIndex % 2 == 0)
	{
		sendCollectiveTrucks();
	}

	reinforcementIndex++;
}

function sendCollectiveTrucks()
{
	// Southeast LZ
	if (stage >= 2 && !camDef(camGetTruck(colLZTruckJob1)) && camAreaSecure("colLZ1", CAM_THE_COLLECTIVE))
	{
		camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry10", cTempl.comtruckt), colLZTruckJob1);
	}
	// Northeast LZ
	if (stage >= 2 && !camDef(camGetTruck(colLZTruckJob2)) && camAreaSecure("colLZ2", CAM_THE_COLLECTIVE))
	{
		camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry8", cTempl.comtruckt), colLZTruckJob2);
	}
	// Central LZ
	if (civ3Loaded && camBaseIsEliminated("charlieCentralBase") && camAreaSecure("colLZ3", CAM_THE_COLLECTIVE))
	{
		if (!camDef(camGetTruck(colLZTruckJob3)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry7", cTempl.comtruckht), colLZTruckJob3);
		}
		if (!camDef(camGetTruck(colLZTruckJob4)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry8", cTempl.comtruckht), colLZTruckJob4);
		}
	}
	// North LZ
	if (camBaseIsEliminated("deltaNorthBase") && camAreaSecure("colLZ4", CAM_THE_COLLECTIVE))
	{
		if (!camDef(camGetTruck(colLZTruckJob5)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry3", cTempl.comtruckt), colLZTruckJob5);
		}
		if (!camDef(camGetTruck(colLZTruckJob6)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry3", cTempl.comtruckt), colLZTruckJob6);
		}
	}
	// South LZ
	if (camBaseIsEliminated("charlieSouthBase") && camAreaSecure("colLZ5", CAM_THE_COLLECTIVE))
	{
		if (!camDef(camGetTruck(colLZTruckJob7)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry5", cTempl.comtruckt), colLZTruckJob7);
		}
		if (!camDef(camGetTruck(colLZTruckJob8)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry6", cTempl.comtruckt), colLZTruckJob8);
		}
	}
	// West LZ
	if (civ5Loaded && camBaseIsEliminated("deltaNorthBase") && camAreaSecure("colLZ6", CAM_THE_COLLECTIVE))
	{
		if (!camDef(camGetTruck(colLZTruckJob9)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry2", cTempl.comtruckt), colLZTruckJob9);
		}
		if (!camDef(camGetTruck(colLZTruckJob10)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry2", cTempl.comtruckt), colLZTruckJob10);
		}
	}
	
	// Collective bases
	if (stage === 3)
	{
		// Ground Shaker base
		if (!camDef(camGetTruck(colBaseTruckJob1)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry12", cTempl.comtruckt), colBaseTruckJob1);
		}
		if (!camDef(camGetTruck(colBaseTruckJob2)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry13", cTempl.comtruckt), colBaseTruckJob2);
		}
		if (!camDef(camGetTruck(colBaseTruckJob3)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry12", cTempl.comtruckht), colBaseTruckJob3);
		}
		if (!camDef(camGetTruck(colBaseTruckJob4)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry13", cTempl.comtruckht), colBaseTruckJob4);
		}
		// Overlook base
		if (!camDef(camGetTruck(colBaseTruckJob5)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry14", cTempl.comtruckt), colBaseTruckJob5);
		}
		if (!camDef(camGetTruck(colBaseTruckJob6)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry14", cTempl.comtruckt), colBaseTruckJob6);
		}
		// Ripple base
		if (!camDef(camGetTruck(colBaseTruckJob7)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry14", cTempl.comtruckt), colBaseTruckJob7);
		}
		if (!camDef(camGetTruck(colBaseTruckJob8)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry14", cTempl.comtruckt), colBaseTruckJob8);
		}
		// Trench base
		if (!camBaseIsEliminated("colTrenchOutpost"))
		{
			if (!camDef(camGetTruck(colBaseTruckJob9)))
			{
				camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry15", cTempl.comtruckht), colBaseTruckJob9);
			}
			if (!camDef(camGetTruck(colBaseTruckJob10)))
			{
				camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry15", cTempl.comtruckht), colBaseTruckJob10);
			}
		}
		// Factory base
		if (!camDef(camGetTruck(colBaseTruckJob11)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry11", cTempl.comtruckt), colBaseTruckJob11);
		}
		if (!camDef(camGetTruck(colBaseTruckJob12)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry11", cTempl.comtruckt), colBaseTruckJob12);
		}
		if (!camDef(camGetTruck(colBaseTruckJob13)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry11", cTempl.comtruckht), colBaseTruckJob13);
		}
		// Central base
		if (camBaseIsEliminated("deltaEastBase") && camAreaSecure("colBase6", CAM_THE_COLLECTIVE))
		{
			if (!camDef(camGetTruck(colBaseTruckJob14)))
			{
				camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry10", cTempl.comtruckt), colBaseTruckJob14);
			}
			if (!camDef(camGetTruck(colBaseTruckJob15)))
			{
				camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry12", cTempl.comtruckht), colBaseTruckJob15);
			}
			if (!camDef(camGetTruck(colBaseTruckJob16)))
			{
				camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry13", cTempl.comtruckht), colBaseTruckJob63);
			}
		}
	}
}

// Set victory data
// Called on a delay to avoid failing the player if Charlie's units aren't transferred fast enough
function setVictory()
{
	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, "THE_END", {
		showArtifacts: false
	});
}

function eventAttacked(victim, attacker)
{
	if (!camDef(victim) || !camDef(attacker))
	{
		return;
	}

	if (victim.player == CAM_THE_COLLECTIVE && attacker.player == CAM_HUMAN_PLAYER)
	{
		camCallOnce("collectiveDialogue");
	}
}

function eventDestroyed(obj)
{
	if (obj.type === DROID)
	{
		if (obj.player === CAM_HUMAN_PLAYER)
		{
			if (stage === 1 && obj.droidType === DROID_CONSTRUCT)
			{
				const label = getLabel(obj);
				if (!camDef(label))
				{
					return; // Don't care
				}

				if (label === "civTruck1" && !truck1Safe)
				{
					// Transport Truck destroyed before reaching the deposit zone
					trucksLost++;
					playSound(cam_sounds.objective.objectiveDestroyed);
				}
				if (label === "civTruck2" && !truck2Safe)
				{
					trucksLost++;
					playSound(cam_sounds.objective.objectiveDestroyed);
				}
				if (label === "civTruck3" && !truck3Safe)
				{
					trucksLost++;
					playSound(cam_sounds.objective.objectiveDestroyed);
				}
				if (label === "civTruck4" && !truck4Safe)
				{
					trucksLost++;
					playSound(cam_sounds.objective.objectiveDestroyed);
				}
				if (label === "civTruck5" && !truck5Safe)
				{
					trucksLost++;
					playSound(cam_sounds.objective.objectiveDestroyed);
				}

				if (!transportTrucksActive())
				{
					// If there are no transport trucks active, remove the deposit beacon
					hackRemoveMessage("CIV_DEPOSIT", PROX_MSG, CAM_HUMAN_PLAYER);
					depositBeaconActive = false;
				}

				// Update the objective message
				camSetExtraObjectiveMessage(
					[_("Use Trucks to escort civilians back to the haven"),
						"Don't lose " + MIS_LOST_THRESHOLD + " Transport Trucks (" + trucksLost + " LOST)"]
				);

				checkTrucksLost();
				checkCivsDone();
			}
			else if (stage === 2)
			{
				// Check if Delta's transport team was wiped out
				deltaGroupAlive();
			}
		}
		else if (obj.droidType === DROID_COMMAND)
		{
			// Mark when allied commanders die
			if (obj.player === MIS_TEAM_CHARLIE)
			{
				charlieCommanderDeathTime = gameTime;
			}
			else if (obj.player === MIS_TEAM_DELTA)
			{
				deltaCommanderDeathTime = gameTime;
			}
		}
	}
}

// Re-label Charlie's/Delta's commander/sensor
function eventDroidBuilt(droid, structure)
{
	if (droid.player === MIS_TEAM_CHARLIE && droid.droidType === DROID_COMMAND)
	{
		// Charlie commander rebuilt
		addLabel(droid, "charlieCommander");
		camSetDroidRank(getObject("charlieCommander"), MIS_ALLY_COMMANDER_RANK);
	}
	else if (droid.player === MIS_TEAM_DELTA)
	{
		if (droid.droidType === DROID_COMMAND)
		{
			// Delta commander rebuilt
			addLabel(droid, "deltaCommander");
			camSetDroidRank(getObject("deltaCommander"), MIS_ALLY_COMMANDER_RANK);
		}
		else if (droid.droidType === DROID_SENSOR)
		{
			// Delta sensor
			addLabel(droid, "deltaVtolSensor");
		}
	}
}

// Store the IDs of the Delta's transport units when they're given to the player
// Also handle civilian escorts
function eventObjectTransfer(obj, from)
{
	if (obj.type === DROID)
	{
		if (obj.player === CAM_HUMAN_PLAYER && from === MIS_TEAM_DELTA)
		{
			deltaUnitIDs.push(obj.id);
		}
		else if (obj.player === MIS_CIV_ESCORTS && from === MIS_CIVS)
		{
			// Order this unit to guard a nearby Transport Truck
			// Just look for any labeled truck within 20 tiles
			const transTruck = enumRange(obj.x, obj.y, 20, CAM_HUMAN_PLAYER, false).filter((obj) => 
				(obj.type === DROID && obj.droidType === DROID_CONSTRUCT && camDef(getLabel(obj)))
			)[0];

			if (camDef(transTruck) && transTruck !== null)
			{
				// Guard this truck!
				orderDroidObj(obj, DORDER_GUARD, transTruck);
			}
		}
		else if (obj.player === MIS_TEAM_DELTA && from === CAM_HUMAN_PLAYER)
		{
			// Delta transporter unit safely returned to Delta's base
			if (obj.droidType === DROID_CONSTRUCT)
			{
				// If it's a truck, order it to maintain Delta's base
				camManageTrucks(
					MIS_TEAM_DELTA, {
						label: "deltaMainBase",
						rebuildBase: true,
						rebuildTruck: false,
						truckDroid: obj,
						structset: deltaMainBaseStructs
				});
			}
			else
			{
				// Otherwise, place it in Delta's command group (even if it's full)
				groupAdd(deltaCommandGroup, obj);
			}
		}
	}
}

// Delay when Charlie/Delta can rebuild their commanders
function allowCharlieCommanderRebuild()
{
	return (gameTime >= charlieCommanderDeathTime + MIS_ALLY_COMMANDER_DELAY) && (enumStruct(MIS_TEAM_CHARLIE, COMMAND_CONTROL).length > 0);
}

function allowDeltaCommanderRebuild()
{
	return (gameTime >= deltaCommanderDeathTime + MIS_ALLY_COMMANDER_DELAY) && (enumStruct(MIS_TEAM_DELTA, COMMAND_CONTROL).length > 0);
}

function allowCharlieGeneralVtolGroup()
{
	return (stage >= 2);
}

// -------------------------------------
// --- Stage 1 progression functions ---
// -------------------------------------

function startDeltaTransports()
{
	sendDeltaTransporter();
	setTimer("sendDeltaTransporter", camMinutesToMilliseconds(4));

	// Dialogue...
	camQueueDialogue([
		{text: "DELTA: Lieutenant.", delay: 0, sound: CAM_RCLICK},
		{text: "DELTA: The Collective have pulled back from Bravo's old base.", delay: 2, sound: CAM_RCLICK},
		{text: "DELTA: But it looks like they're still mobilizing most of their forces.", delay: 3, sound: CAM_RCLICK},
		{text: "DELTA: We've started our transport runs now.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Hmm...", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Commanders, make sure to set up some defenses.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Be ready for anything.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...I have a feeling we're not quite out of this yet.", delay: 4, sound: CAM_RCLICK},
	]);
}

function startCollectiveReinforcments()
{
	sendCollectiveReinforcements();
	queue("stageOneVtolAttack", camChangeOnDiff(camMinutesToMilliseconds(1.5)));
	setTimer("sendCollectiveReinforcements", camChangeOnDiff(camMinutesToMilliseconds(3)));
	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(3.5)));

	camCallOnce("collectiveDialogue");
}

function collectiveDialogue()
{
	camQueueDialogue([
		{text: "DELTA: Lieutenant!", delay: 0, sound: CAM_RCLICK},
		{text: "DELTA: We've spotted the Collective forces approaching from the east!", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...Why can't anything ever be simple?", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Commander Bravo, focus on escorting those refugees.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Charlie, Delta, cover Bravo's flanks and help them keep the Collective at bay.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We need to save as many people as we can before we can escape this damned place for good.", delay: 3, sound: CAM_RCLICK},
	]);
}

// Returns true if any Transport Trucks are currently present
function transportTrucksActive()
{
	return getObject("civTruck1") !== null || getObject("civTruck2") !== null
			|| getObject("civTruck3") !== null || getObject("civTruck4") !== null
			|| getObject("civTruck5") !== null;
}

// Check if all civs are accounted for and the mission can move to stage 2
function checkCivsDone()
{
	// Allow the player to move on if:
	// The player has not lost too many Transport Trucks
	// The player has loaded all civilians into Transport Trucks
	// The player does not currently have any Transport Trucks
	if (trucksLost < MIS_LOST_THRESHOLD 
		&& civ1Loaded && civ2Loaded && civ3Loaded && civ4Loaded && civ5Loaded
		&& !transportTrucksActive())
	{
		setStageTwo();
	}
}

// Triggered when the player moves into the first civilian holdout
camAreaEvent("civZone1", function(droid)
{
	// Only trigger if the player moves a Truck (NOT engineer) in which isn't already carrying civilians
	if (droid.player === CAM_HUMAN_PLAYER && droid.droidType === DROID_CONSTRUCT 
		&& droid.propulsion !== "CyborgLegs" && !camDef(getLabel(droid)))
	{
		const pos = camMakePos(droid);
		for (const civ of enumGroup(civGroup1))
		{
			// Move the civs towards the truck
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}

		queue("loadTruck1", camSecondsToMilliseconds(3));

	}
	else
	{
		resetLabel("civZone1", CAM_HUMAN_PLAYER);
	}
});

function loadTruck1()
{
	const trucks = enumArea("civZone1", CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === DROID && obj.droidType === DROID_CONSTRUCT 
		&& obj.propulsion !== "CyborgLegs" && !camDef(getLabel(obj))
	));
	// Abort if there's no longer a truck in the civilian zone
	if (trucks.length == 0)
	{
		const pos = camMakePos("civZone1");
		for (const civ of enumGroup(civGroup1))
		{
			// Move the civs back into their holdout
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}
		resetLabel("civZone1", CAM_HUMAN_PLAYER);
		return;
	}
	else
	{
		// Just change the first truck we find into a Transport Truck
		const transTruck = convertToTransport(trucks[0], "civTruck1");

		for (const droid of enumGroup(civGroup1))
		{
			if (camDroidMatchesTemplate(droid, cTempl.civ))
			{
				// If we have a simple civilian, remove them quietly
				// (They've "boarded" the truck)
				camSafeRemoveObject(droid);
			}
			else
			{
				// If we have an armed civilian escort, (e.g. a Jeep), move it to the "escorts" team
				donateObject(droid, MIS_CIV_ESCORTS);
			}
		}

		civ1Loaded = true;

		hackRemoveMessage("CIVS1", PROX_MSG, CAM_HUMAN_PLAYER);
		if (!depositBeaconActive)
		{
			hackAddMessage("CIV_DEPOSIT", PROX_MSG, CAM_HUMAN_PLAYER);
			depositBeaconActive = true;
		}
	}
}

camAreaEvent("civZone2", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && droid.droidType === DROID_CONSTRUCT 
		&& droid.propulsion !== "CyborgLegs" && !camDef(getLabel(droid)))
	{
		const pos = camMakePos(droid);
		for (const civ of enumGroup(civGroup2))
		{
			// Move the civs towards the truck
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}

		queue("loadTruck2", camSecondsToMilliseconds(3));

	}
	else
	{
		resetLabel("civZone2", CAM_HUMAN_PLAYER);
	}
});

function loadTruck2()
{
	const trucks = enumArea("civZone2", CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === DROID && obj.droidType === DROID_CONSTRUCT 
		&& obj.propulsion !== "CyborgLegs" && !camDef(getLabel(obj))
	));

	if (trucks.length == 0)
	{
		const pos = camMakePos("civZone2");
		for (const civ of enumGroup(civGroup2))
		{
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}
		resetLabel("civZone2", CAM_HUMAN_PLAYER);
		return;
	}
	else
	{
		const transTruck = convertToTransport(trucks[0], "civTruck2");

		for (const droid of enumGroup(civGroup2))
		{
			if (camDroidMatchesTemplate(droid, cTempl.civ))
			{
				camSafeRemoveObject(droid);
			}
			else
			{
				donateObject(droid, MIS_CIV_ESCORTS);
			}
		}
	}

	civ2Loaded = true;

	hackRemoveMessage("CIVS2", PROX_MSG, CAM_HUMAN_PLAYER);
	if (!depositBeaconActive)
	{
		hackAddMessage("CIV_DEPOSIT", PROX_MSG, CAM_HUMAN_PLAYER);
		depositBeaconActive = true;
	}
}

camAreaEvent("civZone3", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && droid.droidType === DROID_CONSTRUCT 
		&& droid.propulsion !== "CyborgLegs" && !camDef(getLabel(droid)))
	{
		const pos = camMakePos(droid);
		for (const civ of enumGroup(civGroup3))
		{
			// Move the civs towards the truck
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}

		queue("loadTruck3", camSecondsToMilliseconds(3));

	}
	else
	{
		resetLabel("civZone3", CAM_HUMAN_PLAYER);
	}
});

function loadTruck3()
{
	const trucks = enumArea("civZone3", CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === DROID && obj.droidType === DROID_CONSTRUCT 
		&& obj.propulsion !== "CyborgLegs" && !camDef(getLabel(obj))
	));

	if (trucks.length == 0)
	{
		const pos = camMakePos("civZone3");
		for (const civ of enumGroup(civGroup3))
		{
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}
		resetLabel("civZone3", CAM_HUMAN_PLAYER);
		return;
	}
	else
	{
		const transTruck = convertToTransport(trucks[0], "civTruck3");

		for (const droid of enumGroup(civGroup3))
		{
			if (camDroidMatchesTemplate(droid, cTempl.civ))
			{
				camSafeRemoveObject(droid);
			}
			else
			{
				donateObject(droid, MIS_CIV_ESCORTS);
			}
		}
	}

	civ3Loaded = true;

	// Make Charlie push up again
	camCallOnce("advanceCharlie2");

	hackRemoveMessage("CIVS3", PROX_MSG, CAM_HUMAN_PLAYER);
	if (!depositBeaconActive)
	{
		hackAddMessage("CIV_DEPOSIT", PROX_MSG, CAM_HUMAN_PLAYER);
		depositBeaconActive = true;
	}
}

camAreaEvent("civZone4", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && droid.droidType === DROID_CONSTRUCT 
		&& droid.propulsion !== "CyborgLegs" && !camDef(getLabel(droid)))
	{
		const pos = camMakePos(droid);
		for (const civ of enumGroup(civGroup4))
		{
			// Move the civs towards the truck
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}

		queue("loadTruck4", camSecondsToMilliseconds(3));

	}
	else
	{
		resetLabel("civZone4", CAM_HUMAN_PLAYER);
	}
});

function loadTruck4()
{
	const trucks = enumArea("civZone4", CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === DROID && obj.droidType === DROID_CONSTRUCT 
		&& obj.propulsion !== "CyborgLegs" && !camDef(getLabel(obj))
	));

	if (trucks.length == 0)
	{
		const pos = camMakePos("civZone4");
		for (const civ of enumGroup(civGroup4))
		{
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}
		resetLabel("civZone4", CAM_HUMAN_PLAYER);
		return;
	}
	else
	{
		const transTruck = convertToTransport(trucks[0], "civTruck4");

		for (const droid of enumGroup(civGroup4))
		{
			if (camDroidMatchesTemplate(droid, cTempl.civ))
			{
				camSafeRemoveObject(droid);
			}
			else
			{
				donateObject(droid, MIS_CIV_ESCORTS);
			}
		}
	}

	civ4Loaded = true;

	// Make Delta push up
	camCallOnce("advanceDelta");

	hackRemoveMessage("CIVS4", PROX_MSG, CAM_HUMAN_PLAYER);
	if (!depositBeaconActive)
	{
		hackAddMessage("CIV_DEPOSIT", PROX_MSG, CAM_HUMAN_PLAYER);
		depositBeaconActive = true;
	}
}

camAreaEvent("civZone5", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && droid.droidType === DROID_CONSTRUCT 
		&& droid.propulsion !== "CyborgLegs" && !camDef(getLabel(droid)))
	{
		const pos = camMakePos(droid);
		for (const civ of enumGroup(civGroup5))
		{
			// Move the civs towards the truck
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}

		queue("loadTruck5", camSecondsToMilliseconds(3));

	}
	else
	{
		resetLabel("civZone5", CAM_HUMAN_PLAYER);
	}
});

function loadTruck5()
{
	const trucks = enumArea("civZone5", CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === DROID && obj.droidType === DROID_CONSTRUCT 
		&& obj.propulsion !== "CyborgLegs" && !camDef(getLabel(obj))
	));

	if (trucks.length == 0)
	{
		const pos = camMakePos("civZone5");
		for (const civ of enumGroup(civGroup5))
		{
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}
		resetLabel("civZone5", CAM_HUMAN_PLAYER);
		return;
	}
	else
	{
		const transTruck = convertToTransport(trucks[0], "civTruck5");

		for (const droid of enumGroup(civGroup5))
		{
			if (camDroidMatchesTemplate(droid, cTempl.civ))
			{
				camSafeRemoveObject(droid);
			}
			else
			{
				donateObject(droid, MIS_CIV_ESCORTS);
			}
		}
	}

	civ5Loaded = true;

	// Make Charlie push up
	camCallOnce("advanceCharlie1");

	hackRemoveMessage("CIVS5", PROX_MSG, CAM_HUMAN_PLAYER);
	if (!depositBeaconActive)
	{
		hackAddMessage("CIV_DEPOSIT", PROX_MSG, CAM_HUMAN_PLAYER);
		depositBeaconActive = true;
	}
}

// Replaces the given truck droid with a transport truck
function convertToTransport(truck, transportLabel)
{
	const oldTruckName = truck.name;
	const tBody = truck.body;
	const tProp = truck.propulsion;
	const tPos = camMakePos(truck);

	// Get the un-modified name of this truck
	const standardName = _("Truck") + " " + camGetCompNameFromId(tBody, "Body") + " " + camGetCompNameFromId(tProp, "Propulsion");

	let newName;
	if (oldTruckName === standardName)
	{
		// The player hasn't renamed this truck.
		// Give it the default template name
		newName = camNameTemplate("Spade1Trans", tBody, tProp);
	}
	else
	{
		// The player has renamed this truck
		// Just slap "Transport" in front of the player's goofy name
		newName = _("Transport") + " " + oldTruckName;
	}

	// Create the new truck
	const newTruck = camAddDroid(CAM_HUMAN_PLAYER, tPos, {body: tBody, prop: tProp, weap: "Spade1Trans"}, newName);
	addLabel(newTruck, transportLabel);

	// Quietly remove the old truck...
	camSafeRemoveObject(truck);

	return newTruck;
}

// Triggered when something enters the deposit zone
camAreaEvent("depositZone", function(droid)
{
	// Only trigger if the player moves a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		const label = getLabel(droid);
		if (camDef(label))
		{
			if (label === "civTruck1")
			{
				truck1Safe = true;
			}
			else if (label === "civTruck2")
			{
				truck2Safe = true;
			}
			else if (label === "civTruck3")
			{
				truck3Safe = true;
			}
			else if (label === "civTruck4")
			{
				truck4Safe = true;
			}
			else if (label === "civTruck5")
			{
				truck5Safe = true;
			}

			convertToTruck(droid);

			playSound(cam_sounds.rescue.civilianRescued);
		}
	}
	else if (droid.player === MIS_CIVS)
	{
		// If we have a normal civilian, just remove it
		camSafeRemoveObject(droid);
	}
	resetLabel("depositZone", ALL_PLAYERS);
});

// Replaces the given transport truck droid with a normal truck
function convertToTruck(transTruck)
{
	const oldTruckName = transTruck.name;
	const tBody = transTruck.body;
	const tProp = transTruck.propulsion;
	const tPos = camMakePos(transTruck);

	// Get the un-modified name of this truck
	const standardName = _("Transport Truck") + " " + camGetCompNameFromId(tBody, "Body") + " " + camGetCompNameFromId(tProp, "Propulsion");

	let newName;
	if (oldTruckName === standardName)
	{
		// The player didn't renamed the original truck.
		// Give it the default template name
		newName = camNameTemplate("Spade1Mk1", tBody, tProp)
	}
	else
	{
		// The player renamed the original truck.
		// Remove the first instance of "Transport " we find
		const prefix = _("Transport") + " ";
		newName = oldTruckName.slice(prefix.length);
	}

	// Create the new truck
	const newTruck = camAddDroid(CAM_HUMAN_PLAYER, tPos, {body: tBody, prop: tProp, weap: "Spade1Mk1"}, newName);

	// Quietly remove the transport truck...
	camSafeRemoveObject(transTruck);
}

// Make sure the player hasn't lost too many transport trucks
// Fail the mission if too many die
// Called during stage 1
function checkTrucksLost()
{
	if (trucksLost >= MIS_LOST_THRESHOLD)
	{
		// Player has lost too many Transport Trucks
		camEndMission(false);
	}
}

function advanceCharlie1()
{
	// Enable Charlie's bridge base
	camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieBridgeBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			template: cTempl.plhtruckht,
			structset: camA4L6CharlieBase2Structs
	});
	camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieBridgeBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_ENGINEER_TIME,
			template: cTempl.cyben,
			structset: camA4L6CharlieBase2Structs
	});
}

function advanceCharlie2()
{
	// Enable Charlie's south and central base
	camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieSouthBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			template: cTempl.plhtruckht,
			structset: camA4L6CharlieBase3Structs
	});
	camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieSouthBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_ENGINEER_TIME,
			template: cTempl.cyben,
			structset: camA4L6CharlieBase3Structs
	});
	camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieSouthBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_ENGINEER_TIME,
			template: cTempl.cyben,
			structset: camA4L6CharlieBase3Structs
	});
	camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieCentralBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			template: cTempl.plhtruckht,
			structset: camA4L6CharlieBase4Structs
	});
	camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieCentralBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_ENGINEER_TIME,
			template: cTempl.cyben,
			structset: camA4L6CharlieBase4Structs
	});
	camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieCentralBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_ENGINEER_TIME,
			template: cTempl.cyben,
			structset: camA4L6CharlieBase4Structs
	});

	// Also make Charlie's commander more aggressive
	camManageGroup(charlieCommander, CAM_ORDER_PATROL, {
		pos: [
			camMakePos("southPatrolPos1"),
			camMakePos("southPatrolPos2"),
			camMakePos("southPatrolPos3"),
		],
		interval: camSecondsToMilliseconds(35),
		radius: 32,
		repair: 75,
		removable: false
	});
}

function advanceDelta()
{
	// Enable Delta's north base
	camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaNorthBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			template: cTempl.plhtruckt,
			structset: camA4L6DeltaBase2Structs
	});
	camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaNorthBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			template: cTempl.plhtruckt,
			structset: camA4L6DeltaBase2Structs
	});
	camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaNorthBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			template: cTempl.plhtruckt,
			structset: camA4L6DeltaBase2Structs
	});

	// Also make Delta's commander more aggressive
	camManageGroup(deltaCommander, CAM_ORDER_PATROL, {
		pos: [
			camMakePos("northPatrolPos2"),
			camMakePos("northPatrolPos3"),
		],
		interval: camSecondsToMilliseconds(75),
		radius: 20,
		repair: 50,
		removable: false
	});
}

// -------------------------------------
// --- Stage 2 progression functions ---
// -------------------------------------

// Expand the map, and order the player to rescue Delta's transport
// Also make the Collective more aggressive and activate their eastern bases
function setStageTwo()
{
	stage = 2;

	camSetExtraObjectiveMessage([_("Escort team Delta's lost group back to base"), _("At least one Delta unit must survive")]);

	// Expand the map
	setScrollLimits(0, 0, 216, 96);

	// Place a beacon on Delta's holdout
	hackAddMessage("DELTA_HOLDOUT", PROX_MSG, CAM_HUMAN_PLAYER);

	// Move Delta's group into the holdout
	camManageGroup(deltaCrashGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("crashDefensePos"),
		radius: 10
	})

	// VTOL attack
	camSetVtolSpawnStateAll(false); // Disable the stage 1 VTOLs
	queue("stageTwoVtolAttack", camSecondsToMilliseconds(30));

	// Enable Collective factories
	camEnableFactory("colFactory1");
	camEnableFactory("colFactory2");
	camEnableFactory("colFactory3");
	camEnableFactory("colCybFactory1");
	camEnableFactory("colCybFactory2");

	// Slow down Collective reinforcement waves
	removeTimer("sendCollectiveReinforcements");
	setTimer("sendCollectiveReinforcements", camChangeOnDiff(camMinutesToMilliseconds(5)));

	// Manage Collective base trucks
	colBaseTruckJob1 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colShakerBase",
			rebuildBase: true,
			rebuildTruck: false, // Collective trucks are brought in as reinforcements
			template: cTempl.comtruckt,
			structset: colBase1Structs
	});
	colBaseTruckJob2 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colShakerBase",
			rebuildBase: true,
			rebuildTruck: false,
			template: cTempl.comtruckt,
			structset: colBase1Structs
	});
	colBaseTruckJob3 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colShakerBase",
			rebuildBase: true,
			rebuildTruck: false,
			template: cTempl.comtruckht,
			structset: colBase1Structs
	});
	colBaseTruckJob4 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colShakerBase",
			rebuildBase: true,
			rebuildTruck: false,
			template: cTempl.comtruckht,
			structset: colBase1Structs
	});
	colBaseTruckJob5 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colOverlookBase",
			rebuildBase: true,
			rebuildTruck: false,
			template: cTempl.comtruckt,
			structset: colBase2Structs
	});
	colBaseTruckJob6 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colOverlookBase",
			rebuildBase: true,
			rebuildTruck: false,
			template: cTempl.comtruckt,
			structset: colBase2Structs
	});
	colBaseTruckJob7 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colRippleBase",
			rebuildBase: true,
			rebuildTruck: false,
			template: cTempl.comtruckt,
			structset: colBase3Structs
	});
	colBaseTruckJob8 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colRippleBase",
			rebuildBase: true,
			rebuildTruck: false,
			template: cTempl.comtruckt,
			structset: colBase3Structs
	});
	colBaseTruckJob9 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colTrenchOutpost", // NOTE: Don't rebuild this base if destroyed
			rebuildTruck: false,
			template: cTempl.comtruckht,
			structset: colBase4Structs
	});
	colBaseTruckJob10 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colTrenchOutpost",
			rebuildTruck: false,
			template: cTempl.comtruckht,
			structset: colBase4Structs
	});
	colBaseTruckJob11 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colFactoryBase",
			rebuildBase: true,
			rebuildTruck: false,
			template: cTempl.comtruckt,
			structset: colBase5Structs
	});
	colBaseTruckJob12 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colFactoryBase",
			rebuildBase: true,
			rebuildTruck: false,
			template: cTempl.comtruckt,
			structset: colBase5Structs
	});
	colBaseTruckJob13 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colFactoryBase",
			rebuildBase: true,
			rebuildTruck: false,
			template: cTempl.comtruckht,
			structset: colBase5Structs
	});
	// This base starts unbuilt
	colBaseTruckJob14 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colCentralBase",
			rebuildBase: true,
			rebuildTruck: false,
			structset: camA4L6ColBase6Structs
	});
	colBaseTruckJob15 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colCentralBase",
			rebuildBase: true,
			rebuildTruck: false,
			structset: camA4L6ColBase6Structs
	});
	colBaseTruckJob16 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colCentralBase",
			rebuildBase: true,
			rebuildTruck: false,
			structset: camA4L6ColBase6Structs
	});

	// Enable Delta's east base 
	camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaEastBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			template: cTempl.plhtruckt,
			structset: camA4L6DeltaBase3Structs
	});
	camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaEastBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			template: cTempl.plhtruckt,
			structset: camA4L6DeltaBase3Structs
	});
	// Also tell Delta's crashed trucks to build defenses in the holdout
	camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaCrashHoldout",
			rebuildBase: true,
			rebuildTruck: false,
			truckDroid: getObject("deltaCrashTruck1"),
			structset: deltaHoldoutStructs
	});
	camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaCrashHoldout",
			rebuildBase: true,
			rebuildTruck: false,
			truckDroid: getObject("deltaCrashTruck2"),
			structset: deltaHoldoutStructs
	});

	// Move Charlie/Delta groups further up
	camManageGroup(charlieCommander, CAM_ORDER_PATROL, {
		pos: [
			camMakePos("southPatrolPos2"),
			camMakePos("southPatrolPos3"),
			camMakePos("southPatrolPos4"),
			camMakePos("southPatrolPos5"),
			camMakePos("southPatrolPos6"),
		],
		interval: camSecondsToMilliseconds(35),
		radius: 32,
		repair: 75,
		removable: false
	});
	camManageGroup(charlieCommandGroup, CAM_ORDER_FOLLOW, {
		leader: "charlieCommander",
		repair: 75,
		suborder: CAM_ORDER_PATROL, // Fall back a bit if the commander dies
		data: {
			pos: [
				camMakePos("southPatrolPos1"),
				camMakePos("southPatrolPos2"),
				camMakePos("southPatrolPos3"),
			],
			interval: camSecondsToMilliseconds(35),
			radius: 32,
			repair: 75,
			removable: false
		}
	});
	camManageGroup(deltaCommander, CAM_ORDER_PATROL, {
		pos: [
			camMakePos("northPatrolPos3"),
			camMakePos("northPatrolPos4"),
			camMakePos("northPatrolPos5"),
			camMakePos("northPatrolPos6"),
		],
		interval: camSecondsToMilliseconds(75),
		radius: 20,
		repair: 50,
		removable: false
	});
	camManageGroup(deltaCommandGroup, CAM_ORDER_FOLLOW, {
		leader: "deltaCommander",
		repair: 50,
		suborder: CAM_ORDER_PATROL, // Fall back a bit if the commander dies
		data: {
			pos: [
				camMakePos("northPatrolPos1"),
				camMakePos("northPatrolPos2"),
				camMakePos("northPatrolPos3"),
			],
			interval: camSecondsToMilliseconds(75),
			radius: 32,
			repair: 50,
			removable: false
		}
	});

	// Pre-damage Delta's crashed units
	for (const obj of enumArea("deltaCrashGroup", MIS_TEAM_DELTA, false))
	{
		// 40% to 60% HP
		setHealth(obj, 40 + camRand(21));
	}

	// Spawn small harassment groups against Delta's transport
	setTimer("sendTransportHarassGroup", camMinutesToMilliseconds(4));

	// Gradually set the skies to be rainy
	camGradualFog(camMinutesToMilliseconds(2), 149, 165, 169);
	camGradualSunIntensity(camMinutesToMilliseconds(2), .45,.45,.45);
	camSetWeather(CAM_WEATHER_RAIN);

	// Hack to prevent the east half of the map from being dark after the expansion
	camSetSunPos(-450.0, -401.0, 225.0); // Move the sun just a wee bit 

	// Dialogue...
	camCallOnce("collectiveDialogue");
	camQueueDialogue([
		{text: "DELTA: Lieutenant!", delay: 3, sound: CAM_RCLICK},
		{text: "DELTA: The Collective just downed one of our transports some sort of surface-to-air missile!", delay: 2, sound: CAM_RCLICK},
		{text: "DELTA: It's crashed to the east of our position!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Commander Bravo, take a rescue team, and bring the survivors of that crash back to base.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Commanders Charlie, Delta, cover team Bravo and keep the Collective off of their back.", delay: 4, sound: CAM_RCLICK},
		// Delay...
		{text: "CHARLIE: Heads up, Bravo!", delay: 12, sound: CAM_RCLICK},
		{text: "CHARLIE: We're detecting some Collective bases to the east.", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: You'll have to break through their blockade to reach the crash site!", delay: 4, sound: CAM_RCLICK},
		// Long delay...
		{text: "CHARLIE: Lieutenant, we're detecting more of those SAM launchers in the areas surrounding our base.", delay: 60, sound: CAM_RCLICK},
		{text: "CHARLIE: The Collective is trying to box us in!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...This just keeps getting worse, huh?", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We're not going to be able to flee using transports until we come up with a backup plan.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Commanders, make sure to fortify our position.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Set up as many defenses as you can!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: The Collective won't let us leave without a fight!", delay: 3, sound: CAM_RCLICK},
	]);
}

// Triggered when the player enters Delta's transport holdout
camAreaEvent("deltaBase4", function(droid)
{
	// Only trigger if the player moves a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Remove the holdout beacon
		hackRemoveMessage("DELTA_HOLDOUT", PROX_MSG, CAM_HUMAN_PLAYER);
		// Place a beacon at Delta's base
		hackAddMessage("DELTA_DEPOSIT", PROX_MSG, CAM_HUMAN_PLAYER);

		// Donate all units/structures in the holdout to the player
		for (const obj of enumArea("deltaBase4", MIS_TEAM_DELTA, false))
		{
			donateObject(obj, CAM_HUMAN_PLAYER);
		}

		playSound(cam_sounds.unitsTransferred);
	}
	else
	{
		resetLabel("deltaBase4", CAM_HUMAN_PLAYER);
	}
});

// Triggered when the player enters Delta's main base
camAreaEvent("deltaReturnZone", function(droid)
{
	// Only trigger if the player moves a droid in
	if (droid.player === CAM_HUMAN_PLAYER && stage === 2)
	{
		// Check if this droid matches any of the IDs from Delta's transport group
		for (const ID of deltaUnitIDs)
		{
			if (droid.id === ID)
			{
				deltaRescued = true;
				donateObject(droid, MIS_TEAM_DELTA); // Donate it back to team Delta
				queue("deltaGroupAlive", camSecondsToMilliseconds(0.1)); // Check if there's any remaining members
			}
		}
	}
	if (stage < 3) // Don't need this trigger after stage 2
	{
		resetLabel("deltaReturnZone", CAM_HUMAN_PLAYER);
	}
});

// Handle the player recycling one of Delta's transport units
function eventObjectRecycled(obj)
{
	if (stage === 2 && obj.type === DROID && obj.player === CAM_HUMAN_PLAYER)
	{
		deltaGroupAlive();
	}
}

// Spawn a very small group to attack Delta's crash site
function sendTransportHarassGroup()
{
	const droidPool = [
		cTempl.cybhg,
		cTempl.cybag,
		cTempl.cybca,
		cTempl.cybfl,
		cTempl.scymc,
		cTempl.colpodt,
		cTempl.colhmght,
		cTempl.colflamt,
		cTempl.commcant,
	];

	const NUM_DROIDS = 2;
	let droids = [];
	for (let i = 0; i < NUM_DROIDS; i++)
	{
		droids.push(camRandFrom(droidPool));
	}

	camSendReinforcement(CAM_THE_COLLECTIVE, getObject("groundEntry16"), droids, CAM_REINFORCE_GROUND, {
		order: CAM_ORDER_ATTACK,
		data: {
			targetPlayer: MIS_TEAM_DELTA
		}
	});
}

// Make sure that at least one delta unit from the transport makes it back alive
// Fail the mission if all units die before reaching Delta's base
// Advance to stage 3 if at least one unit makes it back and the rest of the group is missing
// Called during stage 2
function deltaGroupAlive()
{
	if (deltaUnitIDs.length > 0)
	{
		unitFound = false;
		for (const ID of deltaUnitIDs)
		{
			if (getObject(DROID, CAM_HUMAN_PLAYER, ID) !== null)
			{
				// The player still has one of Delta's units
				unitFound = true;
			}
		}

		if (!unitFound)
		{
			// No units found
			if (deltaRescued)
			{
				// At least one unit made it back alive; move on to the final stage
				setStageThree();
			}
			else
			{
				// No one made it back alive...
				camEndMission(false);
			}
		}
	}
}

// -------------------------------------
// --- Stage 3 progression functions ---
// -------------------------------------

// Set a 20 minute timer, and make the Collective VERY aggressive
// The player wins when the timer runs out
function setStageThree()
{
	stage = 3;

	// Remove Delta's beacon
	hackRemoveMessage("DELTA_DEPOSIT", PROX_MSG, CAM_HUMAN_PLAYER);

	// Set the mission timer to 20 minutes
	setMissionTime(camMinutesToSeconds(20));
	camSetExtraObjectiveMessage(_("Survive"));

	// More VTOL attacks
	// NOTE: The stage 2 VTOL attacks linked to the Collective CC stay active during this stage
	queue("stageThreeVtolAttack", camMinutesToMilliseconds(2)); // at 18 minutes remaining
	queue("stageThreeVtolAttack", camMinutesToMilliseconds(8)); // at 12 minutes remaining
	queue("stageThreeVtolAttack", camMinutesToMilliseconds(16)); // at 4 minutes remaining

	// Queue large telegraphed ground and air attacks
	queue("groundAssault1", camMinutesToMilliseconds(2)); // at 18 minutes remaining
	queue("airAssault1", camMinutesToMilliseconds(3)); // at 17 minutes remaining
	queue("groundAssault2", camMinutesToMilliseconds(4.5)); // at 15.5 minutes remaining
	queue("airAssault2", camMinutesToMilliseconds(5)); // at 15 minutes remaining
	queue("groundAssault3", camMinutesToMilliseconds(6.5)); // at 13.5 minutes remaining
	queue("airAssault3", camMinutesToMilliseconds(7)); // at 13 minutes remaining
	queue("airAssault4", camMinutesToMilliseconds(8)); // at 12 minutes remaining
	// A bit of a reprieve here...
	queue("groundAssault4", camMinutesToMilliseconds(11)); // at 9 minutes remaining
	queue("airAssault5", camMinutesToMilliseconds(12)); // at 8 minutes remaining
	queue("groundAssault5", camMinutesToMilliseconds(13.5)); // at 6.5 minutes remaining
	queue("airAssault6", camMinutesToMilliseconds(14)); // at 6 minutes remaining
	// Attacks get crazy around here...
	queue("groundAssault6", camMinutesToMilliseconds(16)); // at 4 minutes remaining
	queue("airAssault7", camMinutesToMilliseconds(17)); // at 3 minutes remaining
	queue("airAssault8", camMinutesToMilliseconds(17.5)); // at 2.5 minutes remaining
	queue("groundAssault7", camMinutesToMilliseconds(18)); // at 2 minutes remaining
	queue("airAssault9", camMinutesToMilliseconds(18.5)); // at 1.5 minutes remaining
	queue("airAssault10", camMinutesToMilliseconds(19)); // at 1 minutes remaining
	queue("airAssault11", camMinutesToMilliseconds(19.25)); // at 0.75 minutes remaining

	// Queue "lightening" effects
	queue("startLighteningEffects", camMinutesToMilliseconds(2));

	// Gradually set the skies to be stormy
	camGradualFog(camMinutesToMilliseconds(2), 107, 107, 107);
	camGradualSunIntensity(camMinutesToMilliseconds(2), .35,.35,.35);
	camSetWeather(CAM_WEATHER_RAINSTORM);

	// Dialogue...
	camQueueDialogue([
		{text: "DELTA: Lieutenant, team Bravo has returned the survivors from our transport.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Thank you, Commander Bravo.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We're about to need all the manpower we can get.", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: Lieutenant!", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: We're picking up Collective forces moving away from the city.", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: It looks like they're heading this way, and...", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: ...", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: Sir, there's...", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: ...There's a LOT of them, sir.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Commanders, hunker down and get ready to fight.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...It looks like there's only one way out of this now.", delay: 4, sound: CAM_RCLICK},
	]);
}

function groundAssault1()
{
	// Mark the entry points that are about to be blitzed
	activateGroundBlip(13);
	activateGroundBlip(14);
	activateGroundBlip(15);
	activateGroundBlip(16);

	// Play a sound
	playSound(cam_sounds.enemyUnitDetected);
	
	// Queue the actual units
	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "1");
}

function groundAssault2()
{
	activateGroundBlip(11);
	activateGroundBlip(12);
	activateGroundBlip(15);
	activateGroundBlip(16);
	
	playSound(cam_sounds.enemyUnitDetected);

	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "2");
}

function groundAssault3()
{
	activateGroundBlip(8);
	activateGroundBlip(9);
	activateGroundBlip(14);
	activateGroundBlip(16);
	
	playSound(cam_sounds.enemyUnitDetected);

	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "3");
}

function groundAssault4()
{
	activateGroundBlip(8);
	activateGroundBlip(12);
	activateGroundBlip(14);
	activateGroundBlip(15);
	activateGroundBlip(16);
	
	playSound(cam_sounds.enemyUnitDetected);

	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "4");
}

function groundAssault5()
{
	activateGroundBlip(7);
	activateGroundBlip(8);
	activateGroundBlip(9);
	activateGroundBlip(11);
	activateGroundBlip(12);
	activateGroundBlip(15);
	
	playSound(cam_sounds.enemyUnitDetected);

	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "5");
}

function groundAssault6()
{
	activateGroundBlip(1);
	activateGroundBlip(3);
	activateGroundBlip(4);
	activateGroundBlip(6);
	activateGroundBlip(7);
	activateGroundBlip(8);
	activateGroundBlip(9);
	activateGroundBlip(14);
	
	playSound(cam_sounds.enemyUnitDetected);

	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "6");

	// Live Delta Reaction:
	camQueueDialogue([
		{text: "DELTA: Holy-", delay: 2, sound: CAM_RCLICK},
		{text: "DELTA: How many of them ARE there?!", delay: 2, sound: CAM_RCLICK},
	]);
}

function groundAssault7()
{
	activateGroundBlip(2);
	activateGroundBlip(4);
	activateGroundBlip(5);
	activateGroundBlip(7);
	activateGroundBlip(8);
	
	playSound(cam_sounds.enemyUnitDetected);

	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "7");
}

function activateGroundBlip(index)
{
	const msgName = "COL_ENTRY" + index;

	groundBlips[index] = true;
	hackAddMessage(msgName, PROX_MSG, CAM_HUMAN_PLAYER);
}

function groundAssaultWave(index)
{
	clearGroundBlips();

	switch (index)
	{
		case "1":
			const wave1Templates = [
				[ // Southeast base entry templates
					cTempl.comsensht, // 1 Sensor
					cTempl.comatht, cTempl.comatht, cTempl.comatht, cTempl.comatht, // 4 Lancers
					cTempl.cybla, cTempl.cybla, cTempl.cybla, cTempl.cybla, // 4 Lancer Cyborgs
					cTempl.comatht, cTempl.comatht, cTempl.comatht, cTempl.comatht, cTempl.comatht, cTempl.comatht, // 6 Bombards
					cTempl.cohhowt, cTempl.cohhowt, cTempl.cohhowt, // 3 Howitzers
				],
				[ // Southeast trench entry templates (+commander)
					cTempl.cybhg, cTempl.cybhg, cTempl.cybhg, cTempl.cybhg, // 4 Heavy Machinegunners
					cTempl.scymc, cTempl.scymc, cTempl.scymc, cTempl.scymc, cTempl.scymc, cTempl.scymc, // 6 Super Heavy Gunners
					cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, // 4 HVCs
					cTempl.comhaat, cTempl.comhaat, // 2 Cyclones
				],
				[ // East entry templates (+commander)
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 4 Heavy Cannons
					cTempl.commrat, cTempl.commrat, cTempl.commrat, cTempl.commrat, cTempl.commrat, cTempl.commrat, // 6 MRAs
					cTempl.comhmgt, cTempl.comhmgt, // 2 HMGs
					cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, // 4 Cyclones
				],
				[ // Northeast entry templates (+commander)
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 4 HRAs
					cTempl.cominft, cTempl.cominft, cTempl.cominft, cTempl.cominft, // 4 Infernos
					cTempl.scymc, cTempl.scymc, cTempl.scymc, cTempl.scymc, cTempl.scymc, // 5 Super Heavy Gunners
					cTempl.comhaat, cTempl.comhaat, // 2 Cyclones
					cTempl.cohraat, // 1 Whirlwind
				],
			];
			sendCollectiveGroundWave("groundEntry13", wave1Templates[0]);
			sendCollectiveGroundWave("groundEntry14", wave1Templates[1], cTempl.comcomt);
			sendCollectiveGroundWave("groundEntry15", wave1Templates[2], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry16", wave1Templates[3], cTempl.cohcomt);
			break;
		case "2":
			const wave2Templates = [
				[ // Northeast base entry templates
					cTempl.comsenst, cTempl.comsenst, // 2 Sensors
					cTempl.comatt, cTempl.comatt, cTempl.comatt, cTempl.comatt, // 4 Lancers
					cTempl.cybla, cTempl.cybla, cTempl.cybla, cTempl.cybla, // 4 Super Grenadiers
					cTempl.comatht, cTempl.comatht, cTempl.comatht, cTempl.comatht, // 4 Bombards
					cTempl.cohhowt, cTempl.cohhowt, // 2 Howitzers
				],
				[ // Southeast base entry templates
					cTempl.comsenst, // 1 Sensor
					cTempl.comatt, cTempl.comatt, cTempl.comatt, cTempl.comatt, // 4 Lancers
					cTempl.comrmortt, cTempl.comrmortt, cTempl.comrmortt, cTempl.comrmortt, cTempl.comrmortt, cTempl.comrmortt, // 6 Pepperpots
					cTempl.cohhowt, cTempl.cohhowt, // 2 Howitzers
				],
				[ // East entry templates (+commander)
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 4 Heavy Cannons
					cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 4 Assault Guns
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 4 Tank Killers
					cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, // 4 Cyclones
				],
				[ // Northeast entry templates (+commander)
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 4 Heavy Cannons
					cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 4 Assault Guns
					cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, // 6 Assault Cannons
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
				],
			];
			sendCollectiveGroundWave("groundEntry11", wave2Templates[0]);
			sendCollectiveGroundWave("groundEntry12", wave2Templates[1]);
			sendCollectiveGroundWave("groundEntry15", wave2Templates[2], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry16", wave2Templates[3], cTempl.cohcomt);
			break;
		case "3":
			const wave3Templates = [
				[ // North road entry templates (+commander)
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 6 Heavy Cannons
					cTempl.cominft, cTempl.cominft,  cTempl.cominft, cTempl.cominft, // 4 Infernos
					cTempl.comagt, cTempl.comagt, // 2 Assault Guns
					cTempl.cohbbt, cTempl.cohbbt, // 2 Bunker Busters
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
				],
				[ // South road entry templates (+commander)
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 6 HRAs
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, // 4 Bunker Busters
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 4 Tank Killers
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
				],
				[ // Southeast base entry templates
					cTempl.comsensht, // 1 Sensor
					cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, // 4 Tank Killers
					cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, // 4 Pepperpots
					cTempl.cohript, cTempl.cohript, cTempl.cohript, cTempl.cohript, // 4 Ripple Rockets
				],
				[ // Northeast entry templates
					cTempl.comsenst, // 1 Sensor
					cTempl.cohhowt, cTempl.cohhowt, // 2 Howitzers
					cTempl.cohript, cTempl.cohript, cTempl.cohript, cTempl.cohript, cTempl.cohript, cTempl.cohript, // 6 Ripple Rockets
				],
			];
			sendCollectiveGroundWave("groundEntry8", wave3Templates[0], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry9", wave3Templates[1], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry14", wave3Templates[2]);
			sendCollectiveGroundWave("groundEntry16", wave3Templates[3]);
			break;
		case "4":
			const wave4Templates = [
				[ // North road entry templates (+commander)
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 4 Heavy Cannons
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, // 4 Bunker Busters
					cTempl.cominft, cTempl.cominft, cTempl.cominft, cTempl.cominft, // 4 Infernos
					cTempl.comhrept, cTempl.comhrept, // 2 Heavy Repair Turrets
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
				],
				[ // Southeast base entry templates
					cTempl.comsensht, cTempl.comsensht, // 2 Sensors
					cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, // 6 Super Tank Killer Cyborgs
					cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, // 4 Pepperpots
					cTempl.cohhowt, cTempl.cohhowt, // 2 Howitzers
				],
				[ // Southeast trench entry templates (+commander)
					cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, // 6 Assault Cannons
					cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 6 Assault Guns
					cTempl.comhrept, cTempl.comhrept, cTempl.comhrept, cTempl.comhrept, // 4 Heavy Repair Turrets
				],
				[ // East entry templates (+commander)
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 6 HRAs
					cTempl.comhrept, cTempl.comhrept, cTempl.comhrept, cTempl.comhrept, // 4 Heavy Repair Turrets
					cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, // 4 Cyclones
					cTempl.comsamt, cTempl.comsamt, // 2 Avenger SAMs
				],
				[ // Northeast entry templates
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 6 Heavy Cannons
					cTempl.commcant, cTempl.commcant, cTempl.commcant, cTempl.commcant,
					cTempl.commcant, cTempl.commcant, cTempl.commcant, cTempl.commcant, // 8 Medium Cannons
					cTempl.comhmgt, cTempl.comhmgt, cTempl.comhmgt, cTempl.comhmgt, cTempl.comhmgt, cTempl.comhmgt, // 6 HMGs
					cTempl.comhrept, cTempl.comhrept, cTempl.comhrept, cTempl.comhrept, // 4 Heavy Repair Turrets
				],
			];
			sendCollectiveGroundWave("groundEntry8", wave4Templates[0], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry12", wave4Templates[1]);
			sendCollectiveGroundWave("groundEntry14", wave4Templates[2], cTempl.comcomt);
			sendCollectiveGroundWave("groundEntry15", wave4Templates[3], cTempl.comcomt);
			sendCollectiveGroundWave("groundEntry16", wave4Templates[4]);
			break;
		case "5":
			const wave5Templates = [
				[ // Southwest road entry templates (+commander)
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, // 4 Bunker Busters
					cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, // 6 Assault Cannons
					cTempl.comhrept, cTempl.comhrept, cTempl.comhrept, cTempl.comhrept, // 4 Heavy Repair Turrets
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
				],
				[ // North road entry templates (+commander)
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant,
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 8 Heavy Cannons
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 6 HRAs
					cTempl.comhrept, cTempl.comhrept, // 2 Heavy Repair Turrets
				],
				[ // Southeast road entry templates (+commander)
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 6 HRAs
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 4 Tank Killers
					cTempl.comhrept, cTempl.comhrept, // 2 Heavy Repair Turrets
					cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, // 4 Cyclones
				],
				[ // North base entry templates
					cTempl.comsenst, // 1 Sensor
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 4 Tank Killers
					cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, // 6 Bombards
					cTempl.cohript, cTempl.cohript, cTempl.cohript, cTempl.cohript, // 4 Ripple Rockets
				],
				[ // South base entry templates
					cTempl.comsenst, // 1 Sensor
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 4 Tank Killers
					cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, // 6 Bombards
					cTempl.cohript, cTempl.cohript, cTempl.cohript, cTempl.cohript, // 4 Ripple Rockets
				],
				[ // East entry templates
					cTempl.comsensht, cTempl.comsensht, // 2 Sensors
					cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac,
					cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, // 8 Super Auto Cannon Cyborgs
					cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, // 6 Pepperpots
					cTempl.cohript, cTempl.cohript, cTempl.cohript, cTempl.cohript, // 4 Ripple Rockets
				],
			];
			sendCollectiveGroundWave("groundEntry7", wave5Templates[0], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry8", wave5Templates[1], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry9", wave5Templates[2], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry11", wave5Templates[3]);
			sendCollectiveGroundWave("groundEntry12", wave5Templates[4]);
			sendCollectiveGroundWave("groundEntry15", wave5Templates[5]);
			break;
		case "6":
			const wave6Templates = [
				// ALL of these have commanders!!!
				[ // Northwest road entry
					cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 6 Assault Guns
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 6 Tank Killers
					cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, // 4 Whirlwinds
				],
				[ // North road entry
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 6 HRAs
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, // 4 Bunker Busters
					cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, // 4 Assault Cannons
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
				],
				[ // Southwest marsh entry
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 6 Heavy Cannons
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 6 Tank Killers
					cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, // 4 Whirlwinds
				],
				[ // South marsh entry
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, // 6 Bunker Busters
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 6 HRAs
					cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, // 4 Cyclones
				],
				[ // Southeast road entry 1
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, 
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 8 Tank Killers
					cTempl.cominft, cTempl.cominft, cTempl.cominft, cTempl.cominft, // 4 Infernos
					cTempl.comhrept, cTempl.comhrept, // 2 Heavy Repair Turrets
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
				],
				[ // Northeast road entry
					cTempl.cohacant, cTempl.cohacant, cTempl.cohacant, cTempl.cohacant, cTempl.cohacant, cTempl.cohacant, // 6 Assault Cannons
					cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, // 6 HVCs
					cTempl.comhrept, cTempl.comhrept, // 2 Heavy Repair Turrets
					cTempl.comsamt, cTempl.comsamt, // 2 Avenger SAMs
				],
				[ // Southeast road entry 2
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant,
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 8 Heavy Cannons
					cTempl.comhrept, cTempl.comhrept, cTempl.comhrept, cTempl.comhrept, // 4 Heavy Repair Turrets
					cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, // 4 Whirlwinds
				],
				[ // Southeast trench entry
					cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, // 6 HVCs
					cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 6 Assault Guns
					cTempl.comsamt, cTempl.comsamt, cTempl.comsamt, cTempl.comsamt, // 4 Avenger SAMs
				],
			];
			sendCollectiveGroundWave("groundEntry1", wave6Templates[0], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry3", wave6Templates[1], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry4", wave6Templates[2], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry6", wave6Templates[3], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry7", wave6Templates[4], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry8", wave6Templates[5], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry9", wave6Templates[6], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry14", wave6Templates[7], cTempl.cohcomt);
			break;
		case "7":
			const wave7Templates = [
				// A lot of these guys are probably not going to reach the player's base in time anyway...
				[ // Northwest road entry (+commander)
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 6 Heavy Cannons
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 4 Tank Killers
					cTempl.comagt, cTempl.comagt, // 2 Assault Guns
					cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, // 4 Whirlwinds
				],
				[ // Southwest marsh entry (+commander)
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 6 Heavy Cannons
					cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, // 4 Assault Cannons
					cTempl.comhrept, cTempl.comhrept, // 2 Heavy Repair Turrets
					cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, // 4 Whirlwinds
				],
				[ // South marsh entry
					cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, // 6 Tank Killers
					cTempl.comaght, cTempl.comaght, cTempl.comaght, cTempl.comaght, cTempl.comaght, cTempl.comaght, // 6 Assault Guns
					cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, // 6 Super Auto Cannon Cyborgs
					cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth,
					cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, // 8 Thermite Flamer Cyborgs
				],
				[ // Southeast road entry
					cTempl.comsensht, cTempl.comsensht, // 2 Sensors
					cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, // 4 HVCs
					cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, // 6 Super Tank Killer Cyborgs
					cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, // 6 Pepperpots
					cTempl.cohhhowtt, cTempl.cohhhowtt, // 2 Ground Shakers
				],
				[ // Northeast road entry
					cTempl.comsensht, cTempl.comsensht, // 2 Sensors
					cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, // 4 HVCs
					cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, // 6 Super Tank Killer Cyborgs
					cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, // 6 Pepperpots
					cTempl.cohhhowtt, cTempl.cohhhowtt, // 2 Ground Shakers
				],
			];
			sendCollectiveGroundWave("groundEntry2", wave7Templates[0], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry4", wave7Templates[1], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry5", wave7Templates[2]);
			sendCollectiveGroundWave("groundEntry7", wave7Templates[3]);
			sendCollectiveGroundWave("groundEntry8", wave7Templates[4]);
			break;
	}
}

function airAssault1()
{
	activateAirBlip(2);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "1");
}

function airAssault2()
{
	activateAirBlip(4);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "2");
}

function airAssault3()
{
	activateAirBlip(3);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "3");
}

function airAssault4()
{
	activateAirBlip(2);
	activateAirBlip(4);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "4");
}

function airAssault5()
{
	activateAirBlip(5);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "5");
}

function airAssault6()
{
	activateAirBlip(3);
	activateAirBlip(5);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "6");
}

function airAssault7()
{
	activateAirBlip(2);
	activateAirBlip(4);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "7");
}

function airAssault8()
{
	activateAirBlip(4);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "8");
}

function airAssault9()
{
	activateAirBlip(3);
	activateAirBlip(4);
	activateAirBlip(5);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "9");
}

function airAssault10()
{
	activateAirBlip(2);
	activateAirBlip(5);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "10");
}

function airAssault11()
{
	activateAirBlip(4);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "11");
}

function activateAirBlip(index)
{
	const msgName = "AIR_ENTRY" + index;

	airBlips[index] = true;
	hackAddMessage(msgName, PROX_MSG, CAM_HUMAN_PLAYER);
}

function airAssaultWave(index)
{
	clearAirBlips();

	switch (index)
	{
		case "1":
			const wave1Vtols = [
				[cTempl.colatv], // Lancers
				[cTempl.colphosv], // Phosphor Bombs
				[cTempl.comthermv], // Thermite Bombs
			];
			const wave1Extras = [
				{limit: 6},
				{limit: 6},
				{limit: 4},
			];

			// Send some one-time VTOL groups
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", wave1Vtols[0], undefined, undefined, wave1Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", wave1Vtols[1], undefined, undefined, wave1Extras[1]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", wave1Vtols[2], undefined, undefined, wave1Extras[2]);
			break;
		case "2":
			const wave2Vtols = [
				[cTempl.colatv], // Lancers
				[cTempl.colbombv], // Cluster Bombs
				[cTempl.comhbombv], // HEAP Bombs
			];
			const wave2Extras = [
				{limit: 6},
				{limit: 6},
				{limit: 4},
			];

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave3Vtols[0], undefined, undefined, wave3Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave3Vtols[1], undefined, undefined, wave3Extras[1]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave3Vtols[2], undefined, undefined, wave3Extras[2]);
			break;
		case "3":
			const wave3Vtols = [
				[cTempl.colagv], // Assault Guns
				[cTempl.colbombv], // Cluster Bombs
				[cTempl.comacanv], // Assault Cannons
			];
			const wave3Extras = [
				{limit: 6},
				{limit: 4},
				{limit: 6},
			];

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos3", "vtolRemoveZone2", wave3Vtols[0], undefined, undefined, wave3Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos3", "vtolRemoveZone2", wave3Vtols[1], undefined, undefined, wave3Extras[1]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos3", "vtolRemoveZone2", wave3Vtols[2], undefined, undefined, wave3Extras[2]);
			break;
		case "4":
			const wave4Vtols = [
				// From the southeast entrance...
				[cTempl.colagv], // Assault Guns
				[cTempl.colatv], // Lancers
				[cTempl.comacanv], // Assault Cannons
				// From the northeast entrance...
				[cTempl.comhbombv], // HEAP Bombs
				[cTempl.comthermv], // Thermite Bombs
			];
			const wave4Extras = [
				{limit: 6},
				{limit: 4},
				{limit: 4},

				{limit: 4},
				{limit: 4},
			];

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", wave4Vtols[0], undefined, undefined, wave4Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", wave4Vtols[1], undefined, undefined, wave4Extras[1]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", wave4Vtols[2], undefined, undefined, wave4Extras[2]);

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave4Vtols[3], undefined, undefined, wave4Extras[3]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave4Vtols[4], undefined, undefined, wave4Extras[4]);
			break;
		case "5":
			const wave5Vtols = [
				[cTempl.colagv], // Assault Guns
				[cTempl.comacanv], // Assault Cannons
				[cTempl.comhatv], // Tank Killers
			];
			const wave5Extras = [
				{limit: 8},
				{limit: 4},
				{limit: 6},
			];

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos5", "vtolRemoveZone2", wave5Vtols[0], undefined, undefined, wave5Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos5", "vtolRemoveZone2", wave5Vtols[1], undefined, undefined, wave5Extras[1]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos5", "vtolRemoveZone2", wave5Vtols[2], undefined, undefined, wave5Extras[2]);
			break;
		case "6":
			const wave6Vtols = [
				// From the both entrances...
				[cTempl.colagv], // Assault Guns
				[cTempl.colbombv], // Cluster Bombs
				[cTempl.comacanv], // Assault Cannons
			];
			const wave6Extras = [
				{limit: 8},
				{limit: 6},
				{limit: 4},
			];

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos3", "vtolRemoveZone2", wave6Vtols[0], undefined, undefined, wave6Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos3", "vtolRemoveZone2", wave6Vtols[1], undefined, undefined, wave6Extras[1]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos3", "vtolRemoveZone2", wave6Vtols[2], undefined, undefined, wave6Extras[2]);

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos5", "vtolRemoveZone2", wave6Vtols[0], undefined, undefined, wave6Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos5", "vtolRemoveZone2", wave6Vtols[1], undefined, undefined, wave6Extras[1]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos5", "vtolRemoveZone2", wave6Vtols[2], undefined, undefined, wave6Extras[2]);
			break;
		case "7":
			const wave7Vtols = [
				// From the southeast entrance...
				[cTempl.colagv], // Assault Guns
				[cTempl.comthermv], // Thermite Bombs
				// From the northeast entrance...
				[cTempl.colbombv], // Cluster Bombs
				[cTempl.comacanv], // Assault Cannons
			];
			const wave7Extras = [
				{limit: 8},
				{limit: 4},

				{limit: 6},
				{limit: 4},
			];

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", wave7Vtols[0], undefined, undefined, wave7Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", wave7Vtols[1], undefined, undefined, wave7Extras[1]);

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave7Vtols[2], undefined, undefined, wave7Extras[2]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave7Vtols[3], undefined, undefined, wave7Extras[3]);
			break;
		case "8":
			const wave8Vtols = [
				[cTempl.comhbombv], // HEAP Bombs
				[cTempl.comthermv], // Thermite Bombs
			];
			const wave8Extras = [
				{limit: 6},
				{limit: 6},
			];

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave8Vtols[0], undefined, undefined, wave8Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave8Vtols[1], undefined, undefined, wave8Extras[1]);
			break;
		case "9":
			const wave9Vtols = [
				// From the south entrance...
				[cTempl.colagv], // Assault Guns
				[cTempl.comacanv], // Assault Cannons
				// From the east entrance...
				[cTempl.colbombv], // Cluster Bombs
				[cTempl.comhbombv], // HEAP Bombs
				// From the north entrance...
				[cTempl.colatv], // Lancers
				[cTempl.comhatv], // Tank Killers
			];
			const wave9Extras = [
				{limit: 8},
				{limit: 4},

				{limit: 6},
				{limit: 4},

				{limit: 6},
				{limit: 4},
			];

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos3", "vtolRemoveZone2", wave9Vtols[0], undefined, undefined, wave9Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos3", "vtolRemoveZone2", wave9Vtols[1], undefined, undefined, wave9Extras[1]);

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave9Vtols[2], undefined, undefined, wave9Extras[2]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave9Vtols[3], undefined, undefined, wave9Extras[3]);

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos5", "vtolRemoveZone2", wave9Vtols[4], undefined, undefined, wave9Extras[4]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos5", "vtolRemoveZone2", wave9Vtols[5], undefined, undefined, wave9Extras[5]);
			break;
		case "10":
			const wave10Vtols = [
				// From the southeast entrance...
				[cTempl.colagv], // Assault Guns
				[cTempl.comhatv], // Tank Killers
				// From the north entrance...
				[cTempl.colphosv], // Phosphor Bombs
				[cTempl.comacanv], // Assault Cannons
			];
			const wave10Extras = [
				{limit: 8},
				{limit: 6},

				{limit: 6},
				{limit: 6},
			];

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", wave10Vtols[0], undefined, undefined, wave10Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", wave10Vtols[1], undefined, undefined, wave10Extras[1]);

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos5", "vtolRemoveZone2", wave10Vtols[2], undefined, undefined, wave10Extras[2]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos5", "vtolRemoveZone2", wave10Vtols[3], undefined, undefined, wave10Extras[3]);
			break;
		case "11":
			const wave11Vtols = [
				[cTempl.comhbombv], // HEAP Bombs
				[cTempl.comhatv], // Tank Killers
				[cTempl.comacanv], // Assault Cannons
			];
			const wave11Extras = [
				{limit: 8},
				{limit: 4},
				{limit: 4},
			];

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave11Vtols[0], undefined, undefined, wave11Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave11Vtols[1], undefined, undefined, wave11Extras[1]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave11Vtols[2], undefined, undefined, wave11Extras[2]);
			break;
	}
}

function sendCollectiveGroundWave(entry, templates, commTemplate)
{
	if (camDef(commTemplate))
	{
		// This group has a commander leader; create one
		const commLabel = "colCommander" + colCommanderIndex++;
		const commDroid = camAddDroid(CAM_THE_COLLECTIVE, entry, commTemplate);
		addLabel(commDroid, commLabel);
		camSetDroidRank(commDroid, MIS_COL_COMMANDER_RANK);
		camManageGroup(camMakeGroup(commDroid), CAM_ORDER_ATTACK, {repair: 40});

		// Send in the rest of the group; which will follow the leader
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject(entry), templates, CAM_REINFORCE_GROUND, {
			order: CAM_ORDER_FOLLOW,
			data: {
				leader: commLabel,
				repair: 40,
				suborder: CAM_ORDER_ATTACK
			}
		});
	}
	else
	{
		// No leader; just send in the group
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject(entry), templates, CAM_REINFORCE_GROUND);
	}
}

function clearGroundBlips()
{
	if (groundBlips[1]) hackRemoveMessage("COL_ENTRY1", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[2]) hackRemoveMessage("COL_ENTRY2", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[3]) hackRemoveMessage("COL_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[4]) hackRemoveMessage("COL_ENTRY4", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[5]) hackRemoveMessage("COL_ENTRY5", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[6]) hackRemoveMessage("COL_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[7]) hackRemoveMessage("COL_ENTRY7", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[8]) hackRemoveMessage("COL_ENTRY8", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[9]) hackRemoveMessage("COL_ENTRY9", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[10]) hackRemoveMessage("COL_ENTRY10", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[11]) hackRemoveMessage("COL_ENTRY11", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[12]) hackRemoveMessage("COL_ENTRY12", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[13]) hackRemoveMessage("COL_ENTRY13", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[14]) hackRemoveMessage("COL_ENTRY14", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[15]) hackRemoveMessage("COL_ENTRY15", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[16]) hackRemoveMessage("COL_ENTRY16", PROX_MSG, CAM_HUMAN_PLAYER);

	groundBlips[1] = false;
	groundBlips[2] = false;
	groundBlips[3] = false;
	groundBlips[4] = false;
	groundBlips[5] = false;
	groundBlips[6] = false;
	groundBlips[7] = false;
	groundBlips[8] = false;
	groundBlips[9] = false;
	groundBlips[10] = false;
	groundBlips[11] = false;
	groundBlips[12] = false;
	groundBlips[13] = false;
	groundBlips[14] = false;
	groundBlips[15] = false;
	groundBlips[16] = false;
}

function clearAirBlips()
{
	if (airBlips[2]) hackRemoveMessage("AIR_ENTRY2", PROX_MSG, CAM_HUMAN_PLAYER);
	if (airBlips[3]) hackRemoveMessage("AIR_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);
	if (airBlips[4]) hackRemoveMessage("AIR_ENTRY4", PROX_MSG, CAM_HUMAN_PLAYER);
	if (airBlips[5]) hackRemoveMessage("AIR_ENTRY5", PROX_MSG, CAM_HUMAN_PLAYER);

	airBlips[2] = false;
	airBlips[3] = false;
	airBlips[4] = false;
	airBlips[5] = false;
}

function startLighteningEffects()
{
	// Shift the sun slightly the east
	camSetSunPos(-225.0, -600.0, 450.0);
	lighteningEffects();

	// Start calling down lightening
	setTimer("lighteningChance", camSecondsToMilliseconds(1));
}

function lighteningChance()
{
	if (getMissionTime() < 30)
	{
		return; // Don't cause any lightening within the final 30 seconds
	}
	// Lightening chance increases as the timer ticks down
	// Decreases from 1/60 chance towards 1/30 chance
	else if (camRand((getMissionTime()  * 30 / camMinutesToSeconds(20)) + 30) === 0)
	{
		lighteningEffects();
	}
}

function lighteningEffects()
{
	// Momentarily brighten the skies
	camSetFog(198, 219, 225);
	camSetSunIntensity(.55,.55,.55);

	// ...Then gradually re-darken them
	camGradualFog(camSecondsToMilliseconds(1.6), 107, 107, 107);
	camGradualSunIntensity(camSecondsToMilliseconds(1.6), .35,.35,.35);
}

function eventMissionTimeout()
{
	if (stage === 3)
	{
		camCallOnce("endSequence");
	}
}

function endSequence()
{
	camSetExtraObjectiveMessage();

	// Disable Collective reinforcements
	removeTimer("sendCollectiveTransporter");
	removeTimer("sendCollectiveReinforcements");
	camSetVtolSpawnStateAll(false); // Disable all VTOLs

	// Disable Collective factories (if they're still alive)
	camDisableFactory("colFactory1");
	camDisableFactory("colFactory2");
	camDisableFactory("colFactory3");
	camDisableFactory("colCybFactory1");
	camDisableFactory("colCybFactory2");

	// Collective retreat
	// Grab EVERY Collective unit, and move them to the retreat position
	collectiveRetreat = true;
	const group = camNewGroup();
	const pos = camMakePos("collectiveRetreatZone");
	for (const droid of enumDroid(CAM_THE_COLLECTIVE))
	{
		// Place every droid into a new unmanaged group to avoid getting new orders
		groupAdd(group, droid);
		orderDroidLoc(droid, DORDER_MOVE, pos.x, pos.y); // Move to the retreat position
	}

	// Dialogue...
	camQueueDialogue([
		{text: "CHARLIE: Lieutenant!!!", delay: 8, sound: CAM_RCLICK},
		{text: "CHARLIE: Lieutenant! They're turning around!", delay: 4, sound: CAM_RCLICK},
		{text: "CHARLIE: The Collective is falling back!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: I don't believe it...", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We made it.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We...", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...Actually made it!", delay: 2, sound: CAM_RCLICK},
		{text: "DELTA: The Collective is pulling back to the city!", delay: 3, sound: CAM_RCLICK},
		{text: "DELTA: They finally gave up!", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: Hell yeah!", delay: 3, sound: CAM_RCLICK},
		{text: "", delay: 20, callback: "endGame"},
	]);

	// TODO: Queue transport scene & more dialogue

	// Stop the lightening
	removeTimer("lighteningChance");

	// Gradually clear the skies
	camGradualFog(camSecondsToMilliseconds(30), 198, 219, 225);
	camGradualSunIntensity(camSecondsToMilliseconds(30), .6,.6,.6);
	camSetWeather(CAM_WEATHER_CLEAR);
}

camAreaEvent("collectiveRetreatZone", function(droid)
{
	if (collectiveRetreat)
	{
		camSafeRemoveObject(droid, false);
	}
	resetLabel("collectiveRetreatZone", CAM_THE_COLLECTIVE);
});

// End the campaign in victory
function endGame()
{
	camEndMission(true);
}

// Stage 3 only fails if the player is wiped out

function trackTransporter()
{
	// Get the camera to follow the transporter
	// Transporter is the only droid of the player's on the map at this point
	const transporter = enumDroid();
	cameraTrack(transporter[0]);
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz
	const transportEntryPos = camMakePos("transporterEntry");

	setMissionTime(-1); // No time limit for this stage of the mission

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);

	setAlliance(MIS_TEAM_CHARLIE, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_TEAM_DELTA, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_TEAM_DELTA, MIS_TEAM_CHARLIE, true);
	setAlliance(MIS_CIVS, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_CIVS, CAM_THE_COLLECTIVE, true);
	setAlliance(MIS_CIVS, MIS_TEAM_CHARLIE, true);
	setAlliance(MIS_CIVS, MIS_TEAM_DELTA, true);
	setAlliance(MIS_CIV_ESCORTS, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_CIV_ESCORTS, MIS_TEAM_CHARLIE, true);
	setAlliance(MIS_CIV_ESCORTS, MIS_TEAM_DELTA, true);
	setAlliance(MIS_CIV_ESCORTS, MIS_CIVS, true);

	// Set up allied vision
	camSetObjectVision(MIS_TEAM_CHARLIE);
	camSetObjectVision(MIS_TEAM_DELTA);
	camSetObjectVision(MIS_CIV_ESCORTS);

	changePlayerColour(MIS_TEAM_CHARLIE, (playerData[0].colour !== 11) ? 11 : 5); // Charlie to bright blue or blue
	changePlayerColour(MIS_TEAM_DELTA, (playerData[0].colour !== 1) ? 1 : 8); // Delta to orange or yellow
	changePlayerColour(MIS_CIVS, 10); // Civilians to white
	changePlayerColour(MIS_CIV_ESCORTS, 10);

	camSetArtifacts({
		"colShakerEmp": { tech: "R-Wpn-HvyHowitzer" }, // Ground Shaker
	});

	camCompleteRequiredResearch(camA4L5AllyResearch, MIS_TEAM_CHARLIE);
	camCompleteRequiredResearch(camA4L5AllyResearch, MIS_TEAM_DELTA);
	camCompleteRequiredResearch(camA4L5AllyResearch, MIS_CIVS);
	camCompleteRequiredResearch(camA4L5AllyResearch, MIS_CIV_ESCORTS);
	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);

	camSetEnemyBases({
		"colShakerBase": {
			cleanup: "colBase1",
			detectMsg: "COL_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colOverlookBase": {
			cleanup: "colBase2",
			detectMsg: "COL_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colRippleBase": {
			cleanup: "colBase3",
			detectMsg: "COL_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colTrenchOutpost": {
			cleanup: "colBase4",
			detectMsg: "COL_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colFactoryBase": {
			cleanup: "colBase5",
			detectMsg: "COL_BASE5",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colCentralBase": {
			cleanup: "colBase6",
			detectMsg: "COL_BASE6",
			player: CAM_THE_COLLECTIVE,
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colSouthEastLZ": {
			cleanup: "colLZ1",
			detectMsg: "COL_LZ1",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
		"colNorthEastLZ": {
			cleanup: "colLZ2",
			detectMsg: "COL_LZ2",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
		"colCentralLZ": {
			cleanup: "colLZ3",
			detectMsg: "COL_LZ3",
			player: CAM_THE_COLLECTIVE,
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
		"colNorthLZ": {
			cleanup: "colLZ4",
			detectMsg: "COL_LZ4",
			player: CAM_THE_COLLECTIVE,
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
		"colSouthLZ": {
			cleanup: "colLZ5",
			detectMsg: "COL_LZ5",
			player: CAM_THE_COLLECTIVE,
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
		"colWestLZ": {
			cleanup: "colLZ6",
			detectMsg: "COL_LZ6",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},

		"charlieMainBase": {
			cleanup: "charlieBase1",
			friendly: true
		},
		"charlieBridgeBase": {
			cleanup: "charlieBase2",
			friendly: true
		},
		"charlieSouthBase": {
			cleanup: "charlieBase3",
			player: MIS_TEAM_CHARLIE,
			friendly: true
		},
		"charlieCentralBase": {
			cleanup: "charlieBase4",
			player: MIS_TEAM_CHARLIE,
			friendly: true
		},

		"deltaMainBase": {
			cleanup: "deltaBase1",
			friendly: true
		},
		"deltaNorthBase": {
			cleanup: "deltaBase2",
			player: MIS_TEAM_DELTA,
			friendly: true
		},
		"deltaEastBase": {
			cleanup: "deltaBase3",
			player: MIS_TEAM_DELTA,
			friendly: true
		},
		"deltaCrashHoldout": {
			cleanup: "deltaBase4",
			friendly: true
		},
	});

	const FACTORY_TIME = camChangeOnDiff(camSecondsToMilliseconds(80), true);
	const CYBORG_FACTORY_TIME = camChangeOnDiff(camSecondsToMilliseconds(40), true);
	const VTOL_FACTORY_TIME = camChangeOnDiff(camSecondsToMilliseconds(110), true);
	camSetFactories({
		"colFactory1": {
			assembly: "colAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 35
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(90)),
			// Heavy tanks
			templates: [ cTempl.cohhcant, cTempl.cohraat, cTempl.cohhrat, cTempl.cohhcant ]
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
			// Heavy + medium tanks
			templates: [ cTempl.cohhcant, cTempl.comhatt, cTempl.cominft ]
		},
		"colFactory3": {
			assembly: "colAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 45
			},
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(75)),
			// Half-tracks
			templates: [ cTempl.comhatht, cTempl.comaght, cTempl.comhpvht, cTempl.comhatht ]
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
			// Thermite Flamers + Super Grenadiers
			templates: [ cTempl.cybth, cTempl.scygr ]
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
			// Super Cyborgs
			templates: [ cTempl.scytk, cTempl.scyac ]
		},

		"charlieFactory1": {
			throttle: FACTORY_TIME,
			// These factories hold no templates; they just restock refillable groups
			templates: []
		},
		"charlieFactory2": {
			throttle: FACTORY_TIME,
			templates: []
		},
		"charlieCybFactory1": {
			throttle: CYBORG_FACTORY_TIME,
			templates: []
		},
		"charlieCybFactory2": {
			throttle: CYBORG_FACTORY_TIME,
			templates: []
		},
		"charlieCybFactory3": {
			throttle: CYBORG_FACTORY_TIME,
			templates: []
		},
		"charlieVtolFactory": {
			assembly: "charlieVtolAssembly",
			throttle: VTOL_FACTORY_TIME,
			templates: []
		},

		"deltaFactory1": {
			throttle: FACTORY_TIME,
			templates: []
		},
		"deltaFactory2": {
			throttle: FACTORY_TIME,
			templates: []
		},
		"deltaFactory3": {
			throttle: FACTORY_TIME,
			templates: []
		},
		"deltaCybFactory1": {
			throttle: CYBORG_FACTORY_TIME,
			templates: []
		},
		"deltaCybFactory2": {
			throttle: CYBORG_FACTORY_TIME,
			templates: []
		},
		"deltaVtolFactory1": {
			assembly: "deltaVtolAssembly",
			throttle: VTOL_FACTORY_TIME,
			templates: []
		},
		"deltaVtolFactory2": {
			assembly: "deltaVtolAssembly",
			throttle: VTOL_FACTORY_TIME,
			templates: []
		},
	});

	setReinforcementTime(MIS_TRANSPORT_START_TIME);

	// Auto-replace labels
	camAutoReplaceObjectLabel(["colCC", "deltaVtolTower1"]);
	// These structures aren't on the map at the start...
	camAutoReplaceObjectLabel("charlieVtolTower1", {player: MIS_TEAM_CHARLIE, x: 69, y: 73, stattype: DEFENSE});
	camAutoReplaceObjectLabel("charlieVtolTower2", {player: MIS_TEAM_CHARLIE, x: 117, y: 77, stattype: DEFENSE});
	camAutoReplaceObjectLabel("charlieVtolTower3", {player: MIS_TEAM_CHARLIE, x: 122, y: 53, stattype: DEFENSE});
	camAutoReplaceObjectLabel("deltaVtolTower2", {player: MIS_TEAM_DELTA, x: 107, y: 14, stattype: DEFENSE});
	camAutoReplaceObjectLabel("deltaVtolTower3", {player: MIS_TEAM_DELTA, x: 154, y: 47, stattype: DEFENSE});

	stage = 1;
	depositBeaconActive = false;
	truck1Safe = false;
	truck2Safe = false;
	truck3Safe = false;
	truck4Safe = false;
	trucksLost = 0;
	civGroup1 = camNewGroup();
	civGroup2 = camNewGroup();
	civGroup3 = camNewGroup();
	civGroup4 = camNewGroup();
	transportIndex = 0;
	deltaUnitIDs = [];
	deltaRescued = false;
	firstDeltaTransport = true;
	reinforcementIndex = 1;
	transportTime = MIS_TRANSPORT_START_TIME;
	charlieCommanderDeathTime = 0;
	deltaCommanderDeathTime = 0;
	collectiveRetreat = false;
	colCommanderIndex = 1;

	groundBlips = [
		null,
		false, // Blip #1
		false, // Blip #2
		false, // Blip #3
		false, // Blip #4
		false, // Blip #5
		false, // Blip #6
		false, // Blip #7
		false, // Blip #8
		false, // Blip #9
		false, // Blip #10
		false, // Blip #11
		false, // Blip #12
		false, // Blip #13
		false, // Blip #14
		false, // Blip #15
		false, // Blip #16
	];
	airBlips = [
		null,
		null,
		false, // Blip #2
		false, // Blip #3
		false, // Blip #4
		false, // Blip #5
	];

	deltaCrashGroup = camMakeGroup("deltaCrashGroup");

	// Refillable groups
	charlieCommander = camMakeRefillableGroup(
		undefined, {
			templates: [cTempl.plhcomht],
			globalFill: true,
			player: MIS_TEAM_CHARLIE,
			callback: "allowCharlieCommanderRebuild"
		}, CAM_ORDER_DEFEND, {
			pos: camMakePos("southPatrolPos1"),
			radius: 32,
			repair: 75
	});
	charlieCommandGroup = camMakeRefillableGroup(
		undefined, {
			templates: [ // 5 Tank Killers, 4 Whirlwinds, 1 Sensor, 6 Super HVCs, 6 Assault Gunners
				cTempl.plhhatht, cTempl.plhhatht,
				cTempl.plhraaht, cTempl.plhraaht,
				cTempl.scyhc, cTempl.scyhc, cTempl.scyhc,
				cTempl.cybag, cTempl.cybag, cTempl.cybag,
				cTempl.plhhatht, cTempl.plhhatht, cTempl.plhhatht,
				cTempl.plhraaht, cTempl.plhraaht,
				cTempl.plhsensht,
				cTempl.scyhc, cTempl.scyhc, cTempl.scyhc,
				cTempl.cybag, cTempl.cybag, cTempl.cybag,
			],
			globalFill: true,
			player: MIS_TEAM_CHARLIE,
		}, CAM_ORDER_FOLLOW, {
			leader: "charlieCommander",
			repair: 75,
			suborder: CAM_ORDER_DEFEND, // Retreat back to base if the commander dies
			data: {
				pos: camMakePos("southPatrolPos1"),
				radius: 32,
				repair: 75
			}
	});
	// Charlie VTOL attack group
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 3 Tank Killers, 3 Assault Guns, 3 HEAP Bombs, 3 Thermite Bombs
				cTempl.plmhatv, cTempl.plmagv, cTempl.plmhbombv, cTempl.plmtbombv,
				cTempl.plmhatv, cTempl.plmagv, cTempl.plmhbombv, cTempl.plmtbombv,
				cTempl.plmhatv, cTempl.plmagv, cTempl.plmhbombv, cTempl.plmtbombv,
			],
			globalFill: true,
			player: MIS_TEAM_CHARLIE,
			callback: "allowCharlieGeneralVtolGroup"
		}, CAM_ORDER_ATTACK, {
			repair: 75
	});
	// Charlie VTOL tower groups
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Tank Killers, 2 Assault Guns, 2 Thermite Bombs
				cTempl.plmhatv, cTempl.plmagv, cTempl.plmtbombv,
				cTempl.plmhatv, cTempl.plmagv, cTempl.plmtbombv,
			],
			globalFill: true,
			player: MIS_TEAM_CHARLIE,
			obj: "charlieVtolTower1"
		}, CAM_ORDER_FOLLOW, {
			leader: "charlieVtolTower1",
			repair: 75,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("charlieVtolAssembly"),
				radius: 28,
				repair: 75
			}
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Tank Killers, 2 Assault Guns, 2 Thermite Bombs
				cTempl.plmhatv, cTempl.plmagv, cTempl.plmtbombv,
				cTempl.plmhatv, cTempl.plmagv, cTempl.plmtbombv,
			],
			globalFill: true,
			player: MIS_TEAM_CHARLIE,
			obj: "charlieVtolTower2"
		}, CAM_ORDER_FOLLOW, {
			leader: "charlieVtolTower2",
			repair: 75,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("charlieVtolAssembly"),
				radius: 28,
				repair: 75
			}
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Tank Killers, 2 Assault Guns, 2 Thermite Bombs
				cTempl.plmhatv, cTempl.plmagv, cTempl.plmtbombv,
				cTempl.plmhatv, cTempl.plmagv, cTempl.plmtbombv,
			],
			globalFill: true,
			player: MIS_TEAM_CHARLIE,
			obj: "charlieVtolTower3"
		}, CAM_ORDER_FOLLOW, {
			leader: "charlieVtolTower3",
			repair: 75,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("charlieVtolAssembly"),
				radius: 28,
				repair: 75
			}
	});

	deltaCommander = camMakeRefillableGroup(
		undefined, {
			templates: [cTempl.plhcomt],
			globalFill: true,
			player: MIS_TEAM_DELTA,
			callback: "allowDeltaCommanderRebuild"
		}, CAM_ORDER_DEFEND, {
			pos: camMakePos("northPatrolPos1"),
			radius: 32,
			repair: 50
	});
	deltaCommandGroup = camMakeRefillableGroup(
		undefined, {
			templates: [ // 6 Assault Cannons, 4 Assault Guns, 3 Heavy Repair Turrets, 2 Whirlwinds, 6 Super Grenadiers, 1 VTOL Strike Turret
				cTempl.plhacant, cTempl.plhacant,
				cTempl.plhasgnt, cTempl.plhasgnt,
				cTempl.plhhrepht,
				cTempl.plhraat,
				cTempl.plhstriket,
				cTempl.plhacant, cTempl.plhacant,
				cTempl.plhasgnt, cTempl.plhasgnt,
				cTempl.plhhrepht,
				cTempl.plhraat, 
				cTempl.plhacant, cTempl.plhacant,
				cTempl.plhhrepht,
				cTempl.scygr, cTempl.scygr, cTempl.scygr, cTempl.scygr, cTempl.scygr, cTempl.scygr,
			],
			globalFill: true,
			player: MIS_TEAM_DELTA,
		}, CAM_ORDER_FOLLOW, {
			leader: "deltaCommander",
			repair: 50,
			suborder: CAM_ORDER_DEFEND, // Retreat back to base if the commander dies
			data: {
				pos: camMakePos("northPatrolPos1"),
				radius: 32,
				repair: 50
			}
	});
	// Delta VTOL sensor group
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 4 HVCs, 4 Assault Guns
				cTempl.plmhpvv, cTempl.plmhpvv,
				cTempl.plmagv, cTempl.plmagv,
				cTempl.plmhpvv, cTempl.plmhpvv,
				cTempl.plmagv, cTempl.plmagv,
			],
			globalFill: true,
			player: MIS_TEAM_DELTA
		}, CAM_ORDER_FOLLOW, {
			leader: "deltaVtolSensor",
			repair: 50,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("deltaVtolAssembly"),
				repair: 50,
				radius: 28
			}
	});
	// Delta VTOL tower groups
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 4 HVCs, 4 Assault Guns
				cTempl.plmhpvv, cTempl.plmhpvv,
				cTempl.plmagv, cTempl.plmagv,
				cTempl.plmhpvv, cTempl.plmhpvv,
				cTempl.plmagv, cTempl.plmagv,
			],
			globalFill: true,
			player: MIS_TEAM_DELTA,
		}, CAM_ORDER_FOLLOW, {
			leader: "deltaVtolTower1",
			repair: 50,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("deltaVtolAssembly"),
				repair: 50,
				radius: 28
			}
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 4 HVCs, 4 Assault Guns
				cTempl.plmhpvv, cTempl.plmhpvv,
				cTempl.plmagv, cTempl.plmagv,
				cTempl.plmhpvv, cTempl.plmhpvv,
				cTempl.plmagv, cTempl.plmagv,
			],
			globalFill: true,
			player: MIS_TEAM_DELTA,
		}, CAM_ORDER_FOLLOW, {
			leader: "deltaVtolTower2",
			repair: 50,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("deltaVtolAssembly"),
				repair: 50,
				radius: 28
			}
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 4 HVCs, 4 Assault Guns
				cTempl.plmhpvv, cTempl.plmhpvv,
				cTempl.plmagv, cTempl.plmagv,
				cTempl.plmhpvv, cTempl.plmhpvv,
				cTempl.plmagv, cTempl.plmagv,
			],
			globalFill: true,
			player: MIS_TEAM_DELTA,
		}, CAM_ORDER_FOLLOW, {
			leader: "deltaVtolTower3",
			repair: 50,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("deltaVtolAssembly"),
				repair: 50,
				radius: 28
			}
	});

	charlieMainBaseStructs = camAreaToStructSet("charlieBase1");
	deltaMainBaseStructs = camAreaToStructSet("deltaBase1");
	deltaHoldoutStructs = camAreaToStructSet("deltaBase4");
	colBase1Structs = camAreaToStructSet("colBase1");
	colBase2Structs = camAreaToStructSet("colBase2");
	colBase3Structs = camAreaToStructSet("colBase3");
	colBase4Structs = camAreaToStructSet("colBase4");
	colBase5Structs = camAreaToStructSet("colBase5");

	// Manage Trucks...
	// NOTE: More trucks start being managed layer as the mission progresses...
	// Charlie trucks
	charlieTruckJob1 = camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieMainBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			truckDroid: getObject("charlieTruck1"),
			structset: charlieMainBaseStructs
	});
	charlieTruckJob2 = camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieMainBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			truckDroid: getObject("charlieTruck2"),
			structset: charlieMainBaseStructs
	});
	charlieTruckJob3 = camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieMainBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			truckDroid: getObject("charlieTruck3"),
			structset: charlieMainBaseStructs
	});
	camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieMainBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_ENGINEER_TIME,
			truckDroid: getObject("charlieEngineer"),
			structset: charlieMainBaseStructs
	});	

	// Delta trucks
	deltaTruckJob1 = camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaMainBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			structset: deltaMainBaseStructs
	});
	deltaTruckJob2 = camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaMainBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			structset: deltaMainBaseStructs
	});
	deltaTruckJob3 = camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaMainBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			structset: deltaMainBaseStructs
	});
	deltaTruckJob4 = camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaMainBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			structset: deltaMainBaseStructs
	});

	// Collective LZ trucks
	colLZTruckJob1 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSouthEastLZ",
			rebuildBase: true,
			rebuildTruck: false, // Collective trucks are brought in as reinforcements
			structset: camA4L6ColLZ1Structs
	});
	colLZTruckJob2 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colNorthEastLZ",
			rebuildBase: true,
			rebuildTruck: false,
			structset: camA4L6ColLZ2Structs
	});
	colLZTruckJob3 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colCentralLZ",
			rebuildBase: true,
			rebuildTruck: false,
			structset: camA4L6ColLZ3Structs
	});
	colLZTruckJob4 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colCentralLZ",
			rebuildBase: true,
			rebuildTruck: false,
			structset: camA4L6ColLZ3Structs
	});
	colLZTruckJob5 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colNorthLZ",
			rebuildBase: true,
			rebuildTruck: false,
			truckDroid: getObject("colLZTruck1"), // This truck starts pre-placed on the map
			structset: camA4L6ColLZ4Structs
	});
	colLZTruckJob6 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colNorthLZ",
			rebuildBase: true,
			rebuildTruck: false,
			truckDroid: getObject("colLZTruck2"),
			structset: camA4L6ColLZ4Structs
	});
	colLZTruckJob7 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSouthLZ",
			rebuildBase: true,
			rebuildTruck: false,
			truckDroid: getObject("colLZTruck3"),
			structset: camA4L6ColLZ5Structs
	});
	colLZTruckJob8 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSouthLZ",
			rebuildBase: true,
			rebuildTruck: false,
			truckDroid: getObject("colLZTruck4"),
			structset: camA4L6ColLZ5Structs
	});
	colLZTruckJob9 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colWestLZ",
			rebuildBase: true,
			rebuildTruck: false,
			structset: camA4L6ColLZ6Structs
	});
	colLZTruckJob10 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colWestLZ",
			rebuildBase: true,
			rebuildTruck: false,
			structset: camA4L6ColLZ6Structs
	});

	// Remove some of the structures from the Collective's northern base
	// Also remove all of Delta's pre-placed structures
	// Also also remove all of Charlie's main defensive structures
	let deleteStructs = enumArea("colStructRemoveArea", CAM_THE_COLLECTIVE, false);
	deleteStructs = deleteStructs.concat(enumArea("deltaBase1", MIS_TEAM_DELTA, false));
	deleteStructs = deleteStructs.concat(enumArea("deltaBase4", MIS_TEAM_DELTA, false));
	deleteStructs = deleteStructs.concat(enumArea("charlieBase1", MIS_TEAM_CHARLIE, false).filter((obj) => 
		(obj.type === STRUCTURE && (obj.stattype === DEFENSE || obj.stattype === WALL))
	));
	for (const struct of deleteStructs)
	{
		camSafeRemoveObject(struct);
	}

	// Populate the civilian holdouts
	const templateLists = [
		[ // Northeast group
			cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ,
			cTempl.buggy, cTempl.rbuggy, cTempl.bjeep, cTempl.bjeep, cTempl.bjeep, cTempl.gbjeep,
			cTempl.buscan, cTempl.buscan, cTempl.firetruck,
			cTempl.monmrl, cTempl.monfire,
		], 
		[ // Southeast group
			cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ,
			cTempl.buggy, cTempl.gbjeep, cTempl.gbjeep, cTempl.trike, cTempl.rbuggy, cTempl.buggy,
			cTempl.sartruck, cTempl.buscan,
			cTempl.flatmrl, cTempl.flatat,
			cTempl.monhmg,
		], 
		[ // South river group
			cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ,
			cTempl.gbjeep, cTempl.gbjeep, cTempl.gbjeep, cTempl.bjeep,
			cTempl.minitruck, cTempl.minitruck,
		],
		[ // North river group
			cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ,
			cTempl.bjeep, cTempl.rbjeep, cTempl.bjeep,
			cTempl.firetruck, cTempl.buscan, cTempl.minitruck,
			cTempl.moncan,
		],
		[ // West group
			cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ,
			cTempl.buggy, cTempl.buggy, cTempl.rbuggy,
			cTempl.buscan,
		]
	];
	const civZones = ["civZone1", "civZone2", "civZone3", "civZone4", "civZone5"];
	const civGroups = [civGroup1, civGroup2, civGroup3, civGroup4, civGroup5];
	for (let i = 0; i < 5; i++)
	{
		const templates = templateLists[i];
		const zone = getObject(civZones[i]);
		const civGroup = civGroups[i];

		for (const template of templates)
		{
			// Choose a random position within the zone
			const pos = {x: zone.x + camRand(zone.x2 - zone.x), y: zone.y + camRand(zone.y2 - zone.y)};

			// Make some clean-looking names for the spawned units
			// ("Weapon Body Propulsion" doesn't look very good for scavenger units)
			let droidName = "";
			switch (template.body)
			{
				case "CivilianBody": 
					droidName = _("Civilian");
					break;
				case "B2JeepBody": 
				case "B2RKJeepBody": 
					droidName = _("Jeep");
					break;
				case "B4body-sml-trike01": 
					droidName = _("Trike");
					break;
				case "B3body-sml-buggy01": 
				case "B3bodyRKbuggy01": 
					droidName = _("Buggy");
					break;
				case "BusBody": 
					droidName = _("School Bus");
					break;
				case "FireBody": 
					droidName = _("Fire Truck");
					break;
				case "MonsterBus": 
					droidName = _("Bus Technical");
					break;
				case "MonsterFireBody": 
					droidName = _("Big Betty");
					break;
				case "ScavTruckBody": 
					droidName = _("Flatbed");
					break;
			}

			const newDroid = camAddDroid(MIS_CIVS, pos, template, droidName);
			groupAdd(civGroup, newDroid);
		}
	}

	// Place beacons over the civilian groups
	hackAddMessage("CIVS1", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("CIVS2", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("CIVS3", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("CIVS4", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("CIVS5", PROX_MSG, CAM_HUMAN_PLAYER);

	// Rank Charlie's commander
	// camSetDroidRank(getObject("charlieCommander"), MIS_ALLY_COMMANDER_RANK);

	// Enable these factories immediately
	camEnableFactory("charlieFactory1");
	camEnableFactory("charlieFactory2");
	camEnableFactory("charlieCybFactory1");
	camEnableFactory("charlieCybFactory2");
	camEnableFactory("charlieCybFactory3");
	camEnableFactory("charlieVtolFactory");
	camEnableFactory("deltaFactory1");
	camEnableFactory("deltaFactory2");
	camEnableFactory("deltaFactory3");
	camEnableFactory("deltaCybFactory1");
	camEnableFactory("deltaCybFactory2");
	camEnableFactory("deltaVtolFactory1");
	camEnableFactory("deltaVtolFactory2");

	queue("trackTransporter", camSecondsToMilliseconds(0.25));
	queue("startDeltaTransports", camSecondsToMilliseconds(40));
	queue("startCollectiveReinforcments", camChangeOnDiff(camMinutesToMilliseconds(5)));
	setTimer("sendCharlieTransporter", camMinutesToMilliseconds(4));

	// Shrink the map
	setScrollLimits(0, 0, 162, 96);

	// Grant the player some starting power
	setPower(camChangeOnDiff(6000), CAM_HUMAN_PLAYER);

	// Clear skies
	camSetFog(198, 219, 225);
	camSetSunIntensity(.6,.6,.6);
	camSetWeather(CAM_WEATHER_CLEAR);
	// Shift the sun towards the east
	camSetSunPos(-450.0, -400.0, 225.0);
}