include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");

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

const MIS_UPLINK = 1;
const MIS_TEAM_DELTA = 3;

var luresActive; // Whether the Infested can launch launch large attack waves against the Collective
var infestedOnslaught; // Whether the Infested are currently attacking the Collective in large numbers
var onslaughtIdx;
var numUplinkStructs; // The number of non-wall structures in the final Collective base

var colSensorGroup;
var colCommanderGroup;
var deltaGroup1;
var deltaGroup2;

camAreaEvent("heliRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("heliRemoveZone", CAM_INFESTED);
});

function heliAttack()
{
	const templates = [cTempl.infhelcan, cTempl.infhelhmg, cTempl.infhelpod];
	const ext = {
		limit: 1,
		alternate: true,
	};
	camSetVtolData(CAM_INFESTED, undefined, "heliRemoveZone", templates, camChangeOnDiff(camSecondsToMilliseconds(45)), undefined, ext);
}

// Assign a label to the Collective's sensor droid
function eventDroidBuilt(droid, structure)
{
	if (droid.player === CAM_THE_COLLECTIVE && camDroidMatchesTemplate(droid, cTempl.comsensht))
	{
		addLabel(droid, "colSensor");
	}
}

// Normal infested waves unrelated to the onslaught waves
function sendInfestedReinforcements()
{	
	const CORE_SIZE = 4;
	const FODDER_SIZE = 12;

	const coreDroids = [
		cTempl.stinger, cTempl.stinger, cTempl.stinger,
		cTempl.infbloke,  cTempl.infbloke,
		cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke,
		cTempl.infminitruck, cTempl.infminitruck,
		cTempl.infbuggy, cTempl.infbuggy, cTempl.infbuggy,
		cTempl.infrbuggy, cTempl.infrbuggy, cTempl.infrbuggy,
		cTempl.infcybhg, cTempl.infcybhg,
		cTempl.infcybca, cTempl.infcybca,
		cTempl.infcolpodt, cTempl.infcolpodt,
		cTempl.basher, cTempl.basher,
		cTempl.inflance,
		cTempl.boomtick,
	];

	// If there's an onslaught occurring, target the player instead of the Collective
	const data = {order: CAM_ORDER_ATTACK, data: {targetPlayer: (infestedOnslaught) ? CAM_HUMAN_PLAYER : CAM_THE_COLLECTIVE}}

	// South entrance
	camSendReinforcement(CAM_INFESTED, getObject("infEntry1"), camRandInfTemplates(coreDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND, data);

	// Southeast entrance
	camSendReinforcement(CAM_INFESTED, getObject("infEntry2"), camRandInfTemplates(coreDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND, data);

	// Canal entrance
	camSendReinforcement(CAM_INFESTED, getObject("infEntry3"), camRandInfTemplates(coreDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND, data);

	// Southwest entrance
	camSendReinforcement(CAM_INFESTED, getObject("infEntry4"), camRandInfTemplates(coreDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND, data);

	// West entrance (only if west base is destroyed)
	if (camBaseIsEliminated("colWestOutpost"))
	{
		camSendReinforcement(CAM_INFESTED, getObject("infEntry5"), camRandInfTemplates(coreDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND, data);
	}

	// East entrance
	camSendReinforcement(CAM_INFESTED, getObject("infEntry6"), camRandInfTemplates(coreDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND, data);

	// West Trench entrance
	camSendReinforcement(CAM_INFESTED, getObject("infEntry7"), camRandInfTemplates(coreDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND, data);
}

// Count the number of (non-wall) structures remaining in the final base
// If the number of structures falls below 2/3 of the original amount, disable the large Infested attacks
function eventDestroyed(obj)
{
	if (luresActive && obj.player === CAM_THE_COLLECTIVE)
	{
		// Count the remaining wall-type structures in the uplink base
		const STRUCTS_REMAINING = countUplinkStructs();

		if (STRUCTS_REMAINING < (numUplinkStructs * 2/3))
		{
			// Disable the Infested lures, preventing any further large Infested waves
			// If any Collective trucks are trying to rebuild destroyed outposts, order them to give up
			// NOTE: There aren't any actual lure structures on the map... 

			// TODO: Dialogue here...

			luresActive = false;
			removeTimer("startInfestedOnslaught");

			// Disable trucks
			if (camBaseIsEliminated("colEastOutpost")) camDisableTruck("colEastOutpost", true);
			if (camBaseIsEliminated("colWestOutpost")) camDisableTruck("colWestOutpost", true);
			if (camBaseIsEliminated("colNorthBase")) camDisableTruck("colNorthBase", true);
			if (camBaseIsEliminated("colTrenchOutpost")) camDisableTruck("colTrenchOutpost", true);
			if (camBaseIsEliminated("colLZBase")) camDisableTruck("colLZBase", true);

			// If there's currently an onslaught, end it immediately
			if (infestedOnslaught)
			{
				endInfestedOnslaught();
			}

			// Make sure all Collective factories are enabled
			camEnableFactory("colFactory2");
			camEnableFactory("colFactory3");
			camEnableFactory("colCybFactory2");
			camEnableFactory("colCybFactory3");
		}
	}
}

// Disable Collective if these bases are destroyed after the lures are disabled
function camEnemyBaseEliminated_colEastOutpost()
{
	if (!luresActive) camDisableTruck("colEastOutpost", true);
}

function camEnemyBaseEliminated_colWestOutpost()
{
	if (!luresActive) camDisableTruck("colWestOutpost", true);
}

function camEnemyBaseEliminated_colNorthBase()
{
	if (!luresActive) camDisableTruck("colNorthBase", true);
}

function camEnemyBaseEliminated_colTrenchOutpost()
{
	if (!luresActive) camDisableTruck("colTrenchOutpost", true);
}

function camEnemyBaseEliminated_colLZBaseOutpost()
{
	if (!luresActive) camDisableTruck("colLZBaseOutpost", true);
}

function startInfestedOnslaught()
{
	queue("endInfestedOnslaught", camSecondsToMilliseconds(90));
	infestedOnslaught = true;
	onslaughtIdx++;
	setTimer("spawnOnslaughtWaves", camSecondsToMilliseconds(15));

	// TODO: Hunker down Collective groups
	camManageGroup(colCommanderGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("colCommandPos"),
		radius: 12,
		repair: 50
	});
	camManageGroup(colSensorGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("colArtilleryPos"),
		radius: 12,
		repair: 40
	});

	// TODO: Adjust fog + lighting
}

function endInfestedOnslaught()
{
	if (!infestedOnslaught)
	{
		return;
	}

	infestedOnslaught = false;
	removeTimer("spawnOnslaughtWaves");

	// Order Collective groups to resume attacking the player
	if (onslaughtIdx >= 3)
	{
		// Commander only becomes aggressive after the third onslaught
		camManageGroup(colCommanderGroup, CAM_ORDER_ATTACK, {
			repair: 50,
			targetPlayer: CAM_HUMAN_PLAYER
		});
	}
	camManageGroup(colSensorGroup, CAM_ORDER_ATTACK, {
		repair: 40,
		targetPlayer: CAM_HUMAN_PLAYER
	});

	// Enable more factories
	if (onslaughtIdx === 1)
	{
		camEnableFactory("colFactory3");
		camEnableFactory("colCybFactory2");
	}
	else if (onslaughtIdx === 2)
	{
		camEnableFactory("colFactory2");
		camEnableFactory("colCybFactory3");
	}

	// TODO: Adjust fog + lighting
}

// Spawn large waves targeting the Collective's bases
function spawnOnslaughtWaves()
{
	const entrances = [];

	// South entrance (disabled when the east base falls)
	if (!camBaseIsEliminated("colEastOutpost"))
	{
		entrances.push("infEntry1");
	}

	// Southeast entrance (disabled when the east base falls)
	if (!camBaseIsEliminated("colEastOutpost"))
	{
		entrances.push("infEntry2");
	}

	// Southwest entrance (disabled when the west base falls)
	if (!camBaseIsEliminated("colWestOutpost"))
	{
		entrances.push("infEntry4");
	}

	if (onslaughtIdx >= 2)
	{
		// Canal entrance (disabled when the north base falls)
		if (!camBaseIsEliminated("colNorthBase"))
		{
			entrances.push("infEntry3");
		}

		// West entrance (disabled when the north base falls)
		if (!camBaseIsEliminated("colNorthBase"))
		{
			entrances.push("infEntry5");
		}
	}
	if (onslaughtIdx >= 3)
	{
		// These entrances never stop...
		entrances.push("infEntry6"); // East entrance
		entrances.push("infEntry7"); // West trench entrance
	}

	// BIG and SCARY waves!!!
	const CORE_SIZE = 16;
	const FODDER_SIZE = 24;

	const coreTemplates = [ // Waves can choose from a selection of templates
		[ // Collective tanks + Stingers + Boom Ticks
			cTempl.boomtick, // Boom Ticks
			cTempl.infcohhcant, // Heavy Cannons
			cTempl.infcommcant, cTempl.infcommcant, // Medium Cannons
			cTempl.infcomatt, // Lancers
			cTempl.infcolpodt, cTempl.infcolpodt, // MRPs
			cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.infbloke, cTempl.infbloke, // Lances
			cTempl.infkevbloke, cTempl.infkevbloke,
		],
		[ // Cyborgs + Trucks + Vile Stingers
			cTempl.vilestinger, // Vile Stingers
			cTempl.infcomtruckt, // Trucks
			cTempl.infcybhg, cTempl.infcybhg, cTempl.infcybhg, // Heavy Machinegunners
			cTempl.infcybca, cTempl.infcybca, cTempl.infcybca, // Heavy Gunners
			cTempl.infcybla, cTempl.infcybla, // Lancers
			cTempl.infscymc, // Super Heavy Gunners
			cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.infbloke, cTempl.infbloke, // Lances
			cTempl.infkevbloke, cTempl.infkevbloke,
		],
		[ // Scavenger stuff + Bashers
			cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, // Bashers
			cTempl.infmoncan, cTempl.infmoncan, // Bus Tanks
			cTempl.infmonhmg, cTempl.infmonhmg,
			cTempl.infmonmrl,
			cTempl.infmonlan,
			cTempl.infflatmrl, cTempl.infflatmrl, // Flatbeds
			cTempl.infflatat,
			cTempl.infbuscan, cTempl.infbuscan, // School Buses
			cTempl.infminitruck, cTempl.infminitruck, // MRP Trucks
			cTempl.infsartruck, // Sarissa Trucks
			cTempl.inffiretruck, // Fire Trucks
			cTempl.infbjeep, cTempl.infbjeep, cTempl.infbjeep, // Jeeps
			cTempl.infrbjeep, cTempl.infrbjeep, // Rocket Jeeps
			cTempl.infgbjeep, cTempl.infgbjeep, // Grenade Jeeps
			cTempl.infbuggy, // Buggies
			cTempl.infrbuggy, // Rocket Buggies
			cTempl.inftrike, // Trikes
			cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.infbloke, // Lances
			cTempl.infkevbloke,
		],
	];

	for (const entrance of entrances)
	{
		const data = {order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_THE_COLLECTIVE}}
		// Extra position data for specific entrances
		if (entrance === "infEntry1") data.data.pos = camMakePos("colBase1");
		if (entrance === "infEntry6" && !camBaseIsEliminated("colNorthBase")) data.data.pos = camMakePos("colBase3");

		// Send them in!
		camSendReinforcement(CAM_INFESTED, getObject(entrance), 
			camRandInfTemplates(coreTemplates[camRand(coreTemplates.length)], CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND, data);
	}
}

function countUplinkStructs()
{
	return enumArea("colBase5", CAM_THE_COLLECTIVE, false).filter((obj) => (
		obj.type === STRUCTURE && obj.stattype !== WALL && obj.stattype !== GATE
	)).length;
}

// Send in allied forces if the player has cleared enough of the defensive structures
function sendDeltaReinforcements()
{
	if (luresActive)
	{
		return;
	}

	const ENTRANCE1_STRUCTS = enumArea("deltaEntranceStructs1", CAM_THE_COLLECTIVE, false).filter((obj) => (
		obj.type === STRUCTURE && obj.stattype !== WALL
	)).length;
	const ENTRANCE2_STRUCTS = enumArea("deltaEntranceStructs2", CAM_THE_COLLECTIVE, false).filter((obj) => (
		obj.type === STRUCTURE && obj.stattype !== WALL
	)).length;

	if (ENTRANCE1_STRUCTS === 0)
	{
		// Send in Delta units from the west entrance
		const deltaDroids1 = camGetRefillableGroupTemplates(deltaGroup1);

		if (deltaDroids1.length > 0) // Don't send anything if the group is already full
		{
			const reinforcements1 = camSendReinforcement(MIS_TEAM_DELTA, getObject("deltaEntry1"), deltaDroids1, CAM_REINFORCE_GROUND);
			// Assign the reinforcement droids to the refillable group
			for (const droid of enumGroup(reinforcements1))
			{
				camGroupAdd(deltaGroup1, droid);
			}
		}
	}

	if (ENTRANCE2_STRUCTS === 0)
	{
		// Send in Delta units from the east entrance
		const deltaDroids2 = camGetRefillableGroupTemplates(deltaGroup2);

		if (deltaDroids2.length > 0) // Don't send anything if the group is already full
		{
			const reinforcements2 = camSendReinforcement(MIS_TEAM_DELTA, getObject("deltaEntry2"), deltaDroids2, CAM_REINFORCE_GROUND);
			// Assign the reinforcement droids to the refillable group
			for (const droid of enumGroup(reinforcements2))
			{
				camGroupAdd(deltaGroup2, droid);
			}
		}
	}
}

function sendCollectiveTransporter()
{
	// First, check if the LZ is still alive
	if (camBaseIsEliminated("colLZBase"))
	{
		// Try again next time...
		return;
	}

	// Next, add grab some droids for the transport
	const TRANSPORT_SIZE = (difficulty <= MEDIUM) ? 8 : 10;
	const droidPool = [
		cTempl.cominft, // Inferno
		cTempl.comagt, // Assault Gun
		cTempl.comacant, // Assault Cannon
		cTempl.cybth, // Thermite Flamer
		cTempl.cybag, // Assault Gunner
		cTempl.scygr, // Super Grenadier
		cTempl.scyac, // Super Auto Cannon
	];
	const droids = [];
	for (let i = 0; i < TRANSPORT_SIZE; i++)
	{
		droids.push(droidPool[camRand(droidPool.length)]);
	}

	// Send the transport!
	camSendReinforcement(CAM_THE_COLLECTIVE, camMakePos("landingZoneCollective"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: {x: 2, y: 2},
			exit: {x: 2, y: 2},
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 20
			}
		}
	);
}

// Returns true if the final Collective base is destroyed
// Returns false if the Uplink itself is destroyed
function uplinkSecure()
{
	// Fail if Uplink is destroyed
	if (enumStruct(MIS_UPLINK).length == 0)
	{
		return false;
	}

	if (camBaseIsEliminated("colUplinkBase"))
	{
		camCallOnce("removeUplinkBlip")
		return true;
	}
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz
	const transportEntryPos = camMakePos("transportEntryPos");

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "THE_END", {
		message: "RET_LZ",
		reinforcements: camMinutesToSeconds(4),
		area: "compromiseZone",
		callback: "uplinkSecure",
		enableLastAttack: false,
		ignoreInfestedUnits: true
	});
	camSetExtraObjectiveMessage(_("Secure the satellite uplink station"));

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_collectiveResearch, MIS_UPLINK);
	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);
	camCompleteRequiredResearch(camA3L7AllyResearch, MIS_TEAM_DELTA);

	setAlliance(MIS_UPLINK, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_UPLINK, CAM_THE_COLLECTIVE, true);
	setAlliance(MIS_UPLINK, CAM_INFESTED, true);
	setAlliance(MIS_UPLINK, MIS_TEAM_DELTA, true);
	setAlliance(MIS_TEAM_DELTA, CAM_HUMAN_PLAYER, true);

	changePlayerColour(MIS_UPLINK, 10); // Change the Uplink to white
	changePlayerColour(MIS_TEAM_DELTA, (playerData[0].colour !== 1) ? 1 : 8); // Delta to orange or yellow

	camSetArtifacts({
		"colResearch": { tech: "R-Wpn-HowitzerMk1" }, // Howitzer
	});

	camSetEnemyBases({
		"colLZBase": {
			cleanup: "colLzStructs",
			detectMsg: "COL_LZBASE",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colEastOutpost": {
			cleanup: "colBase1",
			detectMsg: "COL_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colWestOutpost": {
			cleanup: "colBase2",
			detectMsg: "COL_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colNorthBase": {
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
		"colUplinkBase": {
			cleanup: "colBase5",
			detectMsg: "COL_BASE5",
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
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(80)),
			// Medium tanks
			templates: [ cTempl.comatt, cTempl.cominft, cTempl.comagt, cTempl.commrat, cTempl.cominft ]
		},
		"colFactory2": {
			assembly: "colAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 35
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(135)),
			// Heavy tanks
			templates: [ cTempl.cohhcant, cTempl.cohacant, cTempl.cohhrat, cTempl.cohhcant, cTempl.cohbbt ]
		},
		"colFactory3": {
			assembly: "colAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 35
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(85)),
			// Medium and heavy tanks
			templates: [ cTempl.cohacant, cTempl.comhaat, cTempl.comacant, cTempl.comhatt, cTempl.comacant, cTempl.comhatt ]
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
			// Assault Gunners + Thermite Flamers
			templates: [ cTempl.cybag, cTempl.cybth ]
		},
		"colCybFactory2": {
			assembly: "colCybAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(85)),
			// Super Cannons and Grenadiers
			templates: [ cTempl.scyac, cTempl.scygr ]
		},
		"colCybFactory3": {
			assembly: "colCybAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(75)),
			// Assault Gunners + Rocket Cyborgs
			templates: [ cTempl.cybag, cTempl.cybla, cTempl.cybag, cTempl.scytk ]
		},
		"colVtolFactory": {
			assembly: "colVtolAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 2,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			templates: [ cTempl.comhatv, cTempl.comhatv, cTempl.comhbombv, cTempl.comhbombv ]
		},
	});

	hackAddMessage("UPLINK_BEACON", PROX_MSG, CAM_HUMAN_PLAYER);

	luresActive = true;
	infestedOnslaught = false;
	onslaughtIdx = 0;
	numUplinkStructs = countUplinkStructs();

	// Manage Collective VTOL groups...
	camMakeRefillableGroup(undefined, {
		templates: [ // 2 Assault Guns, 2 Phosphor Bombs
			cTempl.colagv, cTempl.colphosv,
			cTempl.colagv, cTempl.colphosv,
		],
		factories: ["colVtolFactory"],
		obj: "colVtolTower1",
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolTower1",
			suborder: CAM_ORDER_DEFEND, // Tower groups defend until tower is rebuilt
			data: {
				pos: camMakePos("colVtolAssembly"),
				radius: 12
		}
	});
	camMakeRefillableGroup(undefined, {
		templates: [ // 2 Tank Killers, 2 HEAP Bombs
			cTempl.comhatv, cTempl.comhbombv,
			cTempl.comhatv, cTempl.comhbombv,
		],
		factories: ["colVtolFactory"],
		obj: "colVtolTower2",
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolTower2",
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("colVtolAssembly"),
				radius: 12
		}
	});
	camMakeRefillableGroup(undefined, {
		templates: [ // 2 Assault Guns, 2 Phosphor Bombs
			cTempl.colagv, cTempl.colphosv,
			cTempl.colagv, cTempl.colphosv,
		],
		factories: ["colVtolFactory"],
		obj: "colVtolTower3",
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolTower3",
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("colVtolAssembly"),
				radius: 12
		}
	});
	camMakeRefillableGroup(undefined, {
		templates: [ // 2 Assault Guns, 2 Assault Cannons
			cTempl.colagv, cTempl.comacanv,
			cTempl.colagv, cTempl.comacanv,
		],
		factories: ["colVtolFactory"],
		obj: "colVtolTower4",
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolTower4",
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("colVtolAssembly"),
				radius: 12
		}
	});
	camMakeRefillableGroup(undefined, {
		templates: [ // 2 Tank Killers, 2 Assault Cannons
			cTempl.comhatv, cTempl.comacanv,
			cTempl.comhatv, cTempl.comacanv,
		],
		factories: ["colVtolFactory"],
		obj: "colVtolCBTower",
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolCBTower",
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("colVtolAssembly"),
				radius: 12
		}
	});

	// Rank and assign the Collective commander...
	// Set the commander's rank (ranges from Regular to Veteran)
	const COMMANDER_RANK = (difficulty <= EASY) ? 3 : (difficulty + 1);
	camSetDroidRank(getObject("colCommander"), COMMANDER_RANK);
	colCommanderGroup = camMakeGroup("colCommander");
	camManageGroup(colCommanderGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("colCommandPos"),
		radius: 12,
		repair: 50
	});
	camMakeRefillableGroup(camMakeGroup("colCommandGroup"), {
		templates: [
			cTempl.cohhcant, cTempl.cohhcant, // 2 Heavy Cannons
			cTempl.cohhrat, cTempl.cohhrat, // 2 HRAs
			cTempl.cominft, cTempl.cominft, // 2 Infernos
			cTempl.scyac, cTempl.scyac, // 2 Super Auto-Cannons
			cTempl.scytk, cTempl.scytk, // 2 Super Tank Killers
			cTempl.cohraat, // 1 Whirlwind
			cTempl.comhrept, // 1 Heavy Repair Turret
		],
		globalFill: true,
		obj: "colCommander" // Stop refilling this group when the commander dies
		}, CAM_ORDER_FOLLOW, {
			leader: "colCommander",
			repair: 50,
			suborder: CAM_ORDER_ATTACK,
			targetPlayer: CAM_HUMAN_PLAYER
	});

	// Also make refillable mortar/sensor groups
	colSensorGroup = camMakeRefillableGroup(undefined, {
		templates: [
			cTempl.comsensht, // 1 Sensor
		],
		factories: ["colFactory3"]
		}, CAM_ORDER_ATTACK, {
			repair: 40,
			targetPlayer: CAM_HUMAN_PLAYER
	});
	camMakeRefillableGroup(undefined, {
		templates: [
			cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, // 4 Bombards
			cTempl.cohhowt, cTempl.cohhowt, // 2 Howitzers
		],
		factories: ["colFactory3"],
		obj: "colSensor"
		}, CAM_ORDER_FOLLOW, {
			leader: "colSensor",
			repair: 60,
			suborder: CAM_ORDER_DEFEND,
			pos: camMakePos("colArtilleryPos")
	});

	// Set up Delta's uplink attack groups as well
	deltaGroup1 = camMakeRefillableGroup(undefined, {
		templates: [
			cTempl.plmacant, cTempl.plmacant, cTempl.plmacant, cTempl.plmacant, // 4 Assault Cannons
			cTempl.scygr, cTempl.scygr, cTempl.scygr, cTempl.scygr, // 4 Super Grenadiers
			cTempl.plmhrept, cTempl.plmhrept, // 2 Heavy Repair Turrets
		]}, CAM_ORDER_COMPROMISE, {
			pos: camMakePos("colUplinkBase"),
			radius: 20,
			targetPlayer: CAM_THE_COLLECTIVE
	});
	deltaGroup2 = camMakeRefillableGroup(undefined, {
		templates: [
			cTempl.plmacant, cTempl.plmacant, cTempl.plmacant, cTempl.plmacant, // 4 Assault Cannons
			cTempl.scygr, cTempl.scygr, cTempl.scygr, cTempl.scygr, // 4 Super Grenadiers
			cTempl.plmhrept, cTempl.plmhrept, // 2 Heavy Repair Turrets
		]}, CAM_ORDER_COMPROMISE, {
			pos: camMakePos("colUplinkBase"),
			radius: 20,
			targetPlayer: CAM_THE_COLLECTIVE
	});

	// Manage trucks...
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 45 : 90));
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colLZBase",
		rebuildTruck: true,
		respawnDelay: TRUCK_TIME,
		rebuildBase: (tweakOptions.rec_timerlessMode || difficulty >= MEDIUM),
		structset: camAreaToStructSet("colLzStructs"),
		truckDroid: getObject("colTruckLz")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colEastOutpost",
		rebuildTruck: true,
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		structset: camAreaToStructSet("colBase1"),
		truckDroid: getObject("colTruck1")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colWestOutpost",
		rebuildTruck: true,
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		structset: camAreaToStructSet("colBase2"),
		truckDroid: getObject("colTruck2")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colNorthBase",
		rebuildTruck: true,
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		structset: camAreaToStructSet("colBase3"),
		truckDroid: getObject("colTruck3")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colTrenchOutpost",
		rebuildTruck: true,
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		structset: camAreaToStructSet("colBase4"),
		truckDroid: getObject("colTruck4")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colUplinkBase",
		rebuildTruck: true,
		respawnDelay: TRUCK_TIME,
		structset: camAreaToStructSet("colBase5"),
		truckDroid: getObject("colTruck5")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colUplinkBase",
		rebuildTruck: true,
		respawnDelay: TRUCK_TIME,
		structset: camAreaToStructSet("colBase5"),
		truckDroid: getObject("colTruck6")
	});

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	camAutoReplaceObjectLabel(["colVtolTower1", "colVtolTower2", "colVtolTower3", "colVtolTower4", "colVtolCBTower"]);

	camEnableFactory("colVtolFactory");
	camEnableFactory("colCybFactory1");
	camEnableFactory("colFactory1");

	queue("heliAttack", camChangeOnDiff(camMinutesToMilliseconds(2)));
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(75)));
	setTimer("startInfestedOnslaught", camMinutesToMilliseconds(6));
	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(8)));
	setTimer("sendDeltaReinforcements", camMinutesToMilliseconds(2.5));

	// Lighten the fog to *more or less* 2x default brightness with a slight pink color
	camSetFog(48, 32, 96);
	// Add a purple-blue tint
	camSetSunIntensity(.5, .45, .55);
}